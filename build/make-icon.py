#!/usr/bin/env python3
"""Generate build/icon.png — the Sermon Note Clipper app icon.

A vertical (9:16) "reel" with a play triangle on the brand blue/indigo gradient,
on a rounded squircle. Run: `venv/bin/python build/make-icon.py`
(electron-builder converts this PNG to .icns at package time).
"""
import os
import numpy as np
from PIL import Image, ImageDraw

SIZE = 1024
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "icon.png")

# Diagonal gradient background.
c1 = np.array([29, 78, 216])    # #1d4ed8
c2 = np.array([79, 70, 229])    # #4f46e5
ramp = np.linspace(0, 1, SIZE)
xx, yy = np.meshgrid(ramp, ramp)
t = (xx + yy) / 2.0
grad = (c1[None, None, :] + (c2 - c1)[None, None, :] * t[:, :, None]).astype("uint8")
bg = Image.fromarray(grad, "RGB").convert("RGBA")

# Rounded-square (macOS squircle-ish) mask.
mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=232, fill=255)

icon = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
icon.paste(bg, (0, 0), mask)
draw = ImageDraw.Draw(icon)

# White vertical reel frame (9:16).
fw, fh = 372, 612
fx0, fy0 = (SIZE - fw) // 2, (SIZE - fh) // 2
draw.rounded_rectangle([fx0, fy0, fx0 + fw, fy0 + fh], radius=64, fill=(255, 255, 255, 255))

# Play triangle (brand blue) centered in the frame.
cx, cy = SIZE // 2, SIZE // 2
draw.polygon(
    [(cx - 78, cy - 104), (cx - 78, cy + 104), (cx + 104, cy)],
    fill=(37, 99, 235, 255),
)

icon.save(OUT)
print(f"wrote {OUT} ({icon.size[0]}x{icon.size[1]})")
