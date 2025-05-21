import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MomoPaymentService } from '../service/momoPayment.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
import { TokenService } from '../service/token.service';
import { DonhangService } from '../service/donhang.service';
import { HttpClient } from '@angular/common/http';

interface SanPhamInfoDTO2 {
  idSanPham: number;
  tenSanPham: string;
  donGia: number;
  imageURL: string | null;
  tenThuongHieu: string;
  tenDanhMuc: string;
  moTaHuongDau: string;
  moTaHuongGiua: string;
  moTaHuongCuoi: string;
  idNhomHuong: number;
  tenNhomHuong: string;
  quocGia: string;
  trangThai: number;
  soLuongTonKho: number;
  createDate: string;
  totalSold: number;
}

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss'],
})
export class OrderSuccessComponent implements OnInit {
  orderId: string | null = null;
  momoOrderId: string | null = null;
  paymentStatus: 'checking' | 'success' | 'fail' | 'cod-success' = 'checking';
  amount: number = 0;
  orderInfo: string = '';
  extraOrderData: any;
  ngayTao: string | null = null;
  isUpdatingStatus: boolean = false;
  errorMessage: string | null = null;
  topSellingProducts: SanPhamInfoDTO2[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private momoService: MomoPaymentService,
    private tokenService: TokenService,
    private donhangService: DonhangService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId');
    console.log('Order ID từ URL:', this.orderId);

    // Fetch top-selling products
    this.fetchTopSellingProducts();

    if (this.orderId) {
      const orderIdNum = parseInt(this.orderId);
      if (isNaN(orderIdNum)) {
        console.error('❌ Order ID không hợp lệ:', this.orderId);
        this.errorMessage = 'Mã đơn hàng không hợp lệ.';
        this.cdr.detectChanges();
        return;
      }

      this.donhangService.getOrderDetails(orderIdNum).subscribe({
        next: (order: any) => {
          console.log('Toàn bộ dữ liệu order từ API:', order);
          if (Array.isArray(order) && order.length > 0) {
            this.ngayTao = order[0].ngayTao || null;
          } else if (order && typeof order === 'object') {
            this.ngayTao = order.ngayTao || null;
          }
          if (!this.ngayTao) {
            console.warn('⚠️ ngayTao không tồn tại trong dữ liệu order:', order);
          } else {
            console.log('Ngày tạo sau khi gán:', this.ngayTao);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Lỗi khi lấy thông tin đơn hàng:', err);
          this.errorMessage = 'Không thể lấy thông tin đơn hàng. Vui lòng thử lại sau.';
          this.ngayTao = null;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.errorMessage = 'Mã đơn hàng không tồn tại.';
      this.cdr.detectChanges();
      return;
    }

    const queryParams = this.route.snapshot.queryParamMap;
    const extraDataEncoded = queryParams.get('extraData');

    if (extraDataEncoded) {
      try {
        const base64ToUtf8 = (str: string) =>
          decodeURIComponent(escape(atob(str)));
        const decoded = base64ToUtf8(extraDataEncoded);
        this.extraOrderData = JSON.parse(decoded);
        this.amount = this.extraOrderData.amount || 0;
        this.orderInfo = this.extraOrderData.orderInfo || '';
        console.log('Extra data decoded:', this.extraOrderData);

        this.momoOrderId = this.extraOrderData.orderId || `ORDER_${this.orderId}`;
        console.log('Momo Order ID:', this.momoOrderId);

        this.momoService.checkStatus(this.momoOrderId!).subscribe({
          next: (res: any) => {
            if (res.resultCode === 0) {
              this.paymentStatus = 'success';
              this.updateOrderStatusToPaid();
            } else {
              this.paymentStatus = 'fail';
              this.errorMessage = 'Thanh toán thất bại. Vui lòng thử lại.';
            }
            this.cdr.detectChanges();
          },
          error: () => {
            this.paymentStatus = 'fail';
            this.errorMessage = 'Có lỗi khi kiểm tra trạng thái thanh toán.';
            this.cdr.detectChanges();
          }
        });
      } catch (err) {
        console.error('❌ Lỗi giải mã extraData:', err);
        this.paymentStatus = 'fail';
        this.errorMessage = 'Dữ liệu thanh toán không hợp lệ.';
        this.cdr.detectChanges();
      }
    } else {
      this.paymentStatus = 'cod-success';
      this.cdr.detectChanges();
    }
  }

  // Method to fetch top-selling products
  fetchTopSellingProducts() {
    this.http.get<SanPhamInfoDTO2[]>('http://localhost:8080/rest/san-pham/top-selling-products').subscribe({
      next: (products) => {
        this.topSellingProducts = products;
        console.log('Top-selling products:', this.topSellingProducts);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error fetching top-selling products:', err);
        this.errorMessage = 'Không thể tải danh sách sản phẩm bán chạy.';
        this.cdr.detectChanges();
      }
    });
  }

  // New method to navigate to product details
  viewProductDetails(productId: number) {
    this.router.navigate(['/detail', productId]);
  }

  updateOrderStatusToPaid() {
    if (!this.orderId) {
      console.error('❌ orderId không tồn tại');
      this.errorMessage = 'Mã đơn hàng không tồn tại.';
      this.cdr.detectChanges();
      return;
    }

    this.isUpdatingStatus = true;
    this.cdr.detectChanges();

    const userInfo = this.tokenService.getUserInfo();
    const userID = userInfo.UserID;
    const tenDangNhap = userInfo.sub;
    console.log('tendangnhap:', tenDangNhap, '\nuserId:', userID);

    const apiUrl = `http://localhost:8080/rest/don-hang/capnhat-trangthai/${this.orderId}?trangThai=6&userID=${userID}&tenDangNhap=${tenDangNhap}`;

    this.http.put(apiUrl, {}).subscribe({
      next: (data) => {
        console.log('✅ Đã cập nhật trạng thái đơn hàng thành "Đã thanh toán"', data);
        this.isUpdatingStatus = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Lỗi khi gọi API cập nhật trạng thái:', err);
        this.isUpdatingStatus = false;
        this.errorMessage = 'Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.';
        this.cdr.detectChanges();
      }
    });
  }

  goToHomePage() {
    this.router.navigate(['/']);
  }

  viewOrderDetails() {
    if (this.orderId) {
      this.router.navigate(['/app-order-id', this.orderId]);
    } else {
      console.error('❌ No Order ID provided.');
      this.errorMessage = 'Mã đơn hàng không tồn tại.';
      this.cdr.detectChanges();
    }
  }

  retryPayment() {
    if (!this.orderId || !this.amount || !this.orderInfo) {
      console.warn('❗ Thiếu dữ liệu để tạo lại thanh toán');
      this.errorMessage = 'Thiếu thông tin để thực hiện thanh toán lại.';
      this.cdr.detectChanges();
      return;
    }

    const utf8ToBase64 = (str: string) =>
      btoa(unescape(encodeURIComponent(str)));
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.]/g, "").slice(0, 14); // Format: YYYYMMDDHHMMSS
    const newMomoOrderId = `ORDERTOSCENT_${this.orderId}_${randomSuffix}_${timestamp}`;

    const extraData = utf8ToBase64(
      JSON.stringify({
        orderId: newMomoOrderId,
        originalOrderId: this.orderId,
        amount: this.amount,
        orderInfo: this.orderInfo,
      })
    );

    const momoRequest = {
      orderId: newMomoOrderId,
      orderInfo: this.orderInfo,
      amount: this.amount,
      returnUrl: `http://localhost:4200/order-success/${this.orderId}?extraData=${extraData}`,
      notifyUrl: 'http://localhost:8080/api/momo/callback',
      requestType: 'captureWallet'
    };

    console.log('🔁 Gửi lại thanh toán với ID mới:', momoRequest);

    this.momoService.createPayment(momoRequest).subscribe({
      next: (res: any) => {
        if (res?.payUrl) {
          window.location.href = res.payUrl;
        } else {
          console.error('❌ Không nhận được payUrl từ MoMo');
          this.errorMessage = 'Không thể tạo thanh toán. Vui lòng thử lại.';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('❌ Lỗi khi gọi MoMo:', err);
        this.errorMessage = 'Có lỗi khi tạo thanh toán. Vui lòng thử lại.';
        this.cdr.detectChanges();
      },
    });
  }
}