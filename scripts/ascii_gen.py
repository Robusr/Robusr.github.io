#!/usr/bin/env python3
"""
Generate a dual-colour ASCII pixel-art logo: italic text + wrench icon.

Renders the target string in italic (shear transform) alongside a
pixel-art wrench, combines them into one wide canvas, binarises,
and emits a JavaScript LOGO_LINES array + LOGO_SPLIT ready for
index.html.

Usage:
    python3 scripts/ascii_gen.py
    python3 scripts/ascii_gen.py "Robusr" 110 14 20

Dependencies: Pillow (pip install Pillow)
"""

import sys
from PIL import Image, ImageDraw, ImageFont

TEXT        = sys.argv[1] if len(sys.argv) > 1 else 'Robusr'
CANVAS_W    = int(sys.argv[2]) if len(sys.argv) > 2 else 110
CANVAS_H    = int(sys.argv[3]) if len(sys.argv) > 3 else 14
FONT_SIZE   = int(sys.argv[4]) if len(sys.argv) > 4 else 20
SHEAR       = 0.25          # italic slant
THRESH_BIAS = 0.40          # lower = more foreground


def make_wrench(w, h):
    """Return a (w x h) PIL image of a pixel-art wrench."""
    img = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(img)
    pattern = [
        '        ####        ',
        '       ######       ',
        '##################  ',
        '####################',
        '####################',
        '####################',
        '##################  ',
        '       ######       ',
        '       ######       ',
        '       ######       ',
        '       ######       ',
        '       ######       ',
        '        ####        ',
        '         ##         ',
    ]
    for y, row in enumerate(pattern):
        if y >= h:
            break
        for x, ch in enumerate(row):
            if x >= w:
                break
            if ch == '#':
                draw.point((x, y), fill=240)
    return img


def main():
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', FONT_SIZE)
    except Exception:
        font = ImageFont.load_default()

    # ---- Italic text ----
    txt_w, txt_h = 180, CANVAS_H + 4
    txt_img = Image.new('L', (txt_w, txt_h), 0)
    txt_draw = ImageDraw.Draw(txt_img)
    txt_draw.text((2, 0), TEXT, fill=255, font=font)

    sheared = txt_img.transform(
        (int(txt_w + txt_h * SHEAR), txt_h),
        Image.AFFINE, (1, 0, 0, SHEAR, 1, 0), Image.BILINEAR
    )
    sbox = sheared.getbbox()
    if sbox:
        sheared = sheared.crop(sbox)

    # ---- Wrench ----
    wrench = make_wrench(24, CANVAS_H)

    # ---- Combine ----
    gap = 4
    combined_w = sheared.width + gap + wrench.width
    combined = Image.new('L', (combined_w, CANVAS_H), 0)
    ty = max(0, CANVAS_H - sheared.height)
    combined.paste(sheared, (0, ty))
    wy = max(0, CANVAS_H - wrench.height)
    combined.paste(wrench, (sheared.width + gap, wy))

    # ---- Binarise ----
    pixels = list(combined.getdata())
    nonzero = [p for p in pixels if p > 15]
    thresh = (sum(nonzero) / len(nonzero)) * THRESH_BIAS if nonzero else 100

    lines = []
    for row in range(CANVAS_H):
        line = ''
        for col in range(combined_w):
            idx = row * combined_w + col
            line += '#' if pixels[idx] > thresh else ' '
        lines.append(line)

    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()

    widths = set(len(l) for l in lines)
    split_at = sheared.width
    print(f'// {len(lines)} lines, widths={widths}, total_w={combined_w}',
          file=sys.stderr)
    print(f'// split_at (text|wrench) = {split_at}', file=sys.stderr)
    print(f'// thresh = {thresh:.1f}', file=sys.stderr)

    print('const LOGO_LINES = [')
    for l in lines:
        print(f"'{l.ljust(combined_w)}',")
    print('];')
    print(f'const LOGO_SPLIT = {split_at};')


if __name__ == '__main__':
    main()
