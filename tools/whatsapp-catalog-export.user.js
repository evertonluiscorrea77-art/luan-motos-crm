// ==UserScript==
// @name         Luan Motos - Exportador de Catálogo WhatsApp
// @namespace    luan-motos-crm
// @version      0.2.0
// @description  Exporta o catálogo do WhatsApp Web com fotos e JSON para o CRM Luan Motos.
// @match        https://web.whatsapp.com/*
// @require      https://github.com/wppconnect-team/wa-js/releases/download/nightly/wppconnect-wa.js
// @require      https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

/* globals WPP, JSZip */

(() => {
  'use strict';

  const MAX_PRODUCTS = 500;
  const BRAND_NAMES = [
    'Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'BMW', 'Triumph', 'Ducati',
    'KTM', 'Dafra', 'Shineray', 'Haojue', 'Bajaj', 'Royal Enfield',
    'Harley-Davidson', 'Harley Davidson', 'Avelloz', 'Zontes', 'Kymco'
  ];
  const COLOR_NAMES = [
    'preta', 'preto', 'branca', 'branco', 'vermelha', 'vermelho', 'azul',
    'cinza', 'prata', 'verde', 'amarela', 'amarelo', 'laranja', 'dourada',
    'dourado', 'marrom', 'bege', 'roxa', 'roxo'
  ];

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const unique = (arr) => [...new Set(arr.filter(Boolean))];
  const slugify = (value) => String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 90) || 'moto';

  function activeChatId() {
    const chat = WPP.chat.getActiveChat();
    if (!chat) return '';
    const id = chat.id;
    return id?._serialized || id?.toString?.() || String(id || '');
  }

  async function catalogChatCandidates() {
    const activeId = activeChatId();
    if (!activeId) throw new Error('Não consegui identificar a conversa aberta.');

    const candidates = [];
    if (activeId.endsWith('@lid') && WPP.contact?.getPnLidEntry) {
      setStatus('Convertendo o contato do WhatsApp…', 2);
      try {
        const mapping = await WPP.contact.getPnLidEntry(activeId);
        const phoneId = mapping?.phoneNumber?._serialized;
        if (phoneId) candidates.push(phoneId);
      } catch (error) {
        console.warn('[LM Export] Não foi possível converter @lid para @c.us', error);
      }
    }

    candidates.push(activeId);
    return unique(candidates.filter((id) => /@(c\.us|lid|s\.us)$/.test(id)));
  }

  async function loadCatalog() {
    const candidates = await catalogChatCandidates();
    if (!candidates.length) throw new Error('A conversa aberta não parece ser um contato válido do WhatsApp.');

    let lastError;
    for (const chatId of candidates) {
      try {
        setStatus(`Lendo catálogo de ${chatId.split('@')[0]}…`, 4);
        const products = await WPP.catalog.getProducts(chatId, MAX_PRODUCTS);
        if (Array.isArray(products) && products.length) {
          return { chatId, products };
        }
      } catch (error) {
        lastError = error;
        console.warn('[LM Export] Falha ao consultar catálogo com', chatId, error);
      }
    }

    if (lastError) throw lastError;
    throw new Error('Nenhum item de catálogo foi encontrado nessa conversa.');
  }

  function parsePrice(raw) {
    if (raw === null || raw === undefined || raw === '') return null;
    const cleaned = String(raw).replace(/[^0-9.-]/g, '');
    const n = Number(cleaned);
    if (!Number.isFinite(n) || n <= 0) return null;
    if (n >= 1_000_000) return Math.round((n / 10_000) * 100) / 100;
    return n;
  }

  function deriveMotorcycle(detail) {
    const name = String(detail.name || '').trim();
    const description = String(detail.description || '').trim();
    const haystack = `${name} ${description}`;
    const lower = haystack.toLowerCase();
    const yearMatch = haystack.match(/\b(20(?:0\d|1\d|2\d))\b/);
    const year = yearMatch ? Number(yearMatch[1]) : null;
    let brand = BRAND_NAMES.find((b) => lower.includes(b.toLowerCase())) || '';
    if (!brand) brand = name.split(/\s+/)[0] || '';
    let model = name;
    if (brand) model = model.replace(new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '');
    if (year) model = model.replace(new RegExp(`\\b${year}\\b`, 'g'), '');
    model = model.replace(/\s{2,}/g, ' ').replace(/^[-–—|/\s]+|[-–—|/\s]+$/g, '').trim();
    if (!model) model = name || 'Modelo a revisar';
    const kmMatch = lower.match(/\b(\d{1,3}(?:[.\s]\d{3})+|\d{1,6})\s*(?:km|kms|quil[oô]metros?)\b/i);
    const mileage = kmMatch ? Number(kmMatch[1].replace(/\D/g, '')) : 0;
    const engineMatch = lower.match(/\b(\d{2,4})\s*cc\b/i);
    const engine = engineMatch ? `${engineMatch[1]} cc` : '';
    const colorWord = COLOR_NAMES.find((c) => new RegExp(`\\b${c}\\b`, 'i').test(lower));
    const color = colorWord ? colorWord.charAt(0).toUpperCase() + colorWord.slice(1) : '';
    const askingPrice = parsePrice(detail.price ?? detail.priceAmount1000);
    return {
      brand, model, version: '', year, mileage, engine, color, askingPrice, description,
      ownership: 'propria', status: 'disponivel', featured: false, published: true,
      reviewRequired: !year || !brand || !model || !askingPrice
    };
  }

  function collectUrls(value, bag = []) {
    if (!value) return bag;
    if (typeof value === 'string') {
      if (/^https?:\/\//i.test(value)) bag.push(value);
      return bag;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => collectUrls(item, bag));
      return bag;
    }
    if (typeof value === 'object') {
      for (const key of ['value', 'url', 'mediaUrl', 'imageCdnUrl', 'image_cdn_url', 'full', 'requested']) {
        if (key in value) collectUrls(value[key], bag);
      }
    }
    return bag;
  }

  function imageUrls(detail) {
    const main = Array.isArray(detail.image_cdn_urls) ? detail.image_cdn_urls : [];
    const preferredMain = main.find((x) => x?.key === 'full')?.value
      || main.find((x) => x?.key === 'requested')?.value
      || collectUrls(main)[0];
    const additional = collectUrls(detail.additional_image_cdn_urls || []);
    const modelImages = collectUrls([detail.imageCdnUrl, detail.productImageCollection]);
    return unique([preferredMain, ...additional, ...modelImages]);
  }

  function dataUrlToBlob(dataUrl) {
    const [header, data] = dataUrl.split(',');
    const mime = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
    const bytes = atob(data);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  async function fetchImage(url) {
    try {
      const response = await fetch(url, { credentials: 'omit' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) throw new Error('Resposta não é imagem');
      return blob;
    } catch {
      const converted = await WPP.util.downloadImage(url, 'image/jpeg', 1);
      return dataUrlToBlob(converted.data);
    }
  }

  function extFor(blob) {
    const t = blob.type.toLowerCase();
    if (t.includes('png')) return 'png';
    if (t.includes('webp')) return 'webp';
    if (t.includes('gif')) return 'gif';
    return 'jpg';
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  function makeUi() {
    if (document.getElementById('lm-catalog-exporter')) return;
    const box = document.createElement('div');
    box.id = 'lm-catalog-exporter';
    box.style.cssText = [
      'position:fixed', 'right:18px', 'bottom:18px', 'z-index:2147483647',
      'font-family:system-ui,-apple-system,Segoe UI,sans-serif', 'width:300px',
      'background:#111b21', 'border:1px solid rgba(255,255,255,.14)',
      'border-radius:16px', 'padding:14px', 'box-shadow:0 18px 50px rgba(0,0,0,.35)',
      'color:#e9edef'
    ].join(';');
    box.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div><b style="font-size:14px">LM · Catálogo → CRM</b><div id="lm-status" style="font-size:12px;color:#8696a0;margin-top:3px">Abra a conversa da loja.</div></div>
        <span style="width:9px;height:9px;background:#00a884;border-radius:50%"></span>
      </div>
      <button id="lm-export" style="margin-top:12px;width:100%;border:0;border-radius:10px;padding:11px 12px;background:#00a884;color:#071a13;font-weight:800;cursor:pointer">Exportar catálogo completo</button>
      <div id="lm-progress" style="display:none;margin-top:10px;height:6px;background:#202c33;border-radius:999px;overflow:hidden"><i style="display:block;height:100%;width:0;background:#00a884;transition:width .2s"></i></div>
      <div style="font-size:11px;color:#667781;margin-top:9px;line-height:1.35">Gera 1 ZIP com fotos + catalogo.json. Nenhuma mensagem é enviada.</div>
    `;
    document.body.appendChild(box);
    const button = document.getElementById('lm-export');
    button.addEventListener('click', () => {
      setStatus('Clique recebido. Validando WhatsApp…', 1);
      setTimeout(() => exportCatalog(), 50);
    });
  }

  function setStatus(text, progress = null) {
    const status = document.getElementById('lm-status');
    const bar = document.getElementById('lm-progress');
    if (status) status.textContent = text;
    if (bar && progress !== null) {
      bar.style.display = 'block';
      const fill = bar.querySelector('i');
      if (fill) fill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
    }
  }

  async function exportCatalog() {
    const button = document.getElementById('lm-export');
    if (button.disabled) return;
    button.disabled = true;
    button.style.opacity = '0.72';
    button.textContent = 'Exportando…';

    try {
      if (!window.WPP?.catalog?.getProducts) {
        throw new Error('A biblioteca do WhatsApp ainda não terminou de carregar. Aguarde 5 segundos e tente de novo.');
      }
      const authenticated = WPP?.conn?.isAuthenticated?.();
      if (authenticated === false) throw new Error('WhatsApp Web ainda não está autenticado.');

      setStatus('Identificando a conversa aberta…', 2);
      const { chatId, products } = await loadCatalog();
      setStatus(`Catálogo encontrado: ${products.length} itens.`, 5);

      if (typeof JSZip === 'undefined') {
        throw new Error('O módulo ZIP não carregou. Recarregue o WhatsApp e tente novamente.');
      }
      const zip = new JSZip();
      const exported = [];
      let imageCount = 0;
      let failedImages = 0;

      for (let i = 0; i < products.length; i++) {
        const base = products[i];
        const productId = String(base?.id?.toString?.() || base?.id || base?.productId || '');
        if (!productId) continue;

        setStatus(`Moto ${i + 1}/${products.length}: carregando dados…`, 5 + (i / products.length) * 86);
        let detail;
        try {
          detail = await WPP.catalog.getProductById(chatId, productId);
        } catch (error) {
          console.warn('[LM Export] Falha ao detalhar produto', productId, error);
          detail = { ...base, id: productId };
        }

        const derived = deriveMotorcycle(detail);
        const folderName = `${String(i + 1).padStart(3, '0')}-${slugify(detail.name || derived.model)}-${productId}`;
        const urls = imageUrls(detail);
        const savedImages = [];

        for (let j = 0; j < urls.length; j++) {
          setStatus(`Moto ${i + 1}/${products.length}: foto ${j + 1}/${urls.length}`, 5 + ((i + (j / Math.max(1, urls.length))) / products.length) * 86);
          try {
            const blob = await fetchImage(urls[j]);
            const filename = `${String(j + 1).padStart(2, '0')}.${extFor(blob)}`;
            zip.file(`motos/${folderName}/${filename}`, blob, { binary: true });
            savedImages.push(`motos/${folderName}/${filename}`);
            imageCount++;
          } catch (error) {
            failedImages++;
            console.warn('[LM Export] Falha na imagem', urls[j], error);
          }
          await sleep(60);
        }

        exported.push({
          whatsapp: {
            productId, chatId, retailerId: detail.retailer_id || '', name: detail.name || '',
            description: detail.description || '', currency: detail.currency || 'BRL',
            priceRaw: detail.price ?? detail.priceAmount1000 ?? null, url: detail.url || '',
            availability: detail.availability || '', hidden: Boolean(detail.is_hidden)
          },
          crm: { ...derived, images: savedImages }
        });
        await sleep(120);
      }

      const manifest = {
        format: 'luan-motos-whatsapp-catalog-v1', exportedAt: new Date().toISOString(), sourceChatId: chatId,
        totalProducts: exported.length, totalImages: imageCount, failedImages, motorcycles: exported
      };
      zip.file('catalogo.json', JSON.stringify(manifest, null, 2));
      zip.file('LEIA-ME.txt', [
        'LUAN MOTOS — EXPORTAÇÃO DO CATÁLOGO DO WHATSAPP', '', `Itens: ${exported.length}`,
        `Fotos: ${imageCount}`, `Fotos com falha: ${failedImages}`, '',
        'Envie este ZIP para o ChatGPT no projeto do CRM Luan Motos.',
        'O arquivo catalogo.json contém os dados brutos do WhatsApp e os campos pré-estruturados do CRM.',
        'Itens com reviewRequired=true devem ser conferidos antes da publicação final.'
      ].join('\n'));

      setStatus('Montando ZIP…', 94);
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' }, (meta) => {
        setStatus(`Montando ZIP… ${Math.round(meta.percent)}%`, 94 + meta.percent * 0.05);
      });
      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(zipBlob, `luan-motos-catalogo-whatsapp-${date}.zip`);
      setStatus(`Pronto: ${exported.length} motos e ${imageCount} fotos.`, 100);
    } catch (error) {
      console.error('[LM Export]', error);
      setStatus(error instanceof Error ? error.message : 'Falha ao exportar catálogo.');
    } finally {
      button.disabled = false;
      button.style.opacity = '1';
      button.textContent = 'Exportar catálogo completo';
    }
  }

  function boot() {
    const ready = () => { makeUi(); setStatus('v0.2 pronta. Abra a conversa da loja.'); };
    if (window.WPP?.isReady || window.WPP?.isFullReady) ready();
    else if (window.WPP?.loader?.onReady) WPP.loader.onReady(ready);
    else setTimeout(boot, 1500);
  }

  setTimeout(boot, 1500);
})();
