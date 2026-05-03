#!/usr/bin/env python3
"""
Extract board textures and pieces from a photographed chess board.

Usage: drop a photo of a standard chess board in assets/dropbox/ as <theme>_board.jpg
       or any .jpg/.png, then run this script.

It will:
  1. Detect the board grid
  2. Extract clean light/dark square textures
  3. Extract all 12 unique piece types with transparent backgrounds
  4. Save to assets/textures/boards/, pieces/, backgrounds/
"""
import os
import math
from PIL import Image

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DROPBOX = os.path.join(PROJECT, 'assets', 'dropbox')
TEXTURES = os.path.join(PROJECT, 'assets', 'textures')

ALL_THEMES = [
    'space', 'medieval', 'ocean', 'egypt', 'cyberpunk',
    'japanese', 'artdeco', 'wildwest', 'prehistoric', 'steampunk'
]

# Standard starting position mapping (row, col) → piece name
# row 0 = rank 8 (black), row 7 = rank 1 (white)
STARTING_PIECES = {
    (0,0): 'black_rook', (0,1): 'black_knight', (0,2): 'black_bishop', (0,3): 'black_queen',
    (0,4): 'black_king', (0,5): 'black_bishop', (0,6): 'black_knight', (0,7): 'black_rook',
    (1,0): 'black_pawn', (1,1): 'black_pawn', (1,2): 'black_pawn', (1,3): 'black_pawn',
    (1,4): 'black_pawn', (1,5): 'black_pawn', (1,6): 'black_pawn', (1,7): 'black_pawn',
    (6,0): 'white_pawn', (6,1): 'white_pawn', (6,2): 'white_pawn', (6,3): 'white_pawn',
    (6,4): 'white_pawn', (6,5): 'white_pawn', (6,6): 'white_pawn', (6,7): 'white_pawn',
    (7,0): 'white_rook', (7,1): 'white_knight', (7,2): 'white_bishop', (7,3): 'white_queen',
    (7,4): 'white_king', (7,5): 'white_bishop', (7,6): 'white_knight', (7,7): 'white_rook',
}

def detect_board(img):
    """Detect a standard 8x8 chess board. Returns (border, sq_size)."""
    w, h = img.size
    best_score = float('inf')
    best = None

    for border in range(0, min(w, h) // 10, 2):
        usable = min(w, h) - 2 * border
        if usable < 400:
            continue
        sq = usable / 8
        if abs(sq - round(sq)) > 0.5:
            continue
        sq = round(sq)

        score = 0
        for row in range(8):
            for col in range(8):
                x = border + col * sq + sq // 2
                y = border + row * sq + sq // 2
                if x >= w or y >= h:
                    continue
                px = img.getpixel((x, y))

                # Check neighbor differences
                if col < 7:
                    nx = border + (col + 1) * sq + sq // 2
                    npx = img.getpixel((nx, y))
                    score += abs(sum(px) - sum(npx))
                if row < 7:
                    ny = border + (row + 1) * sq + sq // 2
                    npy = img.getpixel((x, ny))
                    score += abs(sum(px) - sum(npy))

        if score < best_score:
            best_score = score
            best = (border, sq)

    return best

def get_square_avg(img, border, sq, row, col):
    x1 = border + col * sq
    y1 = border + row * sq
    x2 = x1 + sq
    y2 = y1 + sq
    square = img.crop((x1, y1, x2, y2))
    pixels = list(square.getdata())
    n = len(pixels)
    r = sum(p[0] for p in pixels) / n
    g = sum(p[1] for p in pixels) / n
    b = sum(p[2] for p in pixels) / n
    return (r, g, b), pixels

def get_square_variance(pixels):
    n = len(pixels)
    avg_r = sum(p[0] for p in pixels) / n
    avg_g = sum(p[1] for p in pixels) / n
    avg_b = sum(p[2] for p in pixels) / n
    var = (sum((p[0] - avg_r)**2 for p in pixels) / n +
           sum((p[1] - avg_g)**2 for p in pixels) / n +
           sum((p[2] - avg_b)**2 for p in pixels) / n)
    return math.sqrt(var)

def extract_board_and_pieces(img_path, theme):
    img = Image.open(img_path).convert('RGB')
    result = detect_board(img)
    if not result:
        print(f"Could not detect board grid in {img_path}")
        return

    border, sq = result
    print(f"Detected board: border={border}px, square={sq}px")

    # Calculate stats for all squares
    stats = {}
    for row in range(8):
        for col in range(8):
            avg, pixels = get_square_avg(img, border, sq, row, col)
            std = get_square_variance(pixels)
            stats[(row, col)] = {'avg': avg, 'std': std}

    # Determine light/dark board colors from cleanest squares
    clean = sorted(stats.items(), key=lambda x: x[1]['std'])
    clean_colors = [s['avg'] for _, s in clean[:24]]

    light = max(clean_colors, key=lambda c: sum(c))
    dark = min(clean_colors, key=lambda c: sum(c))

    for _ in range(5):
        lg = [c for c in clean_colors if math.dist(c, light) < math.dist(c, dark)]
        dg = [c for c in clean_colors if math.dist(c, dark) <= math.dist(c, light)]
        if lg:
            light = tuple(sum(c[i] for c in lg) / len(lg) for i in range(3))
        if dg:
            dark = tuple(sum(c[i] for c in dg) / len(dg) for i in range(3))

    print(f"Light square: ({light[0]:.0f}, {light[1]:.0f}, {light[2]:.0f})")
    print(f"Dark square:  ({dark[0]:.0f}, {dark[1]:.0f}, {dark[2]:.0f})")

    # Save board textures
    boards_dir = os.path.join(TEXTURES, 'boards')
    os.makedirs(boards_dir, exist_ok=True)

    # Find cleanest light and dark squares
    light_sq = None
    dark_sq = None
    for (row, col), s in clean:
        if light_sq is None and math.dist(s['avg'], light) < 30:
            light_sq = (row, col)
        if dark_sq is None and math.dist(s['avg'], dark) < 30:
            dark_sq = (row, col)
        if light_sq and dark_sq:
            break

    if light_sq:
        r, c = light_sq
        x1 = border + c * sq
        y1 = border + r * sq
        sq_img = img.crop((x1, y1, x1 + sq, y1 + sq))
        sq_img.save(os.path.join(boards_dir, f'{theme}_light.png'))
        print(f"Saved {theme}_light.png")

    if dark_sq:
        r, c = dark_sq
        x1 = border + c * sq
        y1 = border + r * sq
        sq_img = img.crop((x1, y1, x1 + sq, y1 + sq))
        sq_img.save(os.path.join(boards_dir, f'{theme}_dark.png'))
        print(f"Saved {theme}_dark.png")

    # Save background (full board image scaled to 1280x800)
    bg_dir = os.path.join(TEXTURES, 'backgrounds')
    os.makedirs(bg_dir, exist_ok=True)
    bg = img.resize((1280, 800), Image.LANCZOS)
    bg.save(os.path.join(bg_dir, f'{theme}_bg.png'))
    print(f"Saved {theme}_bg.png")

    # Extract pieces with background removal
    pieces_dir = os.path.join(TEXTURES, 'pieces')
    os.makedirs(pieces_dir, exist_ok=True)

    extracted = set()
    for (row, col), name in STARTING_PIECES.items():
        # Only extract unique piece types once
        if name in extracted:
            continue
        extracted.add(name)

        x1 = border + col * sq
        y1 = border + row * sq
        x2 = x1 + sq
        y2 = y1 + sq

        # Determine board color for this square
        file_idx = col + 1
        rank = 8 - row
        is_dark = (file_idx + rank) % 2 == 0
        board_color = dark if is_dark else light

        square = img.crop((x1, y1, x2, y2)).convert('RGBA')
        pixels = list(square.getdata())

        # Create transparent background
        new_pixels = []
        for p in pixels:
            dist = math.sqrt(sum((p[i] - board_color[i])**2 for i in range(3)))
            if dist < 20:
                new_pixels.append((0, 0, 0, 0))
            else:
                # Edge smoothing
                alpha = min(255, max(0, int(255 * (dist - 20) / 15)))
                new_pixels.append((p[0], p[1], p[2], alpha))

        square.putdata(new_pixels)

        # Scale to 64x64 for game use
        piece_img = square.resize((64, 64), Image.LANCZOS)
        piece_img.save(os.path.join(pieces_dir, f'{theme}_{name}.png'))
        print(f"Saved {theme}_{name}.png")

    print(f"\nDone! Extracted board textures + 12 pieces for theme '{theme}'.")

def main():
    files = [f for f in os.listdir(DROPBOX) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    if not files:
        print("No image files in dropbox.")
        return

    for f in files:
        # Determine theme from filename: <theme>_board.jpg or just use the name
        base = os.path.splitext(f)[0]
        if base.endswith('_board'):
            theme = base[:-6]
        else:
            # Ask or default
            theme = base.replace(' ', '_').lower()

        print(f"\nProcessing {f} for theme '{theme}'...")
        extract_board_and_pieces(os.path.join(DROPBOX, f), theme)

if __name__ == '__main__':
    main()
