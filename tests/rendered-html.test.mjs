import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
test("builds the Luan Motos worker and product metadata", async () => {
  await access(new URL("../dist/server/index.js", import.meta.url));
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /Luan Motos/);
  assert.match(layout, /Campina Grande/);
});
