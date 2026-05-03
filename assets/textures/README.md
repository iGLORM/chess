# Textures

Drop PNG images here to replace the default pixel art.

## Folders

- `boards/` — square textures
- `pieces/` — piece sprites
- `backgrounds/` — full-screen backgrounds

## Naming

### Board squares
`<themeId>_light.png` and `<themeId>_dark.png`

Examples:
- `boards/space_light.png`
- `boards/space_dark.png`
- `boards/medieval_light.png`
- `boards/medieval_dark.png`

Available theme IDs: `space`, `medieval`, `ocean`, `egypt`, `cyberpunk`, `japanese`, `artdeco`, `wildwest`, `prehistoric`, `steampunk`

### Pieces
`<themeId>_<color>_<type>.png`

Examples:
- `pieces/space_white_knight.png`
- `pieces/space_black_queen.png`
- `pieces/medieval_white_pawn.png`

Types: `pawn`, `rook`, `knight`, `bishop`, `queen`, `king`

### Backgrounds
`<themeId>_bg.png`

Example:
- `backgrounds/space_bg.png`

## Tips
- Keep piece sprites square (e.g. 64x64 or 128x128).
- Board square textures should also be square (e.g. 64x64 or 128x128); they get stretched to fit each square.
- Backgrounds should be 1280x800 to match the game window.
- The game falls back to generated pixel art for any missing texture.
