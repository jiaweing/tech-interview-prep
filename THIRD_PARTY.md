# Third-party code and data

## Bundled into index.html

| What | Version | License | Where |
|---|---|---|---|
| [@anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-typescript) | 1.14.0 | Apache License 2.0 ([text](app/public/vendor/anthropic-sdk.LICENSE)) | `app/public/vendor/anthropic-sdk.js`, used only when the page runs outside claude.ai |
| [voice-glow](https://libraries.dev/voice) by Jakub Antalik | 0.5.0 | MIT | `app/vendor/voiceglow.js` |
| [Preact](https://preactjs.com) | 10 | MIT | `app/vendor/voiceglow.js` (runs Voice Glow) |

## Loaded from a CDN at runtime

| What | Version | License |
|---|---|---|
| [Brython](https://brython.info) | 3.12.4 | BSD 3-Clause |
| [CodeMirror](https://codemirror.net/5/) | 5.65.16 | MIT |
| [Mermaid](https://mermaid.js.org) | 11.4.1 | MIT |
| [Rough.js](https://roughjs.com) | 4.6.6 | MIT |
| Geist, Geist Mono and Inter from Google Fonts | | SIL Open Font License 1.1 |

## Data

- `app/public/leetcode.json` holds titles, URL slugs, difficulty, topic tags and acceptance rates from LeetCode's public problem list, so the app can link to each problem. No problem statements are included. LeetCode is a trademark of its owner.
- Company packs in `app/public/packs/` summarise public candidate reports and link their sources.
- Videos are linked, not included, and belong to their creators.
