use master
GO
-- Tạo cơ sở dữ liệu mới
CREATE DATABASE scent;
GO

USE scent;
GO

-- Bảng phiếu giảm giá
CREATE TABLE phieu_giam_gia (
    id INT IDENTITY(1000, 1) PRIMARY KEY, -- Thay VARCHAR(10) thành INT IDENTITY
    ma_giam_gia VARCHAR(20),
    gia_tri_giam NUMERIC(6, 2),
    ngay_bat_dau DATETIME,
    ngay_het_han DATETIME,
    gia_tri_toi_da DECIMAL(19, 4),
    so_luong INT,
    dieu_kien_ap_dung DECIMAL(19, 4)
);
GO
alter table phieu_giam_gia
add  trang_thai int
go
-- Bảng khách hàng
CREATE TABLE khach_hang (
    id INT IDENTITY(1000, 1) PRIMARY KEY, -- Thay VARCHAR(10) thành INT IDENTITY
    ten_khach_hang NVARCHAR(50),
    dia_chi NVARCHAR(max),
    email VARCHAR(30),
    sdt VARCHAR(15)
);
GO

-- Bảng tài khoản
CREATE TABLE tai_khoan (
    id INT IDENTITY(1000, 1) PRIMARY KEY, -- Thay VARCHAR(10) thành INT IDENTITY
    ho_ten NVARCHAR(30),
    email VARCHAR(30),
    sdt VARCHAR(15),
    vai_tro NVARCHAR(10),
    ten_dang_nhap NVARCHAR(20),
    mat_khau NVARCHAR(255),
   trang_thai INT DEFAULT 1,
);
GO

-- Bảng đơn hàng
CREATE TABLE don_hang (
   id INT IDENTITY(1000, 1) PRIMARY KEY,-- Giữ nguyên định dạng DH[YYYYMMDD]-[Số thứ tự trong ngày]
    ten_nguoi_nhan_hang NVARCHAR(20),
    dia_chi_giao_hang NVARCHAR(100),
    sdt_nguoi_nhan VARCHAR(15),
    email_nguoi_nhan VARCHAR(30),
    ghi_chu NVARCHAR(max),
    tong_tien DECIMAL(19, 4),
    trang_thai NVARCHAR(50),
    ngay_tao DATETIME,
    phuong_thuc_van_chuyen NVARCHAR(20),
    ngay_van_chuyen DATETIME,
    phuong_thuc_thanh_toan NVARCHAR(10),
    id_khach_hang INT, -- Thay VARCHAR(10) thành INT để khớp với id của khach_hang
    id_phieu_giam_gia INT, -- Thay VARCHAR(10) thành INT để khớp với id của phieu_giam_gia
    id_tai_khoan INT, -- Thay VARCHAR(10) thành INT để khớp với id của tai_khoan
    ly_do_huy NVARCHAR(225),
    ma_van_don VARCHAR(255),
    loai_don_hang VARCHAR(20),
    ma_tinh INT,
    ma_quan INT,
    ma_phuong VARCHAR(20),
    phi_van_chuyen DECIMAL(19, 4),
    trong_luong float NULL,
    chieu_dai float NULL,
    chieu_rong float,
    chieu_cao FLOAT, -- Thêm cột chieu_cao (FLOAT)
    luong_ban INT DEFAULT 1,
    CONSTRAINT fk_id_tai_khoan FOREIGN KEY (id_tai_khoan) REFERENCES tai_khoan(id),
    CONSTRAINT fk_id_phieu_giam_gia FOREIGN KEY (id_phieu_giam_gia) REFERENCES phieu_giam_gia(id),
    CONSTRAINT fk_id_khach_hang FOREIGN KEY (id_khach_hang) REFERENCES khach_hang(id) -- Thêm khóa ngoại cho id_khach_hang
);
GO

-- Bảng thương hiệu
CREATE TABLE thuong_hieu (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    ten_thuong_hieu NVARCHAR(100),
    quoc_gia NVARCHAR(50),
    mo_ta NVARCHAR(MAX)
);
GO

-- Bảng danh mục
CREATE TABLE danh_muc (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    ten_danh_muc NVARCHAR(50),
    mo_ta NVARCHAR(MAX)
);
GO

-- Bảng nhóm hương
CREATE TABLE nhom_huong (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    ten_nhom NVARCHAR(100),
    mo_ta NVARCHAR(MAX)
);
GO

-- Bảng hương đầu
CREATE TABLE huong_dau (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    mota NVARCHAR(MAX)
);
GO

-- Bảng hương giữa
CREATE TABLE huong_giua (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    mota NVARCHAR(MAX)
);
GO

-- Bảng hương cuối
CREATE TABLE huong_cuoi (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    mota NVARCHAR(MAX)
);
GO

-- Bảng sản phẩm
CREATE TABLE san_pham (
    id INT IDENTITY(1000, 1) PRIMARY KEY, -- Thay VARCHAR(10) thành INT IDENTITY
    ten NVARCHAR(MAX),
    mo_ta NVARCHAR(MAX),
    id_thuong_hieu INT,
    id_danh_muc INT,
    id_huong_dau INT,
    id_huong_giua INT,
    id_huong_cuoi INT,
    id_nhom_huong INT,
    trang_thai INT DEFAULT 1,--1:đang bán,0:ngừng bán--
	create_date DATETIME DEFAULT GETDATE(),
    CONSTRAINT fk_id_thuong_hieu FOREIGN KEY (id_thuong_hieu) REFERENCES thuong_hieu(id),
    CONSTRAINT fk_id_danh_muc FOREIGN KEY (id_danh_muc) REFERENCES danh_muc(id),
    CONSTRAINT fk_id_huong_dau FOREIGN KEY (id_huong_dau) REFERENCES huong_dau(id),
    CONSTRAINT fk_id_huong_giua FOREIGN KEY (id_huong_giua) REFERENCES huong_giua(id),
    CONSTRAINT fk_id_huong_cuoi FOREIGN KEY (id_huong_cuoi) REFERENCES huong_cuoi(id),
    CONSTRAINT fk_id_nhom_huong FOREIGN KEY (id_nhom_huong) REFERENCES nhom_huong(id)
);
GO

-- Bảng hình ảnh
CREATE TABLE hinh_anh (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    link NVARCHAR(max),
    id_san_pham INT, -- Thay VARCHAR(10) thành INT để khớp với id của san_pham
    CONSTRAINT fk_id_san_pham1 FOREIGN KEY (id_san_pham) REFERENCES san_pham(id)
);
GO

-- Bảng sản phẩm chi tiết (spct)
CREATE TABLE spct (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    don_gia DECIMAL(19, 4),
    so_luong_ton_kho INT,
    id_san_pham INT, -- Thay VARCHAR(10) thành INT để khớp với id của san_pham
    dung_tich INT,
	trang_thai INT DEFAULT 1, --1:đang bán,0:ngừng bán--
    CONSTRAINT fk_id_san_pham2 FOREIGN KEY (id_san_pham) REFERENCES san_pham(id)
);
GO

-- Bảng chi tiết đơn hàng
CREATE TABLE chi_tiet_don_hang (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    don_gia DECIMAL(19, 4),
    so_luong INT,
    thanh_tien DECIMAL(19, 4),
    id_don_hang INT, -- Giữ nguyên để khớp với id của don_hang
    id_spct INT,
    CONSTRAINT fk_id_don_hang FOREIGN KEY (id_don_hang) REFERENCES don_hang(id),
    CONSTRAINT fk_id_spct FOREIGN KEY (id_spct) REFERENCES spct(id)
);
GO

-- Bảng phản hồi
CREATE TABLE phan_hoi (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    danh_gia NVARCHAR(MAX),
    id_san_pham INT, -- Thay VARCHAR(10) thành INT để khớp với id của san_pham
    id_tai_khoan INT, -- Thay VARCHAR(10) thành INT để khớp với id của tai_khoan
    CONSTRAINT fk_id_san_pham3 FOREIGN KEY (id_san_pham) REFERENCES san_pham(id),
    CONSTRAINT fk_id_tai_khoan2 FOREIGN KEY (id_tai_khoan) REFERENCES tai_khoan(id)
);
GO

-- Bảng đánh giá dịch vụ
CREATE TABLE danh_gia_dich_vu (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    mo_ta NVARCHAR(MAX),
    id_don_hang INT, -- Giữ nguyên để khớp với id của don_hang
    id_khach_hang INT, -- Thay VARCHAR(10) thành INT để khớp với id của khach_hang
    FOREIGN KEY (id_don_hang) REFERENCES don_hang(id),
    FOREIGN KEY (id_khach_hang) REFERENCES khach_hang(id)
);
GO

-- Bảng lịch sử thao tác
CREATE TABLE LichSuThaoTac (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    maDonHang INT NOT NULL, -- Giữ nguyên để khớp với id của don_hang
    taiKhoanId INT NOT NULL, -- Thay VARCHAR(10) thành INT để khớp với id của tai_khoan
    tenTaiKhoan nvarchar(255),
    thaoTac nvarchar(max) NOT NULL,
    trangThaiCu INT,
    trangThaiMoi INT,
    thoiGianThaoTac DATETIME NOT NULL,
    ghiChu NVARCHAR(MAX),
    FOREIGN KEY (maDonHang) REFERENCES don_hang(id),
    FOREIGN KEY (taiKhoanId) REFERENCES tai_khoan(id)
);
GO
CREATE TABLE danh_gia (
    id BIGINT PRIMARY KEY IDENTITY(1,1), -- Tự tăng bắt đầu từ 1, mỗi lần tăng 1
    id_san_pham INT NOT NULL,
    id_tai_khoan INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    ngay_tao DATETIME DEFAULT GETDATE(), -- SQL Server dùng GETDATE() thay cho CURRENT_TIMESTAMP
    FOREIGN KEY (id_san_pham) REFERENCES san_pham(id),
    FOREIGN KEY (id_tai_khoan) REFERENCES tai_khoan(id)
);
GO
ALTER TABLE tai_khoan
ADD dia_chi NVARCHAR(255);
-- Bảng mùi hương
CREATE TABLE mui_huong (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    ten_mui_huong NVARCHAR(100),
    mo_ta NVARCHAR(MAX)
);
GO

-- Bảng trung gian cho quan hệ nhiều-nhiều giữa mui_huong và nhom_huong
CREATE TABLE mui_huong_nhom_huong (
    id_mui_huong INT,
    id_nhom_huong INT,
    PRIMARY KEY (id_mui_huong, id_nhom_huong),
    FOREIGN KEY (id_mui_huong) REFERENCES mui_huong(id),
    FOREIGN KEY (id_nhom_huong) REFERENCES nhom_huong(id)
);
GO
-- Bảng nốt hương
CREATE TABLE not_huong (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    ten_not_huong NVARCHAR(100),
    mo_ta NVARCHAR(MAX),
    id_mui_huong INT, -- Khóa ngoại tham chiếu đến mui_huong (nhiều nốt hương thuộc một mùi hương)
    CONSTRAINT fk_id_mui_huong_not FOREIGN KEY (id_mui_huong) REFERENCES mui_huong(id)
);
GO
CREATE TABLE huong_dau_not_huong (
    id_huong_dau INT,
    id_not_huong INT,
    PRIMARY KEY (id_huong_dau, id_not_huong),
    FOREIGN KEY (id_huong_dau) REFERENCES huong_dau(id),
    FOREIGN KEY (id_not_huong) REFERENCES not_huong(id)
);
GO
CREATE TABLE huong_giua_not_huong (
    id_huong_giua INT,
    id_not_huong INT,
    PRIMARY KEY (id_huong_giua, id_not_huong),
    FOREIGN KEY (id_huong_giua) REFERENCES huong_giua(id),
    FOREIGN KEY (id_not_huong) REFERENCES not_huong(id)
);
GO
CREATE TABLE huong_cuoi_not_huong (
    id_huong_cuoi INT,
    id_not_huong INT,
    PRIMARY KEY (id_huong_cuoi, id_not_huong),
    FOREIGN KEY (id_huong_cuoi) REFERENCES huong_cuoi(id),
    FOREIGN KEY (id_not_huong) REFERENCES not_huong(id)
);
GO
CREATE TABLE phong_cach (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    ten_phong_cach NVARCHAR(50),
    mo_ta NVARCHAR(MAX)
);
GO
CREATE TABLE san_pham_phong_cach (
    id_san_pham INT,
    id_phong_cach INT,
    PRIMARY KEY (id_san_pham, id_phong_cach),
    FOREIGN KEY (id_san_pham) REFERENCES san_pham(id),
    FOREIGN KEY (id_phong_cach) REFERENCES phong_cach(id)
);
GO
CREATE TABLE san_pham_mui_huong (
    id_san_pham INT,
    id_mui_huong INT,
    prominence DECIMAL(3, 1), -- Mức độ nổi bật của mùi hương trong sản phẩm (từ 0 đến 1, dùng để hiển thị độ dài thanh trong biểu đồ)
    PRIMARY KEY (id_san_pham, id_mui_huong),
    FOREIGN KEY (id_san_pham) REFERENCES san_pham(id),
    FOREIGN KEY (id_mui_huong) REFERENCES mui_huong(id)
);
GO
CREATE TABLE su_dung_phieu_giam_gia (
    id BIGINT identity(100,1) PRIMARY KEY ,
    pgg_id int NOT NULL,
    sdt VARCHAR(15) NOT NULL,
    ngay_su_dung DATETIME NOT NULL,
    FOREIGN KEY (pgg_id) REFERENCES phieu_giam_gia(id)
);
CREATE TABLE GioHang (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    id_tai_khoan INT, -- Liên kết với bảng tai_khoan thay vì khach_hang để đồng bộ với frontend
    ngay_tao DATETIME DEFAULT GETDATE(),
    trang_thai INT DEFAULT 1, -- 1: Hoạt động, 0: Đã thanh toán/xóa
    CONSTRAINT fk_id_tai_khoan_gio_hang FOREIGN KEY (id_tai_khoan) REFERENCES tai_khoan(id)
);
GO

-- Bảng ChiTietGioHang (Chi tiết giỏ hàng)
CREATE TABLE ChiTietGioHang (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    id_gio_hang INT,
    id_spct INT,
    so_luong INT NOT NULL,
    don_gia DECIMAL(19, 4), -- Giá tại thời điểm thêm vào giỏ
    CONSTRAINT fk_id_gio_hang FOREIGN KEY (id_gio_hang) REFERENCES GioHang(id),
    CONSTRAINT fk_id_spct_gio_hang FOREIGN KEY (id_spct) REFERENCES spct(id)
);
GO
CREATE TABLE nong_do (
    id INT IDENTITY(1000,1)primary key,
    ten_nong_do NVARCHAR(50) NOT NULL, -- ví dụ: Parfum classic, Eau de parfum
    mo_ta NVARCHAR(MAX),               -- có thể ghi chú thêm nồng độ %, thời gian lưu hương, v.v.
    ty_le_tinh_dau DECIMAL(4,2)        -- ví dụ: 25.00 (cho Parfum classic ~ 25%)
);
GO
INSERT INTO nong_do (ten_nong_do, mo_ta, ty_le_tinh_dau) VALUES
(N'Parfum classic', N'Lưu hương 8–12 giờ, rất đậm đặc', 25.00),
(N'Eau de parfum', N'Lưu hương 6–8 giờ', 18.00),
(N'Eau de toilette', N'Lưu hương 3–5 giờ', 10.00),
(N'Eau de cologne', N'Lưu hương 1–3 giờ', 5.00),
(N'Eau fraiche', N'Lưu hương <2 giờ', 2.00);
GO
ALTER TABLE san_pham
ADD id_nong_do INT;
GO

ALTER TABLE san_pham
ADD CONSTRAINT fk_id_nong_do_san_pham FOREIGN KEY (id_nong_do) REFERENCES nong_do(id);
GO

-- Thêm cột id_don_hang vào bảng danh_gia
ALTER TABLE danh_gia
ADD id_don_hang INT;
GO

-- Thêm ràng buộc FOREIGN KEY cho cột id_don_hang trong bảng danh_gia
ALTER TABLE danh_gia
ADD CONSTRAINT FK_DanhGia_DonHang
FOREIGN KEY (id_don_hang) REFERENCES don_hang(id);
GO

-- Thêm ràng buộc UNIQUE cho 3 cột trong bảng danh_gia
ALTER TABLE danh_gia
ADD CONSTRAINT UQ_DanhGia_SanPham_TaiKhoan_DonHang
UNIQUE (id_san_pham, id_tai_khoan, id_don_hang);
GO

-- Tạo bảng chat_message
CREATE TABLE chat_message (
    id BIGINT IDENTITY(1,1) PRIMARY KEY, -- Khóa chính tự tăng
    sender_id INT NOT NULL,              -- ID người gửi (liên kết với bảng tai_khoan)
    receiver_id INT NOT NULL,            -- ID người nhận (liên kết với bảng tai_khoan)
    content NVARCHAR(MAX) NOT NULL,      -- Nội dung tin nhắn
    is_recalled BIT NOT NULL DEFAULT 0,  -- Trạng thái thu hồi
    timestamp DATETIME NOT NULL DEFAULT GETDATE(), -- Thời gian gửi, mặc định là thời gian hiện tại
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES tai_khoan(id), -- Khóa ngoại đến bảng tai_khoan
    CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES tai_khoan(id) -- Khóa ngoại đến bảng tai_khoan
);
GO

-- Tạo bảng yeu_cau_tra_hang
CREATE TABLE yeu_cau_tra_hang (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    id_don_hang INT NOT NULL,
    id_tai_khoan INT NOT NULL,
    id_spct INT NOT NULL,
    so_luong INT NOT NULL,
    ly_do_tra_hang NVARCHAR(255) NOT NULL,
    tinh_trang_hang NVARCHAR(20) NOT NULL,
    hinh_thuc_tra_hang NVARCHAR(20) NOT NULL,
    ngay_yeu_cau DATETIME NOT NULL DEFAULT GETDATE(),
    ngay_duyet DATETIME,
    id_tai_khoan_duyet INT,
    ghi_chu NVARCHAR(MAX),
    trangThai INT, -- Thêm cột trangThai ngay trong lúc tạo bảng
    urlVideo VARCHAR(MAX), -- Thêm cột urlVideo ngay trong lúc tạo bảng
    CONSTRAINT fk_id_don_hang_tra_hang FOREIGN KEY (id_don_hang) REFERENCES don_hang(id),
    CONSTRAINT fk_id_tai_khoan_tra_hang FOREIGN KEY (id_tai_khoan) REFERENCES tai_khoan(id),
    CONSTRAINT fk_id_spct_tra_hang FOREIGN KEY (id_spct) REFERENCES spct(id),
    CONSTRAINT fk_id_tai_khoan_duyet FOREIGN KEY (id_tai_khoan_duyet) REFERENCES tai_khoan(id),
    CONSTRAINT chk_tinh_trang_hang CHECK (tinh_trang_hang IN ('NguyenVen', 'HuHong')),
    CONSTRAINT chk_hinh_thuc_tra_hang CHECK (hinh_thuc_tra_hang IN ('TaiCuaHang', 'QuaVanChuyen'))
);
GO

-- Tạo bảng lich_su_tra_hang
CREATE TABLE lich_su_tra_hang (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    id_yeu_cau_tra_hang INT NOT NULL,
    thao_tac INT NOT NULL,
    trang_thai_cu NVARCHAR(50),
    trang_thai_moi NVARCHAR(50),
    thoi_gian_thao_tac DATETIME NOT NULL DEFAULT GETDATE(),
    id_tai_khoan INT NOT NULL,
    ghi_chu NVARCHAR(255),
    ly_do_tu_choi NVARCHAR(255), -- Thêm cột ly_do_tu_choi ngay trong lúc tạo bảng
    CONSTRAINT fk_id_yeu_cau_tra_hang_lich_su FOREIGN KEY (id_yeu_cau_tra_hang) REFERENCES yeu_cau_tra_hang(id),
    CONSTRAINT fk_id_tai_khoan_lich_su FOREIGN KEY (id_tai_khoan) REFERENCES tai_khoan(id)
);
GO

-- Tạo bảng tra_hang_nha_san_xuat
CREATE TABLE tra_hang_nha_san_xuat (
    id INT IDENTITY(1000, 1) PRIMARY KEY,
    id_yeu_cau_tra_hang INT NOT NULL,
    id_thuong_hieu INT NOT NULL,
    ngay_gui_tra DATETIME,
    trang_thai_gui INT NOT NULL,
    ghi_chu NVARCHAR(255),
    CONSTRAINT fk_id_yeu_cau_tra_hang_nsx FOREIGN KEY (id_yeu_cau_tra_hang) REFERENCES yeu_cau_tra_hang(id),
    CONSTRAINT fk_id_thuong_hieu_nsx FOREIGN KEY (id_thuong_hieu) REFERENCES thuong_hieu(id)
);
GO

-- Tạo bảng hinh_anh_yeu_cau_tra_hang
CREATE TABLE hinh_anh_yeu_cau_tra_hang (
    id INT IDENTITY(10,1) PRIMARY KEY,
    id_yeu_cau_tra_hang INT NOT NULL,
    url_hinh_anh NVARCHAR(255) NOT NULL,
    CONSTRAINT FK_hinh_anh_yeu_cau_tra_hang_yeu_cau FOREIGN KEY (id_yeu_cau_tra_hang) REFERENCES yeu_cau_tra_hang(id)
);
GO
alter table phieu_giam_gia
add trang_thai int default 1 
GO
update phieu_giam_gia
set trang_thai =1
select*from phieu_giam_gia
GO
CREATE TABLE Banners (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    image_url NVARCHAR(500) NOT NULL,
    link_url NVARCHAR(500),
    position NVARCHAR(50),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO
ALTER TABLE Banners
ALTER COLUMN is_active INT;
GO
ALTER TABLE Banners
DROP CONSTRAINT DF__Banners__is_acti__0E04126B;
GO
ALTER TABLE Banners
ADD CONST
GO
ALTER TABLE phieu_giam_gia
ADD gia_tri_don_toi_thieu DECIMAL(10, 2) NOT NULL DEFAULT 0.01
GO

UPDATE phieu_giam_gia
SET gia_tri_don_toi_thieu = 300000