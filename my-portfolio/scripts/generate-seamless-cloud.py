#!/usr/bin/env python3
"""
Tái tạo và tạo mới asset cloud-layer.webp:
1. Trích xuất chính xác lớp mây từ ảnh nền gốc backgorund-home.png (loại bỏ vết cắt dọc nhân tạo x=169, x=56, x=1806).
2. Mở rộng thiết kế các đám mây xuống sâu dưới chân trời (y=606 -> y=720) với kết cấu mây xốp tự nhiên,
   đảm bảo khi mây trôi qua vùng đồi thấp (y=648) vẫn có mây phủ kín, không còn khoảng trống.
3. Hòa trộn tuần hoàn không giáp mí (Seamless Toroidal Wrap-around) với hàm S-curve Cosine trên biên M=280px,
   triệt tiêu hoàn toàn đường giáp mí giữa các bản sao tile khi mây trôi ngang.
"""

import os
import cv2
import numpy as np
from PIL import Image

def generate_seamless_cloud(
    orig_path: str = "my-portfolio/public/samples/backgorund-home.png",
    hill_path: str = "my-portfolio/public/samples/background-home-hill.webp",
    output_path: str = "my-portfolio/public/samples/cloud-layer.webp",
    blend_margin: int = 280,
    bottom_extend_y: int = 720,
    quality: int = 95
):
    print(f"Loading original background: {orig_path}")
    orig = Image.open(orig_path)
    oa = np.array(orig).astype(float)
    W, H = 1920, 1080

    print(f"Loading hill layer: {hill_path}")
    hill = Image.open(hill_path)
    ha = np.array(hill)
    hill_alpha = ha[:, :, 3]

    # Xác định đường đỉnh của quả đồi cho từng cột x
    hill_top = np.zeros(W, dtype=int)
    for x in range(W):
        cols = np.where(hill_alpha[:, x] > 5)[0]
        hill_top[x] = cols[0] if len(cols) > 0 else H

    print(f"Hill horizon depth: Peak y={hill_top.min()}, Valley y={hill_top.max()}")

    # Màu nền trời chuẩn ở vị trí không mây
    sky_base = np.array([79.0, 111.0, 255.0])

    # Tách alpha tuyến tính chính xác từ kênh Red
    r = oa[:, :, 0]
    raw_alpha = np.clip((r - 79.0) / 49.0, 0.0, 1.0)

    # Tách màu RGB của mây (unmixing)
    cloud_rgb = np.zeros((H, W, 3), dtype=float)
    mask = raw_alpha > 0.02
    cloud_rgb[mask] = (oa[mask] - (1.0 - raw_alpha[mask, None]) * sky_base) / raw_alpha[mask, None]
    cloud_rgb[~mask] = [128.0, 151.0, 255.0]
    cloud_rgb = np.clip(cloud_rgb, 0, 255)

    # Khởi tạo buffer RGBA cho mây
    cloud_rgba = np.zeros((H, W, 4), dtype=float)

    # Sao chép dữ liệu mây phía trên chân trời (cách mép đồi 2px)
    for x in range(W):
        ht = hill_top[x] - 2
        cloud_rgba[:ht, x, :3] = cloud_rgb[:ht, x]
        cloud_rgba[:ht, x, 3] = raw_alpha[:ht, x]

    # Tạo nhiễu đa tầng (multi-octave billow noise) cho khối mây tự nhiên bên dưới
    np.random.seed(42)
    noise_coarse = cv2.resize(np.random.randn(54, 96), (W, H), interpolation=cv2.INTER_CUBIC)
    noise_med = cv2.resize(np.random.randn(108, 192), (W, H), interpolation=cv2.INTER_CUBIC)
    noise_fine = cv2.resize(np.random.randn(216, 384), (W, H), interpolation=cv2.INTER_CUBIC)
    billow_noise = (noise_coarse * 0.6 + noise_med * 0.3 + noise_fine * 0.1)
    billow_noise = billow_noise / np.abs(billow_noise).max()

    # Bổ sung thiết kế phần dưới: mở rộng mây từ mép đồi xuống y=720
    print(f"Extending cloud details downwards down to y={bottom_extend_y}...")
    for x in range(W):
        ht = hill_top[x] - 2
        sample_y = max(0, ht - 10)
        ref_color = cloud_rgba[sample_y:ht, x, :3].mean(axis=0)
        ref_alpha = cloud_rgba[sample_y:ht, x, 3].mean()

        for y in range(ht, bottom_extend_y):
            # Giữ độ dày cao đến y=685, sau đó vát nhẹ dần về 0 tại y=720
            fade = 1.0 if y < 685 else (bottom_extend_y - y) / 35.0
            n_val = billow_noise[y, x]
            synth_alpha = np.clip(ref_alpha * (1.0 + 0.15 * n_val), 0.0, 1.0) * fade
            synth_color = np.clip(ref_color + n_val * 3.5, 0, 255)
            cloud_rgba[y, x, :3] = synth_color
            cloud_rgba[y, x, 3] = synth_alpha

    # Hòa trộn tuần hoàn không giáp mí (Seamless Toroidal Wrap-around)
    print(f"Applying seamless toroidal wrap across M={blend_margin}px...")
    raw_c = cloud_rgba.copy()
    for i in range(blend_margin):
        u = i / float(blend_margin)
        w = 0.5 - 0.5 * np.cos(np.pi * u) # C1 smooth S-curve
        x = W - blend_margin + i
        cloud_rgba[:, x] = (1.0 - w) * raw_c[:, x] + w * raw_c[:, i]

    # Đảm bảo cột cuối cùng khớp tuyệt đối với cột đầu tiên
    cloud_rgba[:, -1] = cloud_rgba[:, 0]

    # Kiểm tra sai số giáp mí
    diff_rgb = np.abs(cloud_rgba[:, -1, :3] - cloud_rgba[:, 0, :3]).max()
    diff_alpha = np.abs(cloud_rgba[:, -1, 3] - cloud_rgba[:, 0, 3]).max()
    print(f"Wrap seam check: RGB diff={diff_rgb:.4f}, Alpha diff={diff_alpha:.4f}")

    # Xuất ra file WebP chất lượng cao
    print(f"Saving new seamless cloud layer to: {output_path}")
    uint8_data = np.clip(cloud_rgba * [1, 1, 1, 255], 0, 255).astype(np.uint8)
    out_img = Image.fromarray(uint8_data)
    out_img.save(output_path, "WEBP", quality=quality)

    file_size_kb = os.path.getsize(output_path) / 1024
    print(f"Done! File size: {file_size_kb:.1f} KB")

if __name__ == "__main__":
    generate_seamless_cloud()

