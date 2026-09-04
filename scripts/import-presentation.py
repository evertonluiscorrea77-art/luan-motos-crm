"""Convert the supplied catalog export into presentation assets; never upscale."""
import io
import json
import re
import hashlib
import zipfile
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
archive = Path('/workspace/scratch/74adea7dedf9/upload/luan-motos-catalogo-whatsapp-2026-09-04.zip')
old = (root / 'lib/catalog-data.ts').read_text()
records = []
for line in old.splitlines():
    if line.strip().startswith('{id:'):
        name = re.search(r'version:"([^"]+)"', line)
        if name:
            records.append((name.group(1), line))
data = []
with zipfile.ZipFile(archive) as z:
    export = json.loads(z.read('catalogo.json'))
    for index, product in enumerate(export['motorcycles']):
        name = product['whatsapp']['name']
        candidates = [line for title, line in records if title.casefold() == name.casefold()]
        if not candidates:
            raise ValueError('No verified price/identity for ' + name)
        previous = candidates[0]
        def number(key):
            return int(re.search(r'\b' + key + r':(\d+)', previous).group(1))
        def string(key):
            return re.search(r'\b' + key + r':"([^"]*)"', previous).group(1)
        image_paths = []
        hashes = set()
        dest = root / 'public/catalog/presentation' / product['whatsapp']['productId']
        dest.mkdir(parents=True, exist_ok=True)
        for source in product['crm']['images']:
            image = ImageOps.exif_transpose(Image.open(io.BytesIO(z.read(source)))).convert('RGB')
            if min(image.size) < 400:
                continue
            digest = hashlib.sha256(image.tobytes()).hexdigest()
            if digest in hashes:
                continue
            hashes.add(digest)
            target = dest / f'{len(image_paths)+1:02}.webp'
            image.save(target, 'WEBP', quality=90, method=6)
            image_paths.append('/' + target.relative_to(root/'public').as_posix())
        if not image_paths:
            raise ValueError('No large images for ' + name)
        stamp = '2026-09-04T15:11:49.156Z'
        data.append(dict(id=number('id'),slug=string('slug'),brand=string('brand'),
            model=string('model'),version=name,year=number('year'),mileage=0,engine='',color='',
            askingPrice=number('askingPrice'),purchasePrice=None,minimumPrice=None,salePrice=None,
            ownership='consignada',status='disponivel',featured=index<3,published=True,
            description=product['whatsapp']['description'],features='[]',images=json.dumps(image_paths),
            acquiredAt=stamp,soldAt=None,createdAt=stamp,updatedAt=stamp))
        print(name, '—', len(image_paths), 'fotos — R$', number('askingPrice'))
(root/'lib/presentation-catalog.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Total:',len(data),'motos;',sum(len(json.loads(m['images'])) for m in data),'fotos')
