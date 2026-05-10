# AGENT.md

Instructions for AI agents working on this codebase.

## Telegram Mini App Sync

This game is deployed as a **Telegram Mini App** alongside the Electron desktop app. Both use the **same `src/index.html`** — there is no separate web version.

### Rules for keeping Telegram in sync

1. **Never create a separate web entry point.** All changes go in `src/index.html` and `src/` — the same files Electron uses.
2. **When adding a new `<script>` tag to `index.html`**, it automatically works on both Electron and Telegram. No extra step needed.
3. **When adding new asset files** (images, textures, audio), place them in `assets/` as usual. The VPS nginx config serves `assets/` via an alias.
4. **Telegram-specific code** lives in `src/telegram/telegram-compat.js`. Always guard with `if (window.Telegram && window.Telegram.WebApp)`.
5. **Never use `window.electron` without a guard.** Always check `if (window.electron)` first — it doesn't exist in the web environment.
6. **The vendored pretext library** is at `src/vendor/pretext/`. If `@chenglou/pretext` is updated via npm, re-copy its `dist/` to `src/vendor/pretext/`.
7. **Do not add Node.js-specific APIs** (fs, path, child_process) to any file in `src/`. The renderer code must stay browser-compatible.
8. **Touch events**: `src/main.js` has `touchstart`/`touchend`/`touchmove` listeners alongside mouse events. When adding new input handlers, support both.

### Deployment

Deployment is manual from the main dev PC only (the only machine with VPS SSH access). After making changes:

```bash
scp -r src assets vps:/var/www/chess2/
ssh vps "sudo chmod -R o+rX /var/www/chess2/"
```

### Bot details

- **Bot username**: `@iglorm_chess_bot`
- **Mini App URL**: `https://game.altobolt.com`
- **VPS nginx root**: `/var/www/chess2/src` (assets aliased from `/var/www/chess2/assets/`)
