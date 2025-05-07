import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MomoPaymentService } from '../service/momoPayment.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
import { TokenService } from '../service/token.service';
import { DonhangService } from '../service/donhang.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private momoService: MomoPaymentService,
    private tokenService: TokenService,
    private donhangService: DonhangService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId');
    console.log('Order ID từ URL:', this.orderId);
    const queryParams = this.route.snapshot.queryParamMap;
    const extraDataEncoded = queryParams.get('extraData');

    // Lấy ngayTao trước khi xử lý paymentStatus
    if (this.orderId) {
      this.donhangService.getOrderDetails(parseInt(this.orderId)).subscribe({
        next: (order: any) => {
          console.log('Toàn bộ dữ liệu order từ API:', order);
          if (Array.isArray(order) && order.length > 0) {
            this.ngayTao = order[0].ngayTao || null;
          } else {
            this.ngayTao = order.ngayTao || null;
          }
          if (!this.ngayTao) {
            console.warn('⚠️ ngayTao không tồn tại trong dữ liệu order:', order);
          } else {
            console.log('Ngày tạo sau khi gán:', this.ngayTao);
          }
          this.cdr.detectChanges(); // Cập nhật giao diện ngay khi có ngayTao
        },
        error: (err) => {
          console.error('❌ Lỗi khi lấy thông tin đơn hàng:', err);
          this.ngayTao = null;
          this.cdr.detectChanges();
        }
      });
    }

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
            }
            this.cdr.detectChanges(); // Cập nhật giao diện sau khi thay đổi paymentStatus
          },
          error: () => {
            this.paymentStatus = 'fail';
            this.cdr.detectChanges();
          }
        });
      } catch (err) {
        console.error('❌ Lỗi giải mã extraData:', err);
        this.paymentStatus = 'fail';
        this.cdr.detectChanges();
      }
    } else {
      this.paymentStatus = 'cod-success';
      this.cdr.detectChanges();
    }
  }

  updateOrderStatusToPaid() {
    if (!this.orderId) {
      console.error('❌ orderId không tồn tại');
      return;
    }

    const userInfo = this.tokenService.getUserInfo();
    const userID = userInfo.UserID;
    const tenDangNhap = userInfo.sub;
    console.log('tendangnhap:', tenDangNhap + '\n' + 'userId:', userID);
    const apiUrl = `http://localhost:8080/rest/don-hang/capnhat-trangthai/${this.orderId}?trangThai=6&userID=${userID}&tenDangNhap=${tenDangNhap}`;

    fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((res) => {
      if (res.ok) {
        return res.json().then((data) => {
          console.log('✅ Đã cập nhật trạng thái đơn hàng thành "Đã thanh toán"', data);
        });
      } else {
        return res.text().then((errorMessage) => {
          console.error('❌ Cập nhật trạng thái thất bại:', errorMessage);
        });
      }
    })
    .catch((err) => {
      console.error('❌ Lỗi khi gọi API cập nhật trạng thái:', err);
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
    }
  }

  retryPayment() {
    if (!this.orderId || !this.amount || !this.orderInfo) {
      console.warn('❗ Thiếu dữ liệu để tạo lại thanh toán');
      return;
    }

    const utf8ToBase64 = (str: string) =>
      btoa(unescape(encodeURIComponent(str)));
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const newMomoOrderId = `ORDERTOSCENT_${this.orderId}_${randomSuffix}`;

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
        }
      },
      error: (err) => {
        console.error('❌ Lỗi khi gọi MoMo:', err);
      },
    });
  }
}