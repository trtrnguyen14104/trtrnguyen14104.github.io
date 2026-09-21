<div align="center">

# 🖥️ Trần Trung Nguyên — Windows OS Portfolio

<p align="center">
  <strong>An interactive, retro-modern Windows OS desktop portfolio built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, and GSAP.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/GSAP-3.15-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP" />
  <img src="https://img.shields.io/badge/Status-Open_to_Work-brightgreen?style=for-the-badge" alt="Status" />
</p>

---

### 🌟 Desktop Demo Preview

![Windows OS Desktop Portfolio Demo](./my-portfolio/public/demos/demo-portfolio.png)

</div>

---

## 📖 Giới Thiệu (Overview)

**Windows OS Portfolio** là trang web hồ sơ năng lực cá nhân của **Trần Trung Nguyên** (Full-Stack Developer), được thiết kế mô phỏng trải nghiệm hệ điều hành Windows chân thực kết hợp thẩm mỹ retro groovy thập niên 70s.

Trang web ứng dụng thư viện **GSAP (GreenSock Animation Platform)** để mang lại cảm giác mở cửa sổ, kéo thả, thu nhỏ và tương tác sống động như trên một chiếc máy tính Windows thực tế.

---

## ✨ Tính Năng Nổi Bật (Key Features)

### 1. 🖥️ Giao Diện Màn Hình Desktop Windows
- **Hình nền đồng cỏ & bầu trời xanh**: Hình nền kinh điển chất lượng cao phủ kín viewport.
- **Chữ nghệ thuật Retro Groovy**: Dòng chữ vòm cong nổi bật `TRẦN TRUNG NGUYÊN` cùng chữ viết tay `Portfolio` màu vàng ấm áp.
- **Icon thư mục Desktop**: 3 thư mục chính (`About Me`, `Projects`, `Contact`) hỗ trợ click chọn khung viền xanh Windows và **double-click** (hoặc chạm trên điện thoại) để mở cửa sổ.

### 2. 🪟 Quản Lý Cửa Sổ & Hoạt Ảnh GSAP (Window Management)
- **Hiệu ứng mở Folder**: Cửa sổ bung nở mượt mà từ chính tọa độ của icon thư mục với độ nảy nhẹ (`back.out(1.2)`).
- **Vỏ cửa sổ File Explorer chuẩn xác**:
  - Thanh tiêu đề hỗ trợ kéo thả (drag) tự do trên desktop và giới hạn trong màn hình.
  - Tự động nâng độ ưu tiên hiển thị (`zIndex`) của cửa sổ đang kích hoạt.
  - **Nút Thu nhỏ (`_`)**: Cửa sổ thu nhỏ và trượt hút vào taskbar badge bên dưới.
  - **Nút Phóng to / Khôi phục (`□`)**: Chuyển đổi giữa chế độ cửa sổ và toàn màn hình.
  - **Nút Đóng (`✕`)**: Hoạt ảnh scale-down và mờ dần trước khi đóng.
  - Thanh công cụ Explorer: Nút Back, Forward, Refresh, thanh địa chỉ breadcrumb (`This PC > Portfolio > [Folder]`) và ô tìm kiếm nội bộ.

### 3. 💼 Thư Mục "Projects" — 3D Laptop Showcase
- **Mô phỏng laptop chân thực**: Khung kim loại, bàn phím, camera notch và màn hình góc nhìn rộng.
- **Bố cục 3 thẻ bài xòe cánh quạt (3-Card Fan-Out)**:
  - Thẻ trái nghiêng -14°
  - Thẻ giữa chính diện trên màn hình laptop
  - Thẻ phải nghiêng +14°
- **Chữ Script mềm mại vắt ngang thân máy**: `project 1`, `project 2`, `project 3`.
- **Màu nền động tương thích**: Xanh lá chanh (Quiz App), Xanh lam periwinkle (AloChat), Vàng rực rỡ (Research Data Management System).
- **Chuyển đổi chế độ xem**: Chuyển đổi linh hoạt giữa **3D Laptop Showcase** và **File Explorer Grid** (dạng danh sách tệp).
- **Hệ thống ảnh Mock**: Cấu hình sẵn đường dẫn mặc định trong `data/portfolioData.ts`, kèm giao diện thẻ kính mờ dự phòng khi chưa tải ảnh thật.

### 4. 👤 Thư Mục "About Me"
- Nền gradient xanh dương đậm chất retro.
- Tiêu đề nghệ thuật `hi, its Nguyen!` và phụ đề `what i do` kèm trỏ chuột pixel retro.
- Giới thiệu chi tiết kỹ năng, định hướng nghề nghiệp, vị trí TP.HCM và trạng thái *Open to work*.
- Ảnh chân dung chính chủ và các chip kỹ năng tương tác click để xem chi tiết.

### 5. 📬 Thư Mục "Contact"
- Tiêu đề `Let's Work` và phụ đề `contact me`.
- Các nút bấm dạng viên thuốc (Pill buttons):
  - 🔵 `FOLLOW ME @trtrnguyen14104` (Liên kết GitHub)
  - 🟣 `trtrnguyen14104@gmail.com` (Click để tự động copy email kèm thông báo toast)
  - 💼 `Trần Trung Nguyên` (Liên kết LinkedIn)
  - 📞 `0354066043` (Số điện thoại liên hệ)
- Hộp thư soạn thảo phong cách cổ điển Outlook Express / Windows Mail để gửi tin nhắn trực tiếp.

### 6. 📊 Thanh Tác Vụ Taskbar & System Tray
- Thanh tác vụ dưới cùng với hiệu ứng kính mờ acrylic (`backdrop-blur-md`).
- Nút Start menu `☰` mở bảng điều khiển thông tin cá nhân và phím tắt mở thư mục.
- Thanh tìm kiếm bo tròn hỗ trợ tìm nhanh ứng dụng và dự án.
- Tab các cửa sổ đang mở với vạch sáng cyan hiển thị trạng thái active.
- Khay hệ thống: Wifi, Âm lượng, Pin chuẩn Windows (`Windows_battery.png`), đồng hồ và ngày sinh nhật kỷ niệm `14/10/2004` (có thể bấm để đổi sang ngày giờ thực tế).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Mục đích |
|---|---|---|
| **Core Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | SSR, Static Site Generation, Turbopack |
| **UI Library** | [React 19](https://react.dev/) | Xây dựng component giao diện |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Định kiểu tĩnh và an toàn mã nguồn |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Styling hiện đại với `@theme inline` |
| **Animations** | [GSAP 3](https://greensock.com/gsap/) | Điều khiển chuyển động cửa sổ, bounce và 3D |
| **Icons** | [Lucide React](https://lucide.dev/) + Retro Icons | Hệ thống icon hệ thống và Windows pixel |
| **Testing** | [Vitest](https://vitest.dev/) + Testing Library | 69 unit & integration tests (100% pass) |

---

## 📁 Cấu Trúc Dự Án (Project Structure)

```text
my-portfolio/
├── app/
│   ├── layout.tsx                # Cấu hình Google Fonts (Pacifico, Plus Jakarta Sans) & Metadata
│   ├── globals.css               # Tailwind CSS v4, font-cursive, scrollbar, acrylic blur
│   └── page.tsx                  # Trang chính: tích hợp Desktop, WindowFrames & Taskbar
├── components/
│   └── windows/
│       ├── Desktop.tsx           # Môi trường màn hình chính, hình nền & hero typography
│       ├── DesktopIcon.tsx       # Icon thư mục với selection box & double-click trigger
│       ├── HeroTypography.tsx    # Chữ vòm uốn lượn SVG TRẦN TRUNG NGUYÊN & Portfolio
│       ├── WindowFrame.tsx       # Vỏ cửa sổ File Explorer chuẩn (kéo thả, min, max, close)
│       ├── AboutMeContent.tsx    # Nội dung thư mục About Me
│       ├── ProjectsContent.tsx   # Trình xem Projects (Showcase + Explorer Grid)
│       ├── LaptopMockup.tsx      # Mockup laptop 3D với 3 thẻ ảnh xòe cánh quạt
│       ├── ContactContent.tsx    # Nội dung thư mục Contact & hộp thư Windows Mail
│       ├── Taskbar.tsx           # Thanh tác vụ, Start toggle, search & system tray
│       └── StartMenu.tsx         # Bảng Start menu mở rộng
├── data/
│   └── portfolioData.ts          # Dữ liệu tập trung: Profile, Skills, Projects, Mock Images
├── hooks/
│   └── useWindowManager.ts       # Hook quản lý trạng thái cửa sổ (tọa độ, z-index, min/max)
├── utils/
│   └── gsapAnimations.ts         # Hoạt ảnh GSAP: mở folder, trượt về taskbar, khôi phục
├── public/
│   ├── demos/                    # Ảnh chụp màn hình thực tế (demo-portfolio.png)
│   ├── icons/                    # Icon Windows (thư mục, pin, chuột pixel, minimize)
│   ├── pictures/                 # Ảnh đại diện cá nhân (me.png)
│   └── samples/                  # Artboard mẫu gốc (home, about-me, contact, project 1-3)
├── docs/
│   └── MOCK_IMAGES_GUIDE.md      # Hướng dẫn chi tiết cách thay thế ảnh chụp dự án
└── tests/                        # 11 test suites kiểm thử toàn diện
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy (Getting Started)

### Yêu cầu môi trường
- **Node.js**: phiên bản `>= 18.18.0` hoặc `20.x` / `22.x`
- **npm** hoặc **yarn** / **pnpm**

### Các bước cài đặt

1. **Clone repository**:
   ```bash
   git clone https://github.com/trtrnguyen14104/trtrnguyen14104.github.io.git
   cd trtrnguyen14104.github.io/my-portfolio
   ```

2. **Cài đặt các gói phụ thuộc**:
   ```bash
   npm install
   ```

3. **Chạy máy chủ phát triển (Development mode)**:
   ```bash
   npm run dev
   ```
   Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)

4. **Chạy kiểm thử tự động (Unit & Integration Tests)**:
   ```bash
   npm test
   ```

5. **Biên dịch sản phẩm (Production Build)**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🖼️ Hướng Dẫn Bổ Sung Ảnh Chụp Dự Án (Mock Images)

Để thay đổi ảnh chụp màn hình thực tế cho các dự án:
1. Đặt ảnh chụp màn hình vào thư mục `my-portfolio/public/mockups/` (hoặc `public/demos/`).
2. Mở file [`my-portfolio/data/portfolioData.ts`](./my-portfolio/data/portfolioData.ts) và cập nhật đường dẫn:
   ```typescript
   mockImages: {
     left: '/mockups/project1-left.png',    // Ảnh thẻ nghiêng góc trái (tỉ lệ 3:4 hoặc 4:3)
     main: '/mockups/project1-main.png',    // Ảnh thẻ chính giữa màn hình laptop (tỉ lệ 16:10 hoặc 16:9)
     right: '/mockups/project1-right.png',  // Ảnh thẻ nghiêng góc phải (tỉ lệ 3:4 hoặc 4:3)
   }
   ```
Xem hướng dẫn chi tiết tại [docs/MOCK_IMAGES_GUIDE.md](./my-portfolio/docs/MOCK_IMAGES_GUIDE.md).

---

## 📬 Liên Hệ (Contact)

- **Họ và tên**: Trần Trung Nguyên
- **Vị trí**: Full-Stack Web Developer
- **Email**: [trtrnguyen14104@gmail.com](mailto:trtrnguyen14104@gmail.com)
- **Điện thoại**: `0354066043`
- **GitHub**: [@trtrnguyen14104](https://github.com/trtrnguyen14104)
- **LinkedIn**: [Trần Trung Nguyên](https://linkedin.com/in/trung-nguyên-trần-82b1403b8)
- **Địa điểm**: TP. Hồ Chí Minh, Việt Nam 🇻🇳

---

<div align="center">
  <sub>Thiết kế và phát triển với đam mê bởi <strong>Trần Trung Nguyên</strong> © 2026.</sub>
</div>
