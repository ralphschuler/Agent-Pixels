# Agent Pixels

![Agent Pixels logo banner](public/assets/brand/agent-pixels-logo-banner.jpg)

Agent Pixels is a Paperclip plugin that turns your company of AI agents into a live pixel-art office camera.

Learn more at [agent-pixels.com](https://agent-pixels.com).![X](https://img.shields.io/twitter/follow/gcampton)



![Agent Pixels hero image](public/assets/brand/agent-pixels-hero.jpg)

## What It Does

- Shows Paperclip agents walking around a multi-room pixel office.
- Moves working agents toward desks and idle agents toward lounge, kitchen, boardroom, and games areas.
- Supports multiple camera views across the office layout.
- Includes assignable character sprites so each agent can have a consistent look.
- Expands the original pixel-agent style into a denser company view for larger Paperclip teams.

## Screenshots

![Agent Pixels camera screenshot](public/assets/brand/agent-pixels-screenshot-camera.jpg)

![Agent Pixels character picker screenshot](public/assets/brand/agent-pixels-screenshot-characters.jpg)

## Install

### Release Version

Use the release version if you just want to install Agent Pixels. The release ZIP already contains the built plugin files, so you do not need the Paperclip source code or plugin SDK locally.

Prerequisites:

- Paperclip running
- The latest `agent-pixels-*.zip` release file

Download the latest `agent-pixels-*.zip` from the GitHub Releases page, then unzip it into your Paperclip plugins folder:

```text
~/.paperclip/plugins/
```

After unzipping, you should have a folder like this:

```text
agent-pixels-0.1.1/
  package.json
  README.md
  dist/
    manifest.js
    worker.js
    ui/
```

For Docker installs, unzip the release into a bind-mounted folder and install the path as seen from inside the container, for example:

```text
/paperclip/plugins/agent-pixels-0.1.1
```

### Development Version

Use the development version if you want to edit Agent Pixels or build it from source.

Prerequisites:

- Node.js 24.11.0 or newer
- pnpm
- Paperclip running

Clone and build Agent Pixels:

```bash
git clone https://github.com/gcampton/Agent-Pixels
cd Agent-Pixels
pnpm install
pnpm run build
```

The build output is written to `dist/`.

The published plugin SDK is installed automatically. To test against a locally built SDK instead, set its path when building:

```bash
PAPERCLIP_SDK_DIST=/path/to/paperclip/packages/plugins/sdk/dist pnpm run build
```

Then install the plugin in Paperclip using the local path to this repo.

To create a release ZIP after building:

```bash
pnpm run package:release
```

This requires the `zip` command-line tool. The ZIP is written to `release/`.

### Package Registries

`.github/workflows/publish-packages.yml` validates pull requests, builds an immutable package artifact on `main`, and promotes that artifact when a matching `v<package-version>` GitHub Release is published. Repository variables are independent and default to off:

| Variable | Effect when set to `true` |
| --- | --- |
| `PUBLISH_GITHUB_PACKAGES` | Publishes `@<repository-owner>/agent-pixels` to GitHub Packages. |
| `PUBLISH_NPM` | Publishes `NPM_PACKAGE_NAME` to npmjs. |

Configure these under **Settings → Secrets and variables → Actions**. For npm, also set a lowercase `NPM_PACKAGE_NAME` that you own. Bootstrap the first publish with a granular `NPM_TOKEN` repository secret; afterward configure npm Trusted Publishing for `publish-packages.yml` and remove the secret. GitHub Packages uses `GITHUB_TOKEN` and needs no extra secret; set the package visibility after its first publish if it should be public.

Before publishing, update both `package.json` and `PLUGIN_VERSION` in `src/manifest.ts`, then create the matching `v<version>` release.

For fork testing, use a fork-owned test package name and a new prerelease version. Do not consume the canonical upstream package name or version.

If `NPM_PACKAGE_NAME` changes, merge or push a new `main` commit before creating the release so the promoted artifact contains the new name.

Create the GitHub Release only after the matching `main` run of **Publish packages** is green.

## Development

Run checks before opening a pull request:

```bash
pnpm test
pnpm run typecheck
pnpm run build
```

### Self-Hosted Docker Install

For self-hosted Paperclip, clone Agent Pixels into a folder that is visible inside the Paperclip container. The install API must receive the container path, not the host path.

Example host path:

```bash
git clone https://github.com/gcampton/Agent-Pixels /volume4/docker/paperclip/plugins/agent-pixels
```

Example container path:

```text
/paperclip/plugins/agent-pixels
```

Build Agent Pixels with its published plugin SDK dependency:

```bash
cd /path/to/Agent-Pixels
pnpm install
pnpm run build
```

Set `PAPERCLIP_SDK_DIST=/path/to/paperclip/packages/plugins/sdk/dist` only when testing against a locally built SDK.

In authenticated Paperclip deployments, create a CLI auth challenge and approve it as an instance admin:

```bash
curl -s -X POST http://<your-paperclip-host>/api/cli-auth/challenges \
  -H "Content-Type: application/json" \
  -d '{"requestedAccess":"instance_admin_required","command":"plugin install"}'
```

Open the returned `approvalUrl`, approve the request, then install using the returned `boardApiToken`:

```bash
curl -s -X POST http://<your-paperclip-host>/api/plugins/install \
  -H "Authorization: Bearer <boardApiToken>" \
  -H "Content-Type: application/json" \
  -d '{"packageName":"/paperclip/plugins/agent-pixels","isLocalPath":true}'
```

## Assets

Character sprites live in:

```text
public/assets/characters/
```

Add new sprites as `char_81.png`, `char_82.png`, etc. The build script auto-detects `char_*.png` files and adds them to the plugin asset index.

### Asset Dimensions

Agent Pixels uses a 16px tile grid.

| Asset type | Location | Size |
| --- | --- | --- |
| Character sprite sheet | `public/assets/characters/char_*.png` | `112x96` PNG |
| Character frame | inside each character sheet | `16x32` |
| Character sheet layout | inside each character sheet | `7` columns x `3` rows |
| Floor tile | `public/assets/floors/floor_*.png` | `16x16` |
| Wall tile sheet | `public/assets/walls/wall_0.png` | `64x128` |
| Furniture sprites | `public/assets/furniture/**` | Multiples of `16px` |
| Office layout | `public/assets/default-layout-1.json` | `21x22` tiles (`336x352px`) |
| Boardroom/kitchen layout | `public/assets/agent-pixels-layout-boardroom-kitchen.json` | `22x15` tiles (`352x240px`) |
| Combined camera map | generated in the UI | `68x22` tiles (`1088x352px`) |

Character sheets use three direction rows: front, back, and side. The opposite side direction is mirrored by the renderer.

Common furniture sizes currently in use:

| Asset | Size |
| --- | --- |
| Desk front | `48x32` |
| Desk side | `16x64` |
| PC sprites | `16x32` |
| Wooden/cushioned chairs | `16x32` or `16x16` |
| Sofa front/back | `32x16` |
| Sofa side | `16x32` |
| Boardroom table | `48x80` |
| Pool table | `80x48` |
| Arcade machine | `32x48` |
| Paintings/whiteboard | `16x32` or `32x32` |
| Plants | `16x32` or `32x48` |

## Ready-Made Paperclip Companies

Agent Pixels is free to use. It is also designed to work nicely with ready-made Paperclip company packs that are available at [agent-pixels.com](https://agent-pixels.com).

Paperclip company packs include:

- SEO agency
- Game dev agency
- SaaS company
- Full company

More company types are being explored. Agent Pixel Company packs are built from Garratt's personal agents developed over many months. Agents come with a Task Router Engine and extensive reference files to grep. Scraped from high quality web data, these make whatever AI you use on par with pretrained AI LLMs without having to do the work. For example, the Copywriter comes with over 7 reference files to grep and 6 different task files for the right job.

## Support

For feature requests, bugs, or help using Agent Pixels, please submit a ticket at [agent-pixels.com/support](https://www.agent-pixels.com/support).

## What's Next

Planned improvements include:

- More character models and customization options.
- More visual assets, props, and office interactions.
- Adjustable office scale, including desks, meeting rooms, lounges, and floors.
- Additional layouts such as co-working spaces, agency lofts, and high-rise offices.
- Better idle behaviors and animations, including talking, pacing, and coffee runs.

## Contributing

Pull requests are welcome for bug fixes, plugin improvements, new room assets, furniture, and character sprites.

For commercial enquiries, ready-made Paperclip company packs, or larger collaboration ideas, start at [agent-pixels.com](https://agent-pixels.com).
