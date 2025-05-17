# WireGuard Web App

A simple web application written in Node.js for generating WireGuard configurations and QR codes.

Ứng dụng web đơn giản được viết bằng Node.js để tạo cấu hình WireGuard và mã QR tương ứng.

## Features | Tính năng

- Generate and manage WireGuard key pairs (Private/Public)
- Create WireGuard configuration files (.conf)
- Generate QR codes for easy mobile device configuration scanning
- User-friendly web interface
- Support for common WireGuard configuration options:
  - Interface: Private Key, Address, DNS
  - Peer: Public Key, Endpoint, AllowedIPs, PresharedKey, PersistentKeepalive

---

- Tạo và quản lý cặp khóa WireGuard (Private/Public)
- Tạo file cấu hình WireGuard (.conf)
- Tạo mã QR để dễ dàng quét và nhập cấu hình trên thiết bị di động
- Giao diện web thân thiện với người dùng
- Hỗ trợ các tùy chọn cấu hình WireGuard phổ biến:
  - Interface: Private Key, Address, DNS
  - Peer: Public Key, Endpoint, AllowedIPs, PresharedKey, PersistentKeepalive

## System Requirements | Yêu cầu hệ thống

- Node.js (v12 or higher | v12 trở lên)
- npm (Node Package Manager)
- WireGuard command-line tools (wg)

## Installation | Cài đặt

1. Clone this repository | Clone repository này:
```bash
git clone [repository-url]
cd wireguard-web-app
```

2. Install dependencies | Cài đặt các dependencies:
```bash
npm install
```

3. Run the application | Chạy ứng dụng:
```bash
node server.js
```

The application will run at | Ứng dụng sẽ chạy tại: http://192.168.0.206:6960

## Project Structure | Cấu trúc dự án

```
wireguard-web-app/
├── public/           # Static files and frontend | Static files và frontend
│   └── index.html    # User interface | Giao diện người dùng
├── configs/          # Generated configuration directory | Thư mục chứa file cấu hình được tạo
├── server.js         # Node.js server
├── package.json      # Project dependencies
└── README.md         # Documentation | Tài liệu
```

## Dependencies | Các phụ thuộc

- express: Web server framework | Framework máy chủ web
- body-parser: Request body parsing middleware | Middleware xử lý request body
- qrcode: QR code generation library | Thư viện tạo mã QR
- child_process: Interact with WireGuard CLI | Tương tác với WireGuard CLI

## API Endpoints | Các điểm cuối API

- `POST /api/generate-keys`
  - Generate new WireGuard key pair | Tạo cặp khóa WireGuard mới
  - Returns | Trả về: { privateKey, publicKey }

- `POST /api/generate-config`
  - Generate configuration file and QR code | Tạo file cấu hình và mã QR
  - Request body: WireGuard configuration information | Thông tin cấu hình WireGuard
  - Returns | Trả về: .conf file and QR code image | File .conf và hình ảnh QR code

- `GET /api/download/:filename`
  - Download configuration or QR code files | Tải xuống file cấu hình hoặc mã QR
  - Parameters | Tham số: filename | Tên file

## Security | Bảo mật

- Configuration files are stored locally in configs/ directory
  File cấu hình được lưu trữ locally trong thư mục configs/
- Private keys should not be shared
  Private key không nên được chia sẻ
- Only share QR codes with trusted users
  Chỉ chia sẻ mã QR với những người dùng đáng tin cậy

## Contributing | Đóng góp

All contributions are welcome. Please create issues or pull requests.
Mọi đóng góp đều được chào đón. Vui lòng tạo issue hoặc pull request.

## License | Giấy phép

MIT License | Giấy phép MIT