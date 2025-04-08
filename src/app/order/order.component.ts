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
import Swal from 'sweetalert2';
import { CartService } from '../service/cart.Service';
import { VietQRService } from '../service/VietQR.Service';

interface OrderDetail {
  spctId: number;
  quantity: number;
}

interface Order {
  idTaiKhoan: number;
  tenNguoiNhanHang: string;
  diaChiGiaoHang: string;
  diachiChiTiet: string;
  sdtNguoiNhan: string;
  phuongThucThanhToan: string;
  chiTietDonHangs: OrderDetail[];
  ghichu: string;
  maGiamGia?: string;
}

interface DiaChiDonVi {
  id: string;
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
    diachiChiTiet: '',
    sdtNguoiNhan: '',
    phuongThucThanhToan: '',
    chiTietDonHangs: [],
    ghichu: '',
    maGiamGia: '',
  };
  discountCodes = {};
  discountErrorMessage: string = '';
  discountAmount: number = 0;
  selectedProducts: any[] = [];
  totalProductPrice = 0;
  discount: number = 0;
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

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef,
    private diaChiService: DiaChiService,
    private momoPaymentService: MomoPaymentService,
    private phieugiamgiaService: PhieugiamgiaService,
    private vietQRService: VietQRService
  ) {}

  ngOnInit() {
    this.layTinhThanh();
    const idTaiKhoan = this.tokenService.getUserId() || Number(localStorage.getItem('idTaiKhoan'));
    if (!idTaiKhoan) {
      console.error('Token không tồn tại hoặc rỗng.');
      return;
    }
    this.orderData.idTaiKhoan = idTaiKhoan;

    // Gọi API để lấy thông tin đơn hàng gần nhất
    this.orderService.getLatestOrder(idTaiKhoan).subscribe(
      (data) => {
        if (data) {
          console.log('Latest order data:', data);
          this.orderData.tenNguoiNhanHang = data.tenNguoiNhanHang || '';
          this.orderData.sdtNguoiNhan = data.sdtNguoiNhan || '';
          this.shippingFee = data.phiVanChuyen || 0;
          this.shippingDiscount = 0;

          // Tách địa chỉ giao hàng và tìm ID của Tỉnh, Huyện, Xã
          if (data.diaChiGiaoHang) {
            const addressParts = data.diaChiGiaoHang.split(', ');
            if (addressParts.length >= 4) {
              this.orderData.diachiChiTiet = addressParts[0];
              this.fullAddress = addressParts.slice(1).join(', ');
              this.orderData.diaChiGiaoHang = this.fullAddress;

              // Tìm ID của Tỉnh, Huyện, Xã
              const xaName = addressParts[1];
              const huyenName = addressParts[2];
              const tinhName = addressParts[3];

              // Tìm ID của Tỉnh
              this.diaChiService.getTinhThanh().subscribe((res) => {
                const tinhList = this.mapDiaChiObjectToArray(res.result);
                const tinh = tinhList.find(t => t.name === tinhName);
                if (tinh) {
                  this.selectedTinh = tinh;
                  // Tìm ID của Huyện
                  this.diaChiService.getQuanHuyen(tinh.id).subscribe((huyenRes) => {
                    const huyenList = this.mapDiaChiObjectToArray(huyenRes.result);
                    const huyen = huyenList.find(h => h.name === huyenName);
                    if (huyen) {
                      this.selectedHuyen = huyen;
                      // Tìm ID của Xã
                      this.diaChiService.getPhuongXa(huyen.id).subscribe((xaRes) => {
                        const xaList = this.mapDiaChiObjectToArray(xaRes.result);
                        const xa = xaList.find(x => x.name === xaName);
                        if (xa) {
                          this.selectedXa = xa;
                          // Sau khi có đầy đủ ID, tính lại phí vận chuyển
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

  // Các phương thức liên quan đến địa chỉ
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
      discountRate,
    };
  }

  tinhPhiVanChuyen() {
    const soLuong = this.selectedProducts.reduce((sum, item) => sum + item.quantity, 0);
    console.log('📦 Số lượng sản phẩm:', soLuong);
    const { weight, length, width, height, discountRate } = this.getQuyDoiKichThuocVaCanNang(soLuong);

    if (!this.selectedTinh || !this.selectedHuyen || !this.selectedXa) {
      console.warn('⚠️ Chưa chọn đầy đủ Tỉnh, Huyện, Xã => Không tính phí vận chuyển.');
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

    console.log('🚀 Gửi yêu cầu tính phí:', body);

    this.diaChiService.tinhPhiVanChuyen(body).subscribe({
      next: (fee) => {
        const giamPhi = Math.round(fee * discountRate);
        const finalFee = fee - giamPhi;
        this.shippingDiscount = giamPhi;
        this.shippingFee = finalFee;
        this.calculateTotals();
      },
      error: (err) => {
        console.error('Lỗi khi tính phí vận chuyển:', err);
        this.shippingFee = 0;
        this.shippingDiscount = 0;
        this.calculateTotals();
      }
    });
  }

  calculateTotals() {
    const products = Array.isArray(this.selectedProducts) ? this.selectedProducts : [];
    this.totalProductPrice = products.reduce((total, item) => {
      return total + (item.quantity || 0) * (item.donGia || 0);
    }, 0);
    this.finalAmount = this.totalProductPrice - this.discount + this.shippingFee;
    this.cdr.markForCheck();
  }

  onDiscountCodeEntered(code: string | null) {
    this.discountErrorMessage = '';
    if (!code) {
      this.discount = 0;
      this.discountAmount = 0;
      this.orderData.maGiamGia = '';
      this.calculateTotals();
      return;
    }
    Swal.fire({
      title: 'Đang kiểm tra mã giảm giá...',
      text: 'Vui lòng chờ trong giây lát!',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    this.phieugiamgiaService.getDiscountCodeDetails(code).subscribe({
      next: (response) => {
        Swal.close();
        if (response.dieuKienapDung !== 1) {
          this.discountErrorMessage = '⚠️ Mã giảm giá này chỉ áp dụng cho đơn hàng offline!';
          this.discount = 0;
          this.discountAmount = 0;
          this.orderData.maGiamGia = '';
          this.calculateTotals();
          Swal.fire({
            title: 'Lỗi',
            text: this.discountErrorMessage,
            icon: 'error',
            confirmButtonText: 'OK',
          });
          return;
        }

        this.discountAmount = this.totalProductPrice * response.giaTriGiam;
        if (response.gia_tri_toi_da && this.discountAmount > response.gia_tri_toi_da) {
          this.discountAmount = response.gia_tri_toi_da;
        }

        this.discount = this.discountAmount;
        this.orderData.maGiamGia = code;
        this.calculateTotals();

        const userId = this.tokenService.getUserId();
        localStorage.setItem(`discountUsed_${code}_${userId}`, 'true');

        Swal.fire({
          title: 'Thành công!',
          text: 'Mã giảm giá đã được áp dụng.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        Swal.close();
        console.error('❌ Lỗi khi áp dụng mã:', err);
        let errorMessage = '⚠️ Có lỗi xảy ra khi áp dụng mã giảm giá.';
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }

        this.discountErrorMessage = errorMessage;
        this.discount = 0;
        this.discountAmount = 0;
        this.orderData.maGiamGia = '';
        this.calculateTotals();

        Swal.fire({
          title: 'Lỗi',
          text: this.discountErrorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  updateUI() {
    this.calculateTotals();
    this.cdr.markForCheck();
  }

  updateQuantity(index: number, change: number) {
    const newQty = this.selectedProducts[index].quantity + change;
    if (newQty < 1) return this.removeProduct(index);

    this.selectedProducts[index].quantity = newQty;
    this.orderData.chiTietDonHangs[index].quantity = newQty;
    localStorage.setItem('selectedProducts', JSON.stringify(this.selectedProducts));
    this.calculateTotals();
    this.tinhPhiVanChuyen();
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

  generateVietQRString(orderId: string, amount: number, orderInfo: string): Promise<string> {
    const vietQRData = {
      accountNo: '0855616615',
      accountName: 'Lại Văn Quang',
      acqId: '970422',
      addInfo: orderInfo,
      amount: amount.toString(),
      template: 'compact',
    };

    return new Promise((resolve, reject) => {
      this.vietQRService.generateQRCode(vietQRData).subscribe({
        next: (response: any) => {
          console.log('Response từ API VietQR:', response);
          if (response && response.code === '00' && response.data && response.data.qrDataURL) {
            resolve(response.data.qrDataURL);
          } else {
            reject(new Error(`Không nhận được qrDataURL từ API VietQR. Response: ${JSON.stringify(response)}`));
          }
        },
        error: (err) => {
          console.error('Lỗi khi gọi API VietQR:', err);
          reject(new Error(`Lỗi khi gọi API VietQR: ${err.message || JSON.stringify(err)}`));
        },
      });
    });
  }

  async onSubmit() {
    if (
      !this.orderData.tenNguoiNhanHang ||
      !this.orderData.diachiChiTiet ||
      !this.orderData.sdtNguoiNhan ||
      !this.orderData.phuongThucThanhToan ||
      !this.orderData.diaChiGiaoHang
    ) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Vui lòng nhập đầy đủ thông tin giao hàng!',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    Swal.fire({
      title: 'Đang xử lý đơn hàng...',
      text: 'Vui lòng chờ trong giây lát!',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

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
      trungBinhCacCanh: Math.round((this.getQuyDoiKichThuocVaCanNang(this.selectedProducts.reduce((sum, item) => sum + item.quantity, 0)).length +
        this.getQuyDoiKichThuocVaCanNang(this.selectedProducts.reduce((sum, item) => sum + item.quantity, 0)).width +
        this.getQuyDoiKichThuocVaCanNang(this.selectedProducts.reduce((sum, item) => sum + item.quantity, 0)).height) / 3),
      trangThai: this.orderData.phuongThucThanhToan === 'tm' ? 1 : 0,
    };

    this.orderService.createOrder(payload).subscribe({
      next: async (orderRes) => {
        Swal.close();
        this.cartService.clearCartOnClient();
        localStorage.removeItem('selectedProducts');

        if (this.orderData.phuongThucThanhToan === 'tm') {
          Swal.fire({
            title: 'Thành công!',
            text: 'Đơn hàng đã được đặt thành công.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });
          this.router.navigate(['/order-success', orderRes.id]);
          return;
        }

        const extraDataObj = {
          amount: this.finalAmount,
          orderInfo: `Thanh toán đơn hàng ${orderRes.id} từ SCENT`,
          orderId: 'ORDER_' + orderRes.id,
        };
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
            if (res.payUrl) {
              window.location.href = res.payUrl;
            } else {
              Swal.fire({
                title: 'Lỗi',
                text: 'Không nhận được payUrl từ MoMo.',
                icon: 'error',
                confirmButtonText: 'OK',
              });
            }
          },
          error: (err) => {
            Swal.close();
            const errorMessage = err.error?.message || 'Có lỗi xảy ra khi gọi API MoMo.';
            Swal.fire({
              title: 'Lỗi',
              text: errorMessage,
              icon: 'error',
              confirmButtonText: 'OK',
            });
          },
        });
      },
      error: (err) => {
        Swal.close();
        if (err.status === 401) {
          this.discount = 0;
          this.discountAmount = 0;
          this.orderData.maGiamGia = '';
          this.calculateTotals();
          Swal.fire({
            icon: 'warning',
            title: 'Mã giảm giá không hợp lệ',
            text: 'Bạn đã sử dụng mã giảm giá này quá số lần cho phép. Mã đã được xóa, bạn có thể tiếp tục đặt hàng.',
            confirmButtonText: 'OK',
          });
          return;
        }

        const errorMessage = err.error?.message || 'Có lỗi xảy ra khi đặt đơn hàng.';
        Swal.fire({
          title: 'Lỗi',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }
}