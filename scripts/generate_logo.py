from pathlib import Path
import random

from PIL import Image, ImageDraw, ImageFont, ImageFilter


WIDTH, HEIGHT = 1200, 400
BG = "#1a0f2e"
GOLD = "#fff5a0"
DARK_GOLD = "#c9a96e"
PURPLE = "#4d3b8e"
MINT = "#88d8b0"
CORAL = "#ff6f61"
BLACK = "#000000"

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "logo.png"


def load_font(size, bold=False, mono=False):
    windows = Path("C:/Windows/Fonts")
    candidates = []
    if mono:
        candidates.extend(
            [
                windows / ("consolab.ttf" if bold else "consola.ttf"),
                windows / "courbd.ttf",
                windows / "cour.ttf",
                Path("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"),
                Path("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"),
                Path("/usr/share/fonts/truetype/liberation2/LiberationMono-Bold.ttf"),
                Path("/usr/share/fonts/truetype/liberation2/LiberationMono-Regular.ttf"),
            ]
        )
    else:
        candidates.extend(
            [
                windows / ("segoeuib.ttf" if bold else "segoeui.ttf"),
                windows / ("arialbd.ttf" if bold else "arial.ttf"),
                Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
                Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
            ]
        )

    for candidate in candidates:
        if candidate.exists():
            try:
                return ImageFont.truetype(str(candidate), size)
            except OSError:
                pass

    try:
        return ImageFont.truetype("DejaVuSansMono-Bold.ttf" if mono else "DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def draw_stars(draw):
    random.seed(22)
    star_colors = [(255, 255, 255), (255, 248, 199), (214, 248, 232)]
    for _ in range(185):
        x = random.randint(5, WIDTH - 6)
        y = random.randint(5, HEIGHT - 6)
        radius = random.choice([1, 1, 1, 2])
        alpha = random.randint(90, 230)
        color = random.choice(star_colors) + (alpha,)
        draw.ellipse((x, y, x + radius, y + radius), fill=color)


def draw_halo(base):
    halo = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(halo)
    cx, cy = 185, 205
    for i in range(9, 0, -1):
        rx = 18 + i * 17
        ry = 14 + i * 13
        alpha = 9 + i * 4
        hdraw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(136, 216, 176, alpha))
    halo = halo.filter(ImageFilter.GaussianBlur(16))
    base.alpha_composite(halo)


def draw_pixel_rect(draw, x, y, block, color):
    draw.rectangle((x, y, x + block - 1, y + block - 1), fill=color)


def draw_knight(draw):
    block = 7
    origin_x = 112
    origin_y = 124

    # O = outline, G = gold, D = darker gold, E = eye.
    knight = [
        "......OOO.........",
        ".....OGGGO........",
        "....OGGGGGDO......",
        "...OGGGGGGGGO.....",
        "..OGGGGOOGGGGO....",
        "..OGGGO..OGGGGO...",
        ".OGGGO.E.OGGGGO...",
        ".OGGGDOOOGGGGGO...",
        "OGGGGGGGGGGGGO....",
        "OGGGGGGDDGGGGO....",
        ".OGGGGGGGGGGO.....",
        "..OGGGGGGGGO......",
        "...OGGGGGGO.......",
        "..OGGGGGGGGO......",
        ".OGGGGDDGGGGO.....",
        "OGGGGO..OGGGO.....",
        "OGGGO....OGGGO....",
        "OGGGG....GGGGO....",
        "OOOOO....OOOOO....",
    ]

    for row_i, row in enumerate(knight):
        for col_i, cell in enumerate(row):
            if cell == ".":
                continue
            x = origin_x + col_i * block
            y = origin_y + row_i * block
            color = {
                "O": PURPLE,
                "G": GOLD,
                "D": DARK_GOLD,
                "E": BG,
            }[cell]
            draw_pixel_rect(draw, x, y, block, color)

    # Extra darker-gold cheek and neck pixels add horse-head detail.
    accents = [(5, 4), (6, 5), (8, 8), (9, 8), (7, 10), (8, 10), (5, 13), (6, 14), (5, 16)]
    for col, row in accents:
        draw_pixel_rect(draw, origin_x + col * block, origin_y + row * block, block, DARK_GOLD)

    # Purple nostril and jaw definition.
    details = [(12, 5), (11, 6), (9, 12), (4, 15), (5, 17)]
    for col, row in details:
        draw_pixel_rect(draw, origin_x + col * block, origin_y + row * block, block, PURPLE)


def draw_crown(draw):
    block = 7
    ox, oy = 143, 78
    crown = [
        "..G...G...G..",
        ".GGG.GGG.GGG.",
        "GGGGGGGGGGGGG",
        ".DDDDDDDDDDD.",
        ".GGGGGGGGGGG.",
    ]
    for row_i, row in enumerate(crown):
        for col_i, cell in enumerate(row):
            if cell == ".":
                continue
            draw_pixel_rect(
                draw,
                ox + col_i * block,
                oy + row_i * block,
                block,
                GOLD if cell == "G" else DARK_GOLD,
            )

    # Purple underside for separation from the halo.
    draw.rectangle((ox + block, oy + len(crown) * block, ox + 12 * block - 1, oy + 6 * block - 1), fill=PURPLE)


def draw_text(draw):
    title_font = load_font(96, bold=True, mono=True)
    subtitle_font = load_font(28, bold=False, mono=False)
    tech_font = load_font(18, bold=False, mono=True)

    x, y = 325, 96
    shadow_offset = 3
    chess = "CHESS"
    gap = 24

    draw.text((x + shadow_offset, y + shadow_offset), chess, font=title_font, fill=BLACK)
    chess_w = draw.textbbox((x, y), chess, font=title_font)[2] - x
    two_x = x + chess_w + gap
    draw.text((two_x + shadow_offset, y + shadow_offset), "2.0", font=title_font, fill=BLACK)

    draw.text((x, y), chess, font=title_font, fill=GOLD)
    draw.text((two_x, y), "2.0", font=title_font, fill=MINT)

    subtitle = "A Pixel Chess Adventure"
    subtitle_y = 222
    draw.text((x + 1, subtitle_y + 2), subtitle, font=subtitle_font, fill=(0, 0, 0, 150))
    draw.text((x, subtitle_y), subtitle, font=subtitle_font, fill=CORAL)

    line_y = 276
    draw.line((x, line_y, 875, line_y), fill=MINT, width=3)

    tech = "Electron | Canvas | Vanilla JS | Custom Engine"
    draw.text((x, 300), tech, font=tech_font, fill=PURPLE)


def draw_decorative_squares(draw):
    random.seed(42)
    colors = [GOLD, MINT, CORAL]
    positions = [
        (928, 74, 8),
        (1002, 54, 12),
        (1092, 94, 8),
        (1138, 154, 14),
        (948, 188, 10),
        (1040, 230, 8),
        (1118, 262, 12),
        (1000, 330, 10),
        (1166, 320, 8),
        (902, 314, 8),
    ]
    for i, (x, y, size) in enumerate(positions):
        draw.rectangle((x, y, x + size - 1, y + size - 1), fill=colors[i % len(colors)])

    for _ in range(16):
        size = random.choice([5, 6, 7, 8])
        x = random.randint(900, 1165)
        y = random.randint(35, 355)
        draw.rectangle((x, y, x + size - 1, y + size - 1), fill=random.choice(colors))


def main():
    image = Image.new("RGBA", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(image, "RGBA")

    draw_stars(draw)
    draw_halo(image)
    draw = ImageDraw.Draw(image, "RGBA")
    draw_crown(draw)
    draw_knight(draw)
    draw_text(draw)
    draw_decorative_squares(draw)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT, "PNG")
    print(f"Generated {OUTPUT} ({WIDTH}x{HEIGHT})")


if __name__ == "__main__":
    main()
