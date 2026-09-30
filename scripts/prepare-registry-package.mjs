#!/usr/bin/env node

import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [packageName, outputPath, repositoryUrl] = process.argv.slice(2);
const verifyOnly = packageName === "--verify";

if (!verifyOnly && (!packageName || !outputPath || !repositoryUrl)) {
  throw new Error("Usage: prepare-registry-package.mjs <package-name> <output-path> <repository-url>");
}

if (!verifyOnly && packageName !== packageName.toLowerCase()) {
  throw new Error(`Package name must be lowercase: ${packageName}`);
}

const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const manifestSource = await readFile(path.join(root, "src/manifest.ts"), "utf8");
const manifestVersion = manifestSource.match(/export const PLUGIN_VERSION = "([^"]+)";/)?.[1];

if (manifestVersion !== packageJson.version) {
  throw new Error(`Version mismatch: package.json=${packageJson.version}, manifest=${manifestVersion ?? "missing"}`);
}

const releaseTag = process.env.RELEASE_TAG;
if (releaseTag && releaseTag !== `v${packageJson.version}`) {
  throw new Error(`Release tag ${releaseTag} must equal v${packageJson.version}`);
}

const releasePrerelease = process.env.RELEASE_PRERELEASE;
const versionIsPrerelease = packageJson.version.split("+", 1)[0].includes("-");
if (releasePrerelease && (releasePrerelease === "true") !== versionIsPrerelease) {
  throw new Error(`Release prerelease flag must match version ${packageJson.version}`);
}

if (verifyOnly) {
  console.log(`Verified release v${packageJson.version}`);
  process.exit(0);
}

const outputDir = path.resolve(root, outputPath);
const releaseRoot = path.join(root, "release");
if (!outputDir.startsWith(`${releaseRoot}${path.sep}`)) {
  throw new Error("Output path must be inside release/");
}

const publishPackage = {
  ...packageJson,
  name: packageName,
  private: undefined,
  packageManager: undefined,
  scripts: undefined,
  devDependencies: undefined,
  repository: {
    type: "git",
    url: `git+${repositoryUrl}.git`,
  },
  files: ["dist"],
};

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(path.join(root, "README.md"), path.join(outputDir, "README.md"));
await cp(path.join(root, "dist"), path.join(outputDir, "dist"), { recursive: true });
await writeFile(path.join(outputDir, "package.json"), `${JSON.stringify(publishPackage, null, 2)}\n`);
