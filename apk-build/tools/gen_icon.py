#!/usr/bin/env python3
"""生成极速101 APK 启动图标（纯标准库，无第三方依赖）。
绘制：青色圆角方块底 + 白色仪表盘圆环 + 红色指针。"""
import os
import struct
import zlib

BASE = 512
GREEN_TOP = (10, 156, 124)      # #0a9c7c
GREEN_BOT = (6, 122, 99)        # #067a63
WHITE = (255, 255, 255)
DARK = (51, 51, 51)             # #333
RED = (255, 107, 107)           # #ff6b6b


def make_icon(size):
    img = [[(0, 0, 0, 0) for _ in range(BASE)] for _ in range(BASE)]

    cx, cy = BASE / 2, BASE / 2
    radius = BASE * 0.44
    corner = BASE * 0.20
    inset = (BASE - 2 * radius) / 2

    def in_rounded_rect(x, y):
        left, top = inset, inset
        right, bottom = inset + 2 * radius, inset + 2 * radius
        if left + corner <= x <= right - corner or top + corner <= y <= bottom - corner:
            return left <= x <= right and top <= y <= bottom
        # 四角圆角判定
        corners = [(left + corner, top + corner), (right - corner, top + corner),
                   (left + corner, bottom - corner), (right - corner, bottom - corner)]
        for cxx, cyy in corners:
            if (x - cxx) ** 2 + (y - cyy) ** 2 <= corner ** 2:
                return True
        return False

    for y in range(BASE):
        t = y / (BASE - 1)
        bg = tuple(int(GREEN_TOP[i] + (GREEN_BOT[i] - GREEN_TOP[i]) * t) for i in range(3))
        for x in range(BASE):
            if not in_rounded_rect(x, y):
                continue
            img[y][x] = (*bg, 255)

    # 仪表盘圆环
    ring_outer = BASE * 0.34
    ring_inner = BASE * 0.26
    for y in range(BASE):
        for x in range(BASE):
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            if ring_inner <= d <= ring_outer:
                img[y][x] = (*WHITE, 255)

    # 红色指针（指向右上，模拟速度表）
    import math
    for y in range(BASE):
        for x in range(BASE):
            dx, dy = x - cx, y - cy
            if dx * dx + dy * dy > ring_inner ** 2:
                continue
            # 指针方向角（指向右上方）
            ang = math.atan2(-dy, dx)
            if -math.radians(85) <= ang <= -math.radians(5) and abs(dx) > 0:
                # 近似细指针
                perp = abs(dx * math.sin(-math.radians(45)) - (-dy) * math.cos(-math.radians(45)))
                if perp < BASE * 0.03:
                    img[y][x] = (*RED, 255)

    # 中心圆点
    for y in range(BASE):
        for x in range(BASE):
            if (x - cx) ** 2 + (y - cy) ** 2 <= (BASE * 0.045) ** 2:
                img[y][x] = (*DARK, 255)

    # 缩放并输出
    scale = size / BASE
    out = [[(0, 0, 0, 0) for _ in range(size)] for _ in range(size)]
    for oy in range(size):
        sy = min(int(oy / scale), BASE - 1)
        for ox in range(size):
            sx = min(int(ox / scale), BASE - 1)
            out[oy][ox] = img[sy][sx]
    return out


def write_png(path, pixels, size):
    rows = []
    for y in range(size):
        row = bytearray([0])
        for x in range(size):
            r, g, b, a = pixels[y][x]
            row += bytes((r, g, b, a))
        rows.append(bytes(row))
    raw = b"".join(rows)

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        c += struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        return c

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", ihdr)
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


if __name__ == "__main__":
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "res", "mipmap")
    sizes = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
    for dpi, size in sizes.items():
        d = os.path.join(root, f"mipmap-{dpi}")
        os.makedirs(d, exist_ok=True)
        px = make_icon(size)
        write_png(os.path.join(d, "ic_launcher.png"), px, size)
        print(f"wrote mipmap-{dpi}/ic_launcher.png ({size}x{size})")
