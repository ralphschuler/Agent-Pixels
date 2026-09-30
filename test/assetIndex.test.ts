import assert from "node:assert/strict";
import { fetchAssetIndex, parseAssetIndex, resolvePluginAssetBaseUrl } from "../src/ui/assetIndex.ts";

const installationId = "5e75ce7d-3b92-4583-ad20-d3c384480db2";
const validIndex = {
  characters: ["characters/char_0.png"],
  floors: ["floors/floor_0.png"],
  walls: ["walls/wall_0.png"],
  furniture: [
    {
      id: "desk",
      label: "Desk",
      category: "desks",
      width: 16,
      height: 16,
      footprintW: 1,
      footprintH: 1,
      isDesk: true,
      furniturePath: "furniture/desks/desk.png",
    },
  ],
  layouts: {
    office: "office.json",
    boardroomKitchen: "boardroom.json",
  },
  defaultLayout: "office.json",
};

assert.equal(
  resolvePluginAssetBaseUrl("https://paperclip.test/_plugins/install/ui/index.js", "/company/agent-pixels"),
  "https://paperclip.test/_plugins/install/ui/assets/",
);
assert.equal(
  resolvePluginAssetBaseUrl("blob:https://paperclip.test/module", `/_plugins/${installationId}/ui/index.js`),
  `/_plugins/${installationId}/ui/assets/`,
);
assert.equal(
  resolvePluginAssetBaseUrl("blob:https://paperclip.test/module", "/INH/agent-pixels", installationId),
  `/_plugins/${installationId}/ui/assets/`,
);
assert.throws(
  () => resolvePluginAssetBaseUrl("blob:https://paperclip.test/module", "/INH/agent-pixels"),
  /installation ID/,
);

assert.deepEqual(parseAssetIndex(validIndex), validIndex);
assert.throws(() => parseAssetIndex({ error: "Internal server error" }), /malformed/);

await assert.rejects(
  fetchAssetIndex("/_plugins/install/ui/assets/", async () =>
    new Response('{"error":"Internal server error"}', { status: 500, statusText: "Internal Server Error" })),
  /500 Internal Server Error/,
);

assert.deepEqual(
  await fetchAssetIndex("/_plugins/install/ui/assets/", async () =>
    new Response(JSON.stringify(validIndex), { status: 200 })),
  validIndex,
);

console.log("Asset index tests passed");
