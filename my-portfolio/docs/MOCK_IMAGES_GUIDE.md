# Project Mockup Images Replacement Guide
# Hướng Dẫn Thay Thế Hình Ảnh Mockup Dự Án

---

## English Guide

### 1. Overview
The Windows OS Portfolio showcases projects in the **Projects** window using a high-fidelity 3-card fan-out mockup inside an interactive laptop frame (matching retro-modern Windows styling). Each project displays 3 perspective cards:
- **Left Card**: Perspective preview card (tilted -14°)
- **Main Card**: Center primary application screen (tilted -7°, hover to expand)
- **Right Card**: Perspective preview card (tilted +14°)

This guide explains how to replace the initial placeholder/sample images with your actual project screenshots.

---

### 2. File Placement & Directory Structure

All static image assets are hosted in Next.js's `public/` directory. Next.js serves all files inside `public/` from the root URL path (`/`).

You can place your screenshots in either:
- `public/mockups/` *(Recommended for new project screenshots)*
- `public/samples/` *(Existing directory where default samples reside)*

#### Recommended Folder Structure:
```
my-portfolio/
├── public/
│   ├── mockups/                <-- Place your new screenshots here
│   │   ├── quiz-main.png
│   │   ├── quiz-left.png
│   │   ├── quiz-right.png
│   │   ├── alochat-main.png
│   │   ├── alochat-left.png
│   │   └── alochat-right.png
│   └── samples/                <-- Existing sample assets
│       ├── project-1.png
│       ├── project-2.png
│       └── project-3.png
```

> **Note:** If `public/mockups/` does not yet exist, simply create the folder:
> ```bash
> mkdir public/mockups
> ```

---

### 3. Recommended Aspect Ratios & Specifications

The laptop screen uses a **16:10** viewport, and the fan-out cards have specific dimensions and perspective transforms. For the sharpest visual result:

| Card Position | Target Aspect Ratio | Recommended Resolution | Best Suited For |
| :--- | :--- | :--- | :--- |
| **Main (Center)** | **16:10** or **16:9** | 1920×1200 or 1920×1080 (min: 1280×800) | Primary dashboard, main landing page, key workflow |
| **Left (Tilted -14°)** | **3:4** (Portrait) or **4:3** | 768×1024 or 800×600 (min: 600×800) | Mobile screen view, navigation drawer, settings panel |
| **Right (Tilted +14°)** | **3:4** (Portrait) or **4:3** | 768×1024 or 800×600 (min: 600×800) | Analytics chart, modal view, detail page, code view |

#### Supported Formats:
- **WebP** (`.webp`): Best performance, smallest file size, high fidelity.
- **PNG** (`.png`): Recommended for crisp UI screenshots and text.
- **JPEG/JPG** (`.jpg`, `.jpeg`): Good for complex photo-heavy interfaces.
- **SVG** (`.svg`): Ideal for vector illustrations or mock diagrams.

#### File Size Recommendation:
- Keep each image under **1 MB** (ideally 200 KB – 600 KB) for fast initial load times.
- Tools like [TinyPNG](https://tinypng.com), [Squoosh](https://squoosh.app), or Sharp can compress screenshots without losing clarity.

---

### 4. Updating Data in `data/portfolioData.ts`

Open `data/portfolioData.ts` and locate the `projects` array. Each project item contains a `mockImages` object with `left`, `main`, and `right` paths.

#### Code Example:
```typescript
// data/portfolioData.ts
import { PortfolioData } from "@/types/portfolio";

export const portfolioData: PortfolioData = {
  // ... profile & skills ...
  projects: [
    {
      id: "project-1",
      number: "01",
      title: "Quiz App",
      subtitle: "Solo Project | Fullstack Developer",
      tags: ["React", "Express", "Node.js", "TailwindCSS"],
      description:
        "A full-stack Quiz App featuring topic selection, timed quizzes, interactive score tracking, and performance analytics.",
      bgColor: "#a3d95b", // Vibrant background color for the showcase banner
      accentColor: "#ffffff",
      mockImages: {
        left: "/mockups/quiz-mobile-view.png",    // or "/samples/project-1.png"
        main: "/mockups/quiz-dashboard.png",
        right: "/mockups/quiz-analytics.png",
      },
      links: {
        github: "https://github.com/trtrnguyen14104/Quiz_app",
        demo: "https://quiz-app-demo.vercel.app", // Optional live demo URL
      },
    },
    {
      id: "project-2",
      number: "02",
      title: "Social Media AloChat",
      // ...
      mockImages: {
        left: "/mockups/alochat-contacts.png",
        main: "/mockups/alochat-chat-room.png",
        right: "/mockups/alochat-user-profile.png",
      },
      links: {
        github: "https://github.com/trtrnguyen14104/Social-Media-AloChat",
      },
    },
    // Add or update additional projects...
  ],
};
```

---

### 5. Automatic Fallback Mechanism

The `LaptopMockup` component (`components/windows/LaptopMockup.tsx`) includes an automatic fallback system:
- If an image file path cannot be loaded, is missing, or triggers an `onError` event, the UI **does not break**.
- Instead, it gracefully renders a styled macOS/Windows dark-mode glassmorphic code card with:
  - Traffic light window control dots (red, yellow, green)
  - Simulated file name (`left_view.tsx`, `01_project-1.app`, `preview_art.jpg`)
  - Project icon (`Layers`, `Code2`, `Sparkles`)
  - Project title and category tags

This allows you to add projects before screenshots are ready without showing broken image icons.

---

### 6. Local Verification & Preview

After adding your images and editing `portfolioData.ts`, verify the changes:

```bash
# 1. Start the development server
npm run dev

# 2. Open http://localhost:3000 in your browser
# Double-click the "Projects" folder on the desktop
# Use left/right arrow keys or folder tabs (01_Quiz_App, 02_AloChat...) to switch between projects

# 3. Verify unit & integration tests
npm test

# 4. Verify production build
npm run build
```

---
---

## Hướng Dẫn Chi Tiết (Tiếng Việt)

### 1. Tổng quan
Trong giao diện hệ điều hành Windows OS của Portfolio, cửa sổ **Projects** trình bày các sản phẩm theo dạng 3D Showcase trên màn hình Laptop với hiệu ứng xoè 3 thẻ card (`fan-out mockup`):
- **Thẻ bên trái (Left Card)**: Nghiêng góc -14°, lùi về sau
- **Thẻ chính giữa (Main Card)**: Nằm ở tâm màn hình Laptop, nghiêng -7°, tự căn thẳng và phóng to khi rê chuột vào
- **Thẻ bên phải (Right Card)**: Nghiêng góc +14°, lùi về sau

Tài liệu này hướng dẫn bạn các bước đưa hình ảnh chụp thực tế từ các dự án của mình vào portfolio một cách nhanh chóng và tối ưu nhất.

---

### 2. Nơi lưu trữ hình ảnh & Cấu trúc thư mục

Toàn bộ tài nguyên tĩnh (static assets) trong Next.js được đặt trong thư mục `public/`. Bất kỳ tệp nào nằm trong `public/` đều có thể truy cập trực tiếp từ đường dẫn gốc `/`.

Bạn có thể lưu ảnh vào 1 trong 2 thư mục:
- `public/mockups/` *(Khuyến nghị tạo mới thư mục này để lưu ảnh screenshot thực tế)*
- `public/samples/` *(Thư mục hiện có chứa các ảnh mẫu)*

#### Cấu trúc thư mục mẫu:
```
my-portfolio/
├── public/
│   ├── mockups/                <-- Tạo thư mục và chép ảnh chụp dự án vào đây
│   │   ├── quiz-main.png
│   │   ├── quiz-left.png
│   │   ├── quiz-right.png
│   │   ├── alochat-main.png
│   │   ├── alochat-left.png
│   │   └── alochat-right.png
│   └── samples/                <-- Các ảnh mẫu mặc định
│       ├── project-1.png
│       ├── project-2.png
│       └── project-3.png
```

> **Mẹo:** Nếu chưa có thư mục `public/mockups/`, bạn tạo bằng lệnh:
> ```bash
> mkdir public/mockups
> ```

---

### 3. Tỉ lệ khung hình (Aspect Ratio) & Định dạng khuyến nghị

Màn hình laptop hiển thị theo tỉ lệ **16:10**. Để các thẻ xoè ra đẹp nhất, bạn nên chuẩn bị ảnh theo các thông số sau:

| Vị trí Thẻ | Tỉ lệ khuyến nghị | Độ phân giải tối ưu | Nội dung phù hợp |
| :--- | :--- | :--- | :--- |
| **Thẻ Giữa (Main)** | **16:10** hoặc **16:9** | 1920×1200 hoặc 1920×1080 (tối thiểu 1280×800) | Màn hình Dashboard chính, trang chủ sản phẩm, tính năng quan trọng nhất |
| **Thẻ Trái (Left)** | **3:4** (dọc) hoặc **4:3** | 768×1024 hoặc 800×600 (tối thiểu 600×800) | Giao diện Mobile, thanh menu sidebar, trang cấu hình/cài đặt |
| **Thẻ Phải (Right)** | **3:4** (dọc) hoặc **4:3** | 768×1024 hoặc 800×600 (tối thiểu 600×800) | Biểu đồ thống kê, modal chi tiết, màn hình chat/kết quả |

#### Định dạng tệp hỗ trợ:
- **WebP** (`.webp`): Tối ưu nhất về tốc độ tải trang, dung lượng nhẹ, giữ độ nét cao.
- **PNG** (`.png`): Rất nét cho hình ảnh có chữ, giao diện UI phẳng.
- **JPG / JPEG** (`.jpg`): Phù hợp ảnh chụp thực tế có nhiều chi tiết.

#### Khuyến nghị dung lượng:
- Nên nén ảnh xuống dưới **1 MB** (lý tưởng từ 200 KB – 600 KB) bằng các công cụ miễn phí như [TinyPNG](https://tinypng.com) để trang tải mượt mà.

---

### 4. Cập nhật đường dẫn trong `data/portfolioData.ts`

Mở tệp `data/portfolioData.ts`, tìm mảng `projects`. Mỗi dự án có mục `mockImages` gồm 3 thuộc tính: `left`, `main`, `right`.

#### Ví dụ mã nguồn:
```typescript
// data/portfolioData.ts
import { PortfolioData } from "@/types/portfolio";

export const portfolioData: PortfolioData = {
  // ... profile & skills ...
  projects: [
    {
      id: "project-1",
      number: "01",
      title: "Quiz App",
      subtitle: "Solo Project | Fullstack Developer",
      tags: ["React", "Express", "Node.js", "TailwindCSS"],
      description:
        "Ứng dụng Quiz trắc nghiệm trực tuyến hỗ trợ chọn chủ đề, bấm giờ, theo dõi điểm số và phân tích kết quả bài thi.",
      bgColor: "#a3d95b", // Màu nền rực rỡ phía sau laptop
      accentColor: "#ffffff",
      mockImages: {
        left: "/mockups/quiz-mobile.png",     // Đường dẫn ảnh thẻ trái
        main: "/mockups/quiz-dashboard.png",  // Đường dẫn ảnh thẻ giữa (chính)
        right: "/mockups/quiz-results.png",   // Đường dẫn ảnh thẻ phải
      },
      links: {
        github: "https://github.com/trtrnguyen14104/Quiz_app",
        demo: "https://quiz-app.vercel.app",  // Đường dẫn Live Demo (nếu có)
      },
    },
    // ... Cập nhật tương tự cho project-2, project-3, project-4
  ],
};
```

---

### 5. Cơ chế Fallback tự động khi thiếu ảnh

Component `LaptopMockup` (`components/windows/LaptopMockup.tsx`) đã tích hợp sẵn cơ chế dự phòng:
- Khi ảnh bị mất kết nối, sai tên file hoặc chưa kịp chuẩn bị, giao diện sẽ **không bị vỡ hình hay hiện icon lỗi**.
- Hệ thống sẽ tự động hiển thị một **thẻ lập trình giả lập (Code Preview Card)** cực đẹp theo phong cách Windows/macOS Acrylic Dark:
  - Có 3 nút tròn màu sắc đỏ - vàng - xanh.
  - Tên tệp giả lập (`left_view.tsx`, `01_project-1.app`, `preview_art.jpg`).
  - Biểu tượng lập trình cùng tên dự án và công nghệ sử dụng.

---

### 6. Kiểm tra và Xem Trước (Verification)

Sau khi lưu ảnh và cập nhật cấu hình, bạn kiểm tra lại trang web:

```bash
# 1. Chạy môi trường phát triển cục bộ
npm run dev

# 2. Mở trình duyệt tại http://localhost:3000
# - Nhấp đúp vào thư mục "Projects" trên màn hình Desktop
# - Dùng phím mũi tên Trái / Phải hoặc các tab (01_Quiz_App, 02_AloChat, 03_Research_System...) để chuyển qua lại
# - Rê chuột vào thẻ chính giữa trên màn hình laptop để xem hiệu ứng xoay phóng to

# 3. Chạy kiểm thử tự động
npm test

# 4. Kiểm tra build sản xuất
npm run build
```
