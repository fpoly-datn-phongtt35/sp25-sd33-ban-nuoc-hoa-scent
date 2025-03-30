import { MomoPaymentService } from './../service/momoPayment.service';
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderService } from '../service/order.service';
import { CartService } from '../service/cart.Service';
import { Router } from '@angular/router';
import { TokenService } from '../service/token.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { DiaChiService } from '../service/diachi.service';

interface OrderDetail {
  spctId: number;
  quantity: number;
}

interface Order {
  idTaiKhoan: number;
  tenNguoiNhanHang: string;
  diaChiGiaoHang: string;
  diachiChiTiet:string;
  sdtNguoiNhan: string;
  phuongThucThanhToan: string;
  chiTietDonHangs: OrderDetail[];
  ghichu: string;
}

interface DiaChiDonVi {
  id: string; // ✅ từ number → string
  name: string;
}


@Component({
  selector: 'app-order',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
})
export class OrderComponent implements OnInit {
  orderData: Order = {
    idTaiKhoan: 0,
    tenNguoiNhanHang: '',
    diaChiGiaoHang: '',
    diachiChiTiet:'',
    sdtNguoiNhan: '',
    phuongThucThanhToan: '',
    chiTietDonHangs: [],
    ghichu: '',
  };

  selectedProducts: any[] = [];
  totalProductPrice = 0;
  discount = 0;
  shippingFee = 0;
  finalAmount = 0;
  currentTab: 'tinh' | 'huyen' | 'xa' = 'tinh';
  danhSachTinh: DiaChiDonVi[] = [];
  danhSachHuyen: DiaChiDonVi[] = [];
  danhSachXa: DiaChiDonVi[] = [];
  selectedTinh: DiaChiDonVi | null = null;
  selectedHuyen: DiaChiDonVi | null = null;
  selectedXa: DiaChiDonVi | null = null;
  showAddressPicker = false;
  addressTouched = false;
  fullAddress = '';
  searchTinh = '';
  searchHuyen = '';
  searchXa = '';
  shippingDiscount = 0; // Giảm giá ship theo số lượng

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef,
    private diaChiService: DiaChiService,
    private momoPaymentService:MomoPaymentService
  ) {}

  ngOnInit() {
    this.layTinhThanh();
    const idTaiKhoan = this.tokenService.getUserId() || Number(localStorage.getItem('idTaiKhoan'));
    if (!idTaiKhoan) {
      console.error('Token không tồn tại hoặc rỗng.');
      return;
    }
    this.orderData.idTaiKhoan = idTaiKhoan;

    const stored = localStorage.getItem('selectedProducts');
    if (stored) {
      const parsed = JSON.parse(stored);
      this.selectedProducts = parsed.map((item: any) => ({
        tenSanPham: item.product.tenSanPham,
        quantity: item.quantity,
        volume: item.volume,
        donGia: item.product.donGia,
        imageUrl: item.product.imageURL,
      }));

      this.orderData.chiTietDonHangs = parsed.map((item: any) => ({
        spctId: item.product.idSpct,
        quantity: item.quantity,
      }));

      this.calculateTotals();
    }
  }
  get searchValue(): string {
    if (this.currentTab === 'tinh') return this.searchTinh;
    if (this.currentTab === 'huyen') return this.searchHuyen;
    return this.searchXa;
  }

  set searchValue(value: string) {
    if (this.currentTab === 'tinh') this.searchTinh = value;
    else if (this.currentTab === 'huyen') this.searchHuyen = value;
    else this.searchXa = value;
  }

  // ====================== ĐỊA CHỈ ======================

  private mapDiaChiObjectToArray(resultObj: any): DiaChiDonVi[] {
    return Object.entries(resultObj).map(([id, name]) => ({
      id: id, // ❗️Không ép Number!
      name: name as string,
    }));
  }

  isSelected(item: DiaChiDonVi): boolean {
    if (this.currentTab === 'tinh') return this.selectedTinh?.id === item.id;
    if (this.currentTab === 'huyen') return this.selectedHuyen?.id === item.id;
    if (this.currentTab === 'xa') return this.selectedXa?.id === item.id;
    return false;
  }

  get currentList(): DiaChiDonVi[] {
    let list: DiaChiDonVi[] = [];

    if (this.currentTab === 'tinh') {
      list = this.danhSachTinh;
      return list.filter(item => item.name.toLowerCase().includes(this.searchTinh.toLowerCase()));
    }

    if (this.currentTab === 'huyen') {
      list = this.danhSachHuyen;
      return list.filter(item => item.name.toLowerCase().includes(this.searchHuyen.toLowerCase()));
    }

    list = this.danhSachXa;
    return list.filter(item => item.name.toLowerCase().includes(this.searchXa.toLowerCase()));
  }


  selectTab(tab: 'tinh' | 'huyen' | 'xa') {
    if ((tab === 'huyen' && !this.selectedTinh) || (tab === 'xa' && !this.selectedHuyen)) return;
    this.currentTab = tab;
  }

  onSelect(item: DiaChiDonVi) {
    if (this.currentTab === 'tinh') {
      this.selectedTinh = item;
      this.selectedHuyen = this.selectedXa = null;
      this.fullAddress = item.name;
      this.orderData.diaChiGiaoHang = '';

      if (item.id) {
        this.layQuanHuyen(item.id); // ✅ Chỉ gọi nếu có id tỉnh
        this.selectTab('huyen');
      }

    } else if (this.currentTab === 'huyen') {
      if (!this.selectedTinh) return; // ✅ Phòng lỗi chưa chọn tỉnh
      this.selectedHuyen = item;
      this.selectedXa = null;
      this.fullAddress = `${item.name}, ${this.selectedTinh?.name}`;

      if (item.id) {
        this.layPhuongXa(item.id); // ✅ Chỉ gọi nếu có id huyện
        this.selectTab('xa');
      }

    } else if (this.currentTab === 'xa') {
      if (!this.selectedHuyen || !this.selectedTinh) return; // ✅ Chặn nếu thiếu huyện/tỉnh
      this.selectedXa = item;
      this.fullAddress = `${item.name}, ${this.selectedHuyen?.name}, ${this.selectedTinh?.name}`;
      this.orderData.diaChiGiaoHang = this.fullAddress;
      this.showAddressPicker = false;
      this.tinhPhiVanChuyen();
    }
  }


  toggleAddressPicker() {
    this.showAddressPicker = !this.showAddressPicker;
    this.addressTouched = true;
  }


  layTinhThanh() {
    this.diaChiService.getTinhThanh().subscribe((res) => {
      this.danhSachTinh = this.mapDiaChiObjectToArray(res.result);
    });
  }

  layQuanHuyen(idTinh: string) {
    this.diaChiService.getQuanHuyen(idTinh).subscribe((res) => {
      this.danhSachHuyen = this.mapDiaChiObjectToArray(res.result);
    });
  }

  layPhuongXa(idHuyen: string) {
    this.diaChiService.getPhuongXa(idHuyen).subscribe((res) => {
      this.danhSachXa = this.mapDiaChiObjectToArray(res.result);
    });
  }

  getQuyDoiKichThuocVaCanNang(soLuong: number) {
    const weight = soLuong * 150; // 150g mỗi chai 100ml, đã bao gồm hộp

    let length = 12;
    let width = 6;
    let height = 6;

    if (soLuong <= 1) {
      length = 12;
      width = 6;
      height = 6;
    } else if (soLuong <= 4) {
      length = 15;
      width = 10;
      height = 7;
    } else if (soLuong <= 8) {
      length = 20;
      width = 12;
      height = 8;
    } else if (soLuong <= 12) {
      length = 22;
      width = 14;
      height = 10;
    } else if (soLuong <= 20) {
      length = 26;
      width = 18;
      height = 12;
    } else {
      const multiplier = Math.ceil(soLuong / 20);
      length = 26 * multiplier;
      width = 18 * multiplier;
      height = 12 * multiplier;
    }

    const volWeight = (length * width * height) / 5;
    const usedWeight = Math.max(weight, volWeight);

    // ✅ Giảm phí ship theo số lượng
    let discountRate = 0;
    if (soLuong >= 10) discountRate = 0.2;
    else if (soLuong >= 6) discountRate = 0.15;
    else if (soLuong >= 3) discountRate = 0.1;

    console.log(`📦 ${soLuong} chai | Thực: ${weight}g | Quy đổi: ${volWeight.toFixed(0)}g → Dùng: ${usedWeight.toFixed(0)}g`);
    console.log(`📐 Kích thước: ${length} x ${width} x ${height} cm`);
    console.log(`🎁 Giảm phí ship: ${discountRate * 100}%`);

    return {
      weight: Math.ceil(usedWeight),
      length,
      width,
      height,
      discountRate // ✅ Trả thêm giá trị này ra
    };
  }




  tinhPhiVanChuyen() {
    const soLuong = this.selectedProducts.reduce((sum, item) => sum + item.quantity, 0);
    console.log('📦 Số lượng sản phẩm:', soLuong);
    const { weight, length, width, height, discountRate } = this.getQuyDoiKichThuocVaCanNang(soLuong);

    // ✅ Kiểm tra địa chỉ đầy đủ
    if (!this.selectedTinh || !this.selectedHuyen || !this.selectedXa) {
      console.warn('⚠️ Chưa chọn đầy đủ Tỉnh, Huyện, Xã => Không tính phí vận chuyển.');
      this.shippingFee = 0;
      this.calculateTotals();
      return;
    }

    // ✅ Tính kích thước & trọng lượng gói hàng

    const body = {
      from_district_id: 1482,
      to_ward_code: String(this.selectedXa?.id || ''), // ✅ dùng động
      weight,
      length,
      width,
      height,
      idMaTinh: this.selectedTinh?.id || 0,
      idQuanHuyen: this.selectedHuyen?.id || 0,
      idPhuongXa: this.selectedXa?.id || 0,
      soLuongSanPham: soLuong,
      trungBinhCacCanh: Math.round((length + width + height) / 3),
    };


    console.log('🚀 Gửi yêu cầu tính phí:', body);

    this.diaChiService.tinhPhiVanChuyen(body).subscribe({
      next: (fee) => {
        const giamPhi = Math.round(fee * discountRate);
        const finalFee = fee - giamPhi;

        this.shippingDiscount = giamPhi;
        this.shippingFee = finalFee;
        this.calculateTotals();
      }
    });
  }



  // ====================== ĐƠN HÀNG ======================

  calculateTotals() {
    const products = Array.isArray(this.selectedProducts) ? this.selectedProducts : [];

    this.totalProductPrice = products.reduce((total, item) => {
      return total + (item.quantity || 0) * (item.donGia || 0);
    }, 0);

    this.discount = 0;
    this.finalAmount = this.totalProductPrice + this.shippingFee - this.discount;
  }

  updateQuantity(index: number, change: number) {
    const newQty = this.selectedProducts[index].quantity + change;
    if (newQty < 1) return this.removeProduct(index);

    this.selectedProducts[index].quantity = newQty;
    this.orderData.chiTietDonHangs[index].quantity = newQty;

    localStorage.setItem('selectedProducts', JSON.stringify(this.selectedProducts));
    this.calculateTotals();
    this.tinhPhiVanChuyen(); // ✅ Gọi lại để cập nhật kích thước/khối lượng

  }

  removeProduct(index: number) {
    this.selectedProducts.splice(index, 1);
    this.orderData.chiTietDonHangs.splice(index, 1);
    localStorage.setItem('selectedProducts', JSON.stringify(this.selectedProducts));
    this.calculateTotals();
    this.tinhPhiVanChuyen();
    if (this.selectedProducts.length === 0) {
      this.router.navigate(['/']);
    }
  }

  // 🔧 GIẢI PHÁP: Xử lý thanh toán bằng tiền mặt và MoMo (CK)

// 🔧 GIẢI PHÁP: Xử lý thanh toán bằng tiền mặt và MoMo (CK)

onSubmit() {
  if (
    !this.orderData.tenNguoiNhanHang ||
    !this.orderData.diachiChiTiet ||
    !this.orderData.sdtNguoiNhan ||
    !this.orderData.phuongThucThanhToan
  ) {
    alert('Vui lòng nhập đầy đủ thông tin giao hàng!');
    return;
  }

  const isCk = this.orderData.phuongThucThanhToan === 'ck';

  const payload = {
    ...this.orderData,
    diaChiGiaoHang: `${this.orderData.diachiChiTiet}, ${this.fullAddress}`,
    phuongThucVanChuyen: 'Giao hàng nhanh',
    ngayVanChuyen: new Date().toISOString(),
    chiTietDonHangs: this.orderData.chiTietDonHangs.map((item) => ({
      spctId: Number(item.spctId),
      quantity: Number(item.quantity),
    })),
    totalAmount: this.finalAmount,
    maTinh: String(this.selectedTinh?.id || ''),
    maQuan: String(this.selectedHuyen?.id || ''),
    maPhuong: String(this.selectedXa?.id || ''),
    trangThai: 1 // ✅ Gán trạng thái ban đầu tùy theo phương thức thanh toán//6🟡 Chờ thanh toán//
  };

  if (!isCk) {
    // ✅ Tiền mặt → tạo đơn hàng rồi chuyển trang luôn
    this.orderService.createOrder(payload).subscribe({
      next: (res) => {
        this.cartService.clearCartOnClient();
        localStorage.removeItem('selectedProducts');
        this.router.navigate(['/order-success', res.id]);
      },
      error: (err) => {
        console.error('❌ Lỗi khi tạo đơn hàng:', err);
      },
    });
    return;
  }

  // ✅ Chuyển khoản → tạo đơn xong rồi gọi MoMo
  this.orderService.createOrder(payload).subscribe({
    next: (orderRes) => {
      const utf8ToBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));

      const extraDataObj = {
        amount: this.finalAmount,
        orderInfo: `Thanh toán đơn hàng ${orderRes.id} từ SCENT`,
        orderId: 'ORDER_' + orderRes.id,
      };

      const extraData = utf8ToBase64(JSON.stringify(extraDataObj));

      const momoRequest = {
        orderId: extraDataObj.orderId,
        requestId: 'REQ_' + new Date().getTime(),
        orderInfo: extraDataObj.orderInfo,
        amount: this.finalAmount.toString(),
        returnUrl: `http://localhost:4200/order-success/${orderRes.id}?extraData=${extraData}`,
        notifyUrl: 'http://localhost:8080/api/momo/callback',
        requestType: 'payWithMethod',
        extraData: extraData,
      };

      this.momoPaymentService.createPayment(momoRequest).subscribe({
        next: (res: any) => {
          if (res.payUrl) {
            window.location.href = res.payUrl;
          } else {
            console.error('❌ Không nhận được payUrl từ MoMo');
          }
        },
        error: (err) => {
          console.error('❌ Lỗi khi gọi API MoMo:', err);
        },
      });
    },
    error: (err) => {
      console.error('❌ Lỗi khi tạo đơn hàng (trước khi gọi MoMo):', err);
    },
  });
}



}
