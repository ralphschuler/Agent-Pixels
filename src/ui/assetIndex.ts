export type FurnitureAsset = {
  id: string;
  label: string;
  category: string;
  width: number;
  height: number;
  footprintW: number;
  footprintH: number;
  isDesk: boolean;
  groupId?: string;
  orientation?: string;
  state?: string;
  rotationScheme?: string;
  animationGroup?: string;
  frame?: number;
  canPlaceOnSurfaces?: boolean;
  backgroundTiles?: number;
  canPlaceOnWalls?: boolean;
  mirrorSide?: boolean;
  furniturePath: string;
};

export type AssetIndex = {
  characters: string[];
  floors: string[];
  walls: string[];
  furniture: FurnitureAsset[];
  layouts?: {
    office: string;
    boardroomKitchen: string;
  };
  defaultLayout: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isFurnitureAsset(value: unknown): value is FurnitureAsset {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.category === "string" &&
    typeof value.width === "number" &&
    typeof value.height === "number" &&
    typeof value.footprintW === "number" &&
    typeof value.footprintH === "number" &&
    typeof value.isDesk === "boolean" &&
    typeof value.furniturePath === "string"
  );
}

export function parseAssetIndex(value: unknown): AssetIndex {
  if (
    !isRecord(value) ||
    !isStringArray(value.characters) ||
    !isStringArray(value.floors) ||
    !isStringArray(value.walls) ||
    !Array.isArray(value.furniture) ||
    !value.furniture.every(isFurnitureAsset) ||
    typeof value.defaultLayout !== "string"
  ) {
    throw new Error("Plugin asset index is malformed");
  }

  if (
    value.layouts !== undefined &&
    (!isRecord(value.layouts) ||
      typeof value.layouts.office !== "string" ||
      typeof value.layouts.boardroomKitchen !== "string")
  ) {
    throw new Error("Plugin asset index has malformed layout paths");
  }

  return value as AssetIndex;
}

export function resolvePluginAssetBaseUrl(metaUrl: string, pathname: string, pluginId?: string): string {
  if (metaUrl && !metaUrl.startsWith("blob:")) {
    return new URL("./assets/", metaUrl).toString();
  }

  const pluginMatch = pathname.match(/\/_plugins\/[^/]+\/ui\//);
  if (pluginMatch) return `${pluginMatch[0]}assets/`;

  if (pluginId) return `/_plugins/${encodeURIComponent(pluginId)}/ui/assets/`;

  throw new Error("Paperclip did not provide the plugin installation ID needed to load assets");
}

export async function fetchAssetIndex(
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<AssetIndex> {
  const url = `${baseUrl}agent-pixels-assets.json`;
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch plugin asset index (${response.status} ${response.statusText})`);
  }
  return parseAssetIndex(await response.json());
}
