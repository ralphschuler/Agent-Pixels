#!/usr/bin/env node

import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = await build({
  entryPoints: [path.join(root, "test/assetIndex.test.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  write: false,
});

const source = Buffer.from(result.outputFiles[0].contents).toString("base64");
await import(`data:text/javascript;base64,${source}`);
