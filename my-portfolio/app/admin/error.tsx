"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return <main className="cms-login"><div className="cms-login-window"><header className="cms-titlebar">Portfolio — Không thể tải dữ liệu</header><div className="cms-login-body"><h1>CMS tạm thời chưa sẵn sàng</h1><p>Kiểm tra kết nối database và lệnh khởi tạo dữ liệu, rồi thử lại.</p><button onClick={reset}>Thử lại</button><a href="/admin/login">Về đăng nhập</a></div></div></main>;
}
