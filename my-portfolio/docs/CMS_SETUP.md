# Portfolio CMS

Backend và `/admin` chạy trong ứng dụng Next.js hiện tại. Nội dung lưu tại MongoDB Atlas, ảnh upload tại Cloudinary, thông báo liên hệ gửi bằng Gmail SMTP. Chỉ Google account có email đã xác minh khớp `ADMIN_EMAIL` trong môi trường được quản trị. Email hiển thị trong hồ sơ không thay đổi quyền đăng nhập hoặc địa chỉ nhận thông báo.

## Chạy local

Yêu cầu Node.js 22 trở lên, npm và các tài khoản dịch vụ bên dưới. Dependencies được khóa trong `package-lock.json`; Next.js dùng bản vá `16.3.8`, Auth.js dùng `5.0.0-beta.32`, tương thích peer dependency Next.js 16/React 19. Gmail SMTP dùng Nodemailer `10.1.0` qua npm alias `cms-nodemailer` vì peer SMTP tùy chọn của Auth.js chỉ chấp nhận phiên bản 7/8; Google OAuth không sử dụng peer đó. Không sử dụng `--force` hoặc `--legacy-peer-deps`.

1. Chạy `npm ci` trong `my-portfolio`.
2. Sao chép `.env.example` thành `.env.local`; điền giá trị trên máy hoặc trong dashboard dịch vụ. Không commit file này hoặc gửi secrets qua chat.
3. Chạy `npm run cms:seed` để tạo indexes và nhập dữ liệu hiện tại. Lệnh chạy lại giữ nguyên dữ liệu đã sửa; không seed tự động khi ứng dụng khởi động.
4. Chạy `npm run dev`, mở `http://localhost:3000/admin/login` và đăng nhập Google.

`portfolioData.ts` chỉ còn là dữ liệu seed/test. Trang chủ và API đọc Atlas tại thời điểm request; thay đổi nội dung trong CMS có hiệu lực khi tải lại trang, không cần rebuild. Nếu chưa seed hoặc database mất kết nối, ứng dụng hiển thị lỗi thay vì dùng nội dung cũ từ mã nguồn.

## Biến môi trường

| Biến | Giá trị |
| --- | --- |
| `APP_URL` | Origin chuẩn của môi trường, local `http://localhost:3000`, preview/production dùng HTTPS |
| `AUTH_URL` | Cùng URL với `APP_URL`, để callback OAuth dùng đúng hostname |
| `ADMIN_EMAIL` | Email tài khoản Google quản trị, đồng thời là Gmail đăng nhập SMTP và địa chỉ nhận thông báo; bắt buộc, không có fallback trong mã nguồn |
| `AUTH_SECRET` | Secret ngẫu nhiên độc lập, ít nhất 32 ký tự |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Credentials OAuth Web application từ Google Cloud |
| `MONGODB_URI`, `MONGODB_DB` | URI Atlas và tên database riêng cho môi trường |
| `RATE_LIMIT_SECRET` | Secret ngẫu nhiên độc lập, ít nhất 32 ký tự để băm IP |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credentials Cloudinary; chỉ được sử dụng phía server |
| `GMAIL_APP_PASSWORD` | App Password của Gmail quản trị, không phải mật khẩu đăng nhập Google |

Có thể tạo từng secret bằng `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"` rồi nhập vào môi trường tương ứng. Không tái sử dụng production secrets cho preview.

Đổi tài khoản bằng cách cập nhật `ADMIN_EMAIL` trong `.env.local` hoặc Vercel Environment Variables, cùng `GMAIL_APP_PASSWORD` của tài khoản mới. Khởi động lại server local hoặc redeploy, rồi đăng nhập Google bằng tài khoản mới. Email trên thanh CMS và thông báo đăng nhập được lấy từ cấu hình server; tài khoản cũ mất quyền ở lần kiểm tra session tiếp theo. Không cần sửa `owner.ts`, seed lại hoặc thay credentials ứng dụng Google OAuth nếu vẫn dùng cùng OAuth client; thêm tài khoản mới vào Test users khi consent screen ở chế độ Testing. Email thiếu hoặc không hợp lệ sẽ vô hiệu hóa đăng nhập.

## Google OAuth

- Tạo OAuth consent screen và OAuth client loại **Web application** trong Google Cloud. Chỉ yêu cầu các scope đăng nhập cơ bản; không yêu cầu quyền đọc Gmail.
- Nếu consent screen ở chế độ Testing, thêm email chủ portfolio vào Test users.
- Khai báo callback local: `http://localhost:3000/api/auth/callback/google`.
- Khai báo callback preview và production: `https://<hostname>/api/auth/callback/google`. Dùng preview hostname cố định để không phải đăng ký mỗi URL deployment mới.
- Khai báo JavaScript origin đúng với mỗi hostname. Đặt `APP_URL` và `AUTH_URL` tương ứng.
- Session tồn tại tối đa tám giờ; đăng xuất để kết thúc session trong trình duyệt. Thay `AUTH_SECRET` để vô hiệu hóa các session JWT cũ nếu cần.

## MongoDB Atlas

- Chọn region Singapore gần Vercel `sin1`, tạo database user chỉ có quyền đọc/ghi database của ứng dụng.
- Trong Network Access, cho phép kết nối từ local và Vercel theo cấu hình egress của tài khoản. IP public của Functions không cố định mặc định; dùng cấu hình mạng phù hợp thay vì giả định IP máy local cũng cho phép Vercel.
- Dùng URI TLS `mongodb+srv://…`; URL-encode ký tự đặc biệt của credentials nếu tự điền URI.
- Tách database và database users cho preview/production. Bật sao lưu theo gói Atlas sử dụng; xóa tin nhắn trong CMS là xóa vĩnh viễn.
- Chạy `cms:seed` với môi trường đích trước khi mở traffic. Unique index `submissionId` là điều kiện để chống lưu tin trùng; TTL index tự dọn bộ đếm rate limit, không tự xóa tin nhắn.

## Cloudinary và Gmail

- Upload JPEG, PNG, WebP tối đa 3 MiB qua API quản trị. Server kiểm tra chữ ký file, lưu ảnh vào thư mục `portfolio-cms` và lưu URL/public ID trong collection `media`. Không bật unsigned upload preset.
- URL ảnh mới được gắn vào nội dung khi bấm **Lưu thay đổi**. Thay ảnh hoặc bỏ thay đổi không tự xóa asset Cloudinary; dọn asset không sử dụng trong dashboard Cloudinary khi cần.
- Bật xác minh hai bước cho Gmail quản trị và tạo App Password nếu tài khoản hỗ trợ. Google OAuth dùng để đăng nhập CMS, App Password dùng riêng cho SMTP.
- Code tự bỏ khoảng trắng phân nhóm trong App Password. Lỗi log `smtpCode: EAUTH`, `smtpResponseCode: 535` nghĩa là Gmail từ chối xác thực; tạo lại App Password trong đúng tài khoản được cấu hình bởi `ADMIN_EMAIL`, cập nhật `GMAIL_APP_PASSWORD` rồi khởi động lại server local hoặc redeploy môi trường tương ứng. Log chỉ ghi mã lỗi, không ghi mật khẩu hoặc phản hồi SMTP thô.
- SMTP gửi `From` và `To` tới chủ portfolio, `Reply-To` là email khách. Tin được lưu trước khi gửi; SMTP lỗi vẫn nhận tin và hiển thị trạng thái thất bại trong CMS.
- CMS chỉ thử lại khi bấm **Gửi lại thông báo**, không tự gửi lại thông báo đã thành công. Một lượt bị gián đoạn có thể thử lại sau hai phút. Nếu Gmail nhận email nhưng kết nối mất trước khi server ghi trạng thái, retry có thể gửi email lặp; SMTP không bảo đảm exactly-once.
- Trả lời trực tiếp email thông báo trong Gmail để dùng `Reply-To`, hoặc bấm **Trả lời trong Gmail** trong CMS. Không có đọc đồng bộ Gmail, gửi trả lời từ CMS hoặc file đính kèm.

## API

Response thành công: `{ "data": ... }`; lỗi: `{ "error": { "code": "...", "message": "...", "fields": {} } }`. `fields` chỉ có khi validation lỗi. API không cache; lỗi nội bộ không trả stack trace hoặc credentials.

| Method và URL | Request / response |
| --- | --- |
| `GET /api/portfolio` | `data` là `PortfolioData`, không có thông tin quản trị |
| `GET /api/admin/portfolio` | `data: { portfolio, version, updatedAt, updatedBy }` |
| `PATCH /api/admin/portfolio` | `{ section, version, value }`, section là `profile`, `skills`, `projects`, `experience`, `education`; `value` thay toàn bộ mục tương ứng. Trả snapshot mới; version cũ trả `409` |
| `POST /api/contact` | `{ submissionId: UUID, name, email, subject, message, website: "" }`; trả `201` với `{ id, received: true }` khi đã lưu |
| `GET /api/admin/contacts` | Query `page=1&limit=20&status=new`; status tùy chọn `new`, `read`, `archived`; limit tối đa 50. Trả `{ items, total, page, limit }` |
| `GET /api/admin/contacts/:id` | Tin nhắn cùng trạng thái xử lý/thông báo |
| `PATCH /api/admin/contacts/:id` | `{ status: "new" \| "read" \| "archived" }` |
| `DELETE /api/admin/contacts/:id` | `{ deleted: true }` |
| `POST /api/admin/contacts/:id/notify` | `{ status: "sent" \| "failed" }`; đang gửi hoặc đã gửi trả `409` |
| `POST /api/admin/media` | Multipart một field `file`; trả `{ url, publicId, width, height }` |

Mọi API quản trị kiểm tra session và quyền chủ portfolio. Các mutation yêu cầu header `Origin` khớp `APP_URL`; API contact cũng yêu cầu cùng origin. Contact giới hạn tên 100, email 254, tiêu đề 200, nội dung 5.000 ký tự, JSON 32 KiB. Cùng UUID và payload sẽ trả tin đã lưu; cùng UUID với payload khác trả `409`. Tối đa năm lượt hợp lệ/15 phút theo IP được băm trong MongoDB. Local sử dụng chung một bucket; trên Vercel dùng header client IP do nền tảng cung cấp. Bật honeypot `website` để chặn bot đơn giản.

## Vercel

1. Import repository, chọn Framework Next.js, **Root Directory `my-portfolio`**, Node.js 22 hoặc 24. Không chọn static export/GitHub Pages.
2. Thêm biến môi trường cho Preview và Production riêng. `vercel.json` đặt Functions tại `sin1`.
3. Cấu hình callback Google theo hostname, Atlas Network Access và secrets dịch vụ.
4. Seed từng database trước khi mở ứng dụng. Sau khi seed, deploy và kiểm tra `/`, `/admin/login`, form liên hệ và upload ảnh.
5. Kiểm tra log events `cms.request_failed`, `cms.notification_failed`, `cms.notification_interrupted` cùng trạng thái thông báo trong hộp thư; logs không chứa nội dung tin hoặc credentials.

## Kiểm chứng

Chạy `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build`. Tests dùng dữ liệu fixture và dependency doubles cho database/dịch vụ ngoài; không xác minh kết nối Atlas/Google/Gmail/Cloudinary thực tế.

Dependency audit tại thời điểm triển khai: `npm audit --omit=dev` không còn advisory cho runtime. Audit toàn bộ còn năm advisory mức high trong chuỗi ESLint/fast-glob/micromatch/braces; braces 3.x chưa có bản vá tương thích và npm đề xuất hạ eslint-config-next xuống 14.x. Giữ cấu hình lint phù hợp Next.js 16, không tự động downgrade hoặc dùng `audit fix --force`. Kiểm tra lại advisory khi cập nhật công cụ phát triển.

Trên preview đã cấu hình, kiểm tra:

- Google account chủ vào CMS; tài khoản khác bị từ chối; gọi API quản trị chưa đăng nhập không lấy được dữ liệu.
- Sửa hồ sơ/dự án, tải lại portfolio nhận nội dung mới; hai tab cùng phiên bản không ghi đè nhau.
- Upload ảnh hợp lệ, từ chối ảnh lớn/sai định dạng; ảnh hiển thị trên portfolio sau lưu.
- Form nhận tin trong CMS, Gmail nhận thông báo và Reply-To đúng email khách.
- Tạm dùng SMTP credentials không hợp lệ trên preview: tin vẫn lưu, thông báo thất bại và retry sau khi khôi phục cấu hình.
- Gửi cùng UUID không tạo hai tin; lượt gửi thứ sáu trong cửa sổ bị giới hạn.
- Kiểm tra CMS ở 375px và desktop, focus bàn phím, cảnh báo thay đổi chưa lưu và các thao tác mở/kéo/thu nhỏ cửa sổ portfolio.
