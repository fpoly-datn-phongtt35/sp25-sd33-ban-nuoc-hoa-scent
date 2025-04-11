import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderService } from '../service/order.service';
import { Router } from '@angular/router';
import { TokenService } from '../service/token.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { DiaChiService } from '../service/diachi.service';
import { MomoPaymentService } from '../service/momoPayment.service';
import { PhieugiamgiaService } from '../service/phieugiamgia.service';
import { CartService, CartItemWithKey } from '../service/cart.Service';
import { VietQRService } from '../service/VietQR.Service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

interface OrderDetail {
  spctId: number;
  quantity: number;
}

interface Order {
  idTaiKhoan: number | null;
  tenNguoiNhanHang: string;
  diaChiGiaoHang: string;
  diachiChiTiet: string;
  sdtNguoiNhan: string;
  phuongThucThanhToan: string;
  chiTietDonHangs: OrderDetail[];
  ghichu: string;
  maGiamGia?: string;
  maTinh?: string;
  maQuan?: string;
  maPhuong?: string;
  trungBinhCacCanh?: number;
  trangThai?: number;
  totalAmount?: number;
}

interface DiaChiDonVi {
  id: string;
  name: string;
}

interface DiscountResponse {
  giaTriGiam: number;
  giaTriToiDa?: number;
  ngayBatDau: string;
  ngayHetHan: string;
  soLuong: number;
}

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit {
  orderData: Order = {
    idTaiKhoan: null,
    tenNguoiNhanHang: '',
    diaChiGiaoHang: '',
    diachiChiTiet: '',
    sdtNguoiNhan: '',
    phuongThucThanhToan: '',
    chiTietDonHangs: [],
    ghichu: '',
    maGiamGia: '',
  };
  discountErrorMessage: string = '';
  discountAmount: number = 0;
  selectedProducts: CartItemWithKey[] = [];
  totalProductPrice = 0;
  discount = 0;
  shippingFee = 0;
  shippingDiscount = 0;
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
  vietQRString: string | null = null;
  orderId: string | null = null;
  isAddressChanged = false;
  isDiscountApplied: boolean = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef,
    private diaChiService: DiaChiService,
    private momoPaymentService: MomoPaymentService,
    private phieugiamgiaService: PhieugiamgiaService,
    private vietQRService: VietQRService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.layTinhThanh();
    const idTaiKhoan = this.tokenService.getUserId() || Number(localStorage.getItem('idTaiKhoan'));
    this.orderData.idTaiKhoan = idTaiKhoan ? Number(idTaiKhoan) : null;

    // Lấy selectedProducts từ CartService
    this.selectedProducts = this.cartService.getSelectedCartItems();

    if (this.selectedProducts.length > 0) {
      this.orderData.chiTietDonHangs = this.selectedProducts.map((item) => ({
        spctId: item.product.idSpct,
        quantity: item.quantity,
      }));
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Không có sản phẩm',
        text: 'Vui lòng chọn sản phẩm để đặt hàng!',
        position: 'bottom-end'
      }).then(() => {
        this.router.navigate(['/cart']);
      });
      return;
    }

    if (this.orderData.idTaiKhoan) {
      this.orderService.getLatestOrder(this.orderData.idTaiKhoan).subscribe(
        (data) => {
          if (data) {
            this.orderData.tenNguoiNhanHang = data.tenNguoiNhanHang || '';
            this.orderData.sdtNguoiNhan = data.sdtNguoiNhan || '';
            this.shippingFee = data.phiVanChuyen || 0;
            this.shippingDiscount = 0;

            if (data.diaChiGiaoHang) {
              const addressParts = data.diaChiGiaoHang.split(', ');
              if (addressParts.length >= 4) {
                this.orderData.diachiChiTiet = addressParts[0];
                this.fullAddress = addressParts.slice(1).join(', ');
                this.orderData.diaChiGiaoHang = this.fullAddress;

                const xaName = addressParts[1];
                const huyenName = addressParts[2];
                const tinhName = addressParts[3];

                this.diaChiService.getTinhThanh().subscribe((res) => {
                  const tinhList = this.mapDiaChiObjectToArray(res.result);
                  const tinh = tinhList.find((t) => t.name === tinhName);
                  if (tinh) {
                    this.selectedTinh = tinh;
                    this.diaChiService.getQuanHuyen(tinh.id).subscribe((huyenRes) => {
                      const huyenList = this.mapDiaChiObjectToArray(huyenRes.result);
                      const huyen = huyenList.find((h) => h.name === huyenName);
                      if (huyen) {
                        this.selectedHuyen = huyen;
                        this.diaChiService.getPhuongXa(huyen.id).subscribe((xaRes) => {
                          const xaList = this.mapDiaChiObjectToArray(xaRes.result);
                          const xa = xaList.find((x) => x.name === xaName);
                          if (xa) {
                            this.selectedXa = xa;
                            this.tinhPhiVanChuyen();
                          }
                        });
                      }
                    });
                  }
                });
              } else {
                this.orderData.diachiChiTiet = data.diaChiGiaoHang;
              }
            }
          }
          this.calculateTotals();
        },
        (error) => {
          console.error('Lỗi khi lấy đơn hàng gần nhất:', error);
          this.calculateTotals();
        }
      );
    } else {
      this.calculateTotals();
    }
  }

  // Address-related methods
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

  private mapDiaChiObjectToArray(resultObj: any): DiaChiDonVi[] {
    return Object.entries(resultObj).map(([id, name]) => ({
      id: id,
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
      return list.filter((item) => item.name.toLowerCase().includes(this.searchTinh.toLowerCase()));
    }
    if (this.currentTab === 'huyen') {
      list = this.danhSachHuyen;
      return list.filter((item) => item.name.toLowerCase().includes(this.searchHuyen.toLowerCase()));
    }
    list = this.danhSachXa;
    return list.filter((item) => item.name.toLowerCase().includes(this.searchXa.toLowerCase()));
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
        this.layQuanHuyen(item.id);
        this.selectTab('huyen');
      }
    } else if (this.currentTab === 'huyen') {
      if (!this.selectedTinh) return;
      this.selectedHuyen = item;
      this.selectedXa = null;
      this.fullAddress = `${item.name}, ${this.selectedTinh?.name}`;
      if (item.id) {
        this.layPhuongXa(item.id);
        this.selectTab('xa');
      }
    } else if (this.currentTab === 'xa') {
      if (!this.selectedHuyen || !this.selectedTinh) return;
      this.selectedXa = item;
      this.fullAddress = `${item.name}, ${this.selectedHuyen?.name}, ${this.selectedTinh?.name}`;
      this.orderData.diaChiGiaoHang = this.fullAddress;
      this.showAddressPicker = false;
      this.isAddressChanged = true;
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
    const weight = soLuong * 150;
    let length = 12, width = 6, height = 6;
    let discountRate = 0;

    if (soLuong <= 1) { /* unchanged */ }
    else if (soLuong <= 4) { length = 15; width = 10; height = 7; }
    else if (soLuong <= 8) { length = 20; width = 12; height = 8; }
    else if (soLuong <= 12) { length = 22; width = 14; height = 10; }
    else if (soLuong <= 20) { length = 26; width = 18; height = 12; }
    else {
      const multiplier = Math.ceil(soLuong / 20);
      length = 26 * multiplier; width = 18 * multiplier; height = 12 * multiplier;
    }

    const volWeight = (length * width * height) / 5;
    const usedWeight = Math.max(weight, volWeight);
    if (soLuong >= 10) discountRate = 0.2;
    else if (soLuong >= 6) discountRate = 0.15;
    else if (soLuong >= 3) discountRate = 0.1;

    return { weight: Math.ceil(usedWeight), length, width, height, discountRate };
  }

  tinhPhiVanChuyen() {
    const soLuong = this.selectedProducts.reduce((sum, item) => sum + item.quantity, 0);
    const { weight, length, width, height, discountRate } = this.getQuyDoiKichThuocVaCanNang(soLuong);

    if (!this.selectedTinh || !this.selectedHuyen || !this.selectedXa) {
      this.shippingFee = 0;
      this.shippingDiscount = 0;
      this.calculateTotals();
      return;
    }

    const body = {
      from_district_id: 1482,
      to_ward_code: String(this.selectedXa?.id || ''),
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

    this.diaChiService.tinhPhiVanChuyen(body).subscribe({
      next: (fee) => {
        const giamPhi = Math.round(fee * discountRate);
        this.shippingDiscount = giamPhi;
        this.shippingFee = fee - giamPhi;
        this.calculateTotals();
      },
      error: (err) => {
        this.shippingFee = 0;
        this.shippingDiscount = 0;
        this.calculateTotals();
        Swal.fire('Lỗi', 'Không thể tính phí vận chuyển. Vui lòng thử lại!', 'error');
      }
    });
  }

  calculateTotals() {
    this.totalProductPrice = this.selectedProducts.reduce((total, item) => total + (item.quantity || 0) * (item.product.donGia || 0), 0);
    this.finalAmount = this.totalProductPrice - this.discount + this.shippingFee;
    this.cdr.markForCheck();
  }

  onDiscountCodeEntered(code: string) {
    this.discountErrorMessage = '';
    this.isDiscountApplied = false;

    if (!code) {
      this.discount = 0;
      this.discountAmount = 0;
      this.orderData.maGiamGia = '';
      this.calculateTotals();
      return;
    }

    if (this.orderData.idTaiKhoan) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.tokenService.getToken()}`
      });

      this.http.get<any>(`http://localhost:8080/rest/tai-khoan/${this.orderData.idTaiKhoan}`, { headers }).subscribe({
        next: (account) => {
          const registeredSdt = account.sdt;
          if (!registeredSdt) {
            this.discountErrorMessage = '⚠️ Tài khoản không có số điện thoại đăng ký!';
            this.resetDiscount();
            Swal.fire('Lỗi', this.discountErrorMessage, 'warning');
            return;
          }
          this.checkDiscountCode(code, registeredSdt);
        },
        error: (err) => {
          this.discountErrorMessage = '⚠️ Không thể lấy thông tin tài khoản!';
          this.resetDiscount();
          Swal.fire('Lỗi', this.discountErrorMessage, 'warning');
        }
      });
    } else {
      this.checkDiscountCode(code, this.orderData.sdtNguoiNhan);
    }
  }

  private checkDiscountCode(code: string, sdt: string) {
    if (!sdt || !/^0[0-9]{9}$/.test(sdt)) {
      this.discountErrorMessage = '⚠️ Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 0)!';
      this.resetDiscount();
      Swal.fire('Lỗi', this.discountErrorMessage, 'warning');
      return;
    }

    Swal.fire({ title: 'Đang kiểm tra mã...', text: 'Vui lòng chờ!', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.tokenService.getToken()}`
    });

    this.phieugiamgiaService.getDiscountCodeDetails(code, sdt, this.orderData.idTaiKhoan, headers).subscribe({
      next: (response: DiscountResponse) => {
        const now = new Date();
        const startDate = new Date(response.ngayBatDau);
        const endDate = new Date(response.ngayHetHan);

        if (now < startDate) {
          this.handleDiscountError('⚠️ Mã giảm giá chưa có hiệu lực!');
        } else if (now > endDate) {
          this.handleDiscountError('⚠️ Mã giảm giá đã hết hạn!');
        } else if (response.soLuong <= 0) {
          this.handleDiscountError('⚠️ Mã giảm giá đã hết lượt sử dụng!');
        } else {
          this.discountAmount = this.totalProductPrice * response.giaTriGiam;
          if (response.giaTriToiDa && this.discountAmount > response.giaTriToiDa) {
            this.discountAmount = response.giaTriToiDa;
          }
          this.discount = this.discountAmount;
          this.orderData.maGiamGia = code;
          this.isDiscountApplied = true;
          this.calculateTotals();
          Swal.fire({
            title: 'Thành công!',
            text: `Đã áp dụng mã. Bạn được giảm ${this.discountAmount.toLocaleString()} đ!`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });
        }
      },
      error: (err) => {
        this.handleDiscountError(err.error?.message || '⚠️ Mã giảm giá không hợp lệ!');
      },
    });
  }

  private handleDiscountError(message: string) {
    this.discountErrorMessage = message;
    this.resetDiscount();
    Swal.fire('Lỗi', message, 'warning');
  }

  private resetDiscount() {
    this.discount = 0;
    this.discountAmount = 0;
    this.orderData.maGiamGia = '';
    this.isDiscountApplied = false;
    this.calculateTotals();
  }

  updateQuantity(index: number, change: number) {
    const newQty = this.selectedProducts[index].quantity + change;
    if (newQty < 1) return this.removeProduct(index);

    this.selectedProducts[index].quantity = newQty;
    this.orderData.chiTietDonHangs[index].quantity = newQty;
    // Cập nhật selectedProducts trong CartService
    this.cartService.setSelectedCartItems([...this.selectedProducts]);
    this.calculateTotals();
    this.tinhPhiVanChuyen();
    if (this.isDiscountApplied) this.onDiscountCodeEntered(this.orderData.maGiamGia!);
  }

  removeProduct(index: number) {
    this.selectedProducts.splice(index, 1);
    this.orderData.chiTietDonHangs.splice(index, 1);
    // Cập nhật selectedProducts trong CartService
    this.cartService.setSelectedCartItems([...this.selectedProducts]);
    this.calculateTotals();
    this.tinhPhiVanChuyen();
    if (this.isDiscountApplied) this.onDiscountCodeEntered(this.orderData.maGiamGia!);
    if (this.selectedProducts.length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  async onSubmit() {
    console.log('onSubmit called');
    console.log('orderData:', this.orderData);

    // Kiểm tra dữ liệu đầu vào
    if (!this.orderData.tenNguoiNhanHang) {
      Swal.fire('Lỗi', 'Vui lòng nhập tên người nhận hàng!', 'error');
      return;
    }
    if (!this.orderData.diachiChiTiet || !this.orderData.diaChiGiaoHang) {
      Swal.fire('Lỗi', 'Vui lòng nhập đầy đủ địa chỉ giao hàng!', 'error');
      return;
    }
    if (!this.orderData.sdtNguoiNhan || !/^0[0-9]{9}$/.test(this.orderData.sdtNguoiNhan)) {
      Swal.fire('Lỗi', 'Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 0)!', 'error');
      return;
    }
    if (!this.orderData.phuongThucThanhToan) {
      Swal.fire('Lỗi', 'Vui lòng chọn phương thức thanh toán!', 'error');
      return;
    }

    const soLuong = this.selectedProducts.reduce((sum, item) => sum + item.quantity, 0);
    const { length, width, height } = this.getQuyDoiKichThuocVaCanNang(soLuong);

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
      trungBinhCacCanh: Math.round((length + width + height) / 3),
      trangThai: this.orderData.phuongThucThanhToan === 'tm' ? 1 : 0,
    };

    console.log('Payload:', payload);

    Swal.fire({ title: 'Đang xử lý...', text: 'Vui lòng chờ!', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const orderRes = await this.orderService.createOrder(payload).toPromise();
      console.log('Order created successfully:', orderRes);
      Swal.close();

      // Remove selected products from cart
      const productsToRemove = this.selectedProducts.map(product => ({
        idSpct: product.product.idSpct,
        volume: product.volume
      }));

      await this.cartService.removeMultipleFromCart(productsToRemove);
      this.cartService.setSelectedCartItems([]); // Clear selected items
      console.log('🗑️ Đã xóa các sản phẩm khỏi giỏ hàng');

      // Đồng bộ giỏ hàng trước khi điều hướng
      this.cartService.reloadCart();

      if (this.orderData.phuongThucThanhToan === 'tm') {
        Swal.fire({
          title: 'Thành công!',
          text: 'Đơn hàng đã được đặt thành công.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        this.router.navigate(['/order-success', orderRes.id]);
        return;
      }

      const extraDataObj = { amount: this.finalAmount, orderInfo: `Thanh toán đơn hàng ${orderRes.id}`, orderId: 'ORDER_' + orderRes.id };
      const extraData = btoa(unescape(encodeURIComponent(JSON.stringify(extraDataObj))));

      const momoRequest = {
        orderId: extraDataObj.orderId,
        requestId: 'REQ_' + new Date().getTime(),
        orderInfo: extraDataObj.orderInfo,
        amount: this.finalAmount.toString(),
        returnUrl: `http://localhost:4200/order-success/${orderRes.id}?extraData=${extraData}`,
        notifyUrl: 'http://localhost:8080/api/momo/callback',
        requestType: 'captureWallet',
        extraData,
      };

      this.momoPaymentService.createPayment(momoRequest).subscribe({
        next: (res: any) => {
          console.log('MoMo response:', res);
          if (res.payUrl) window.location.href = res.payUrl;
          else Swal.fire('Lỗi', 'Không nhận được payUrl từ MoMo.', 'error');
        },
        error: (err) => {
          console.error('MoMo error:', err);
          Swal.fire('Lỗi', err.error?.message || 'Lỗi khi gọi API MoMo.', 'error');
        },
      });
    } catch (err) {
      console.error('Order creation error:', err);
      Swal.close();
      Swal.fire('Lỗi', err.error?.message || 'Lỗi khi đặt đơn hàng.', 'error');
    }
  }
}
