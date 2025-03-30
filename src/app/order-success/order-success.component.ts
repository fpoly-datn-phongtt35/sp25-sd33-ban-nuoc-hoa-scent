import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MomoPaymentService } from '../service/momoPayment.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss'],
})
export class OrderSuccessComponent implements OnInit {
  orderId: string | null = null; // dùng cho hiển thị
  momoOrderId: string | null = null; // dùng để check trạng thái thanh toán
  paymentStatus: 'checking' | 'success' | 'fail' | 'cod-success' = 'checking';
  amount: number = 0;
  orderInfo: string = '';
  extraOrderData: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private momoService: MomoPaymentService
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId');
    const queryParams = this.route.snapshot.queryParamMap;
    const extraDataEncoded = queryParams.get('extraData');

    if (extraDataEncoded) {
      try {
        const base64ToUtf8 = (str: string) =>
          decodeURIComponent(escape(atob(str)));
        const decoded = base64ToUtf8(extraDataEncoded);
        this.extraOrderData = JSON.parse(decoded);
        this.amount = this.extraOrderData.amount;
        this.orderInfo = this.extraOrderData.orderInfo;

        // ✅ momoOrderId có thể là ORDER_1000 hoặc ORDER_1000_abcd12
        this.momoOrderId = this.extraOrderData.orderId || `ORDER_${this.orderId}`;

        this.momoService.checkStatus(this.momoOrderId!).subscribe({
          next: (res: any) => {
            if (res.resultCode === 0) {
              this.paymentStatus = 'success';
              this.updateOrderStatusToPaid();
            } else {
              this.paymentStatus = 'fail';
            }
          },
          error: () => (this.paymentStatus = 'fail'),
        });
      } catch (err) {
        console.error('❌ Lỗi giải mã extraData:', err);
        this.paymentStatus = 'fail';
      }
    } else {
      // ✅ Nếu không có extraData thì là COD → coi như thành công (chờ xác nhận)
      this.paymentStatus = 'cod-success';
    }
  }

  updateOrderStatusToPaid() {
    if (!this.orderId) return;

    const apiUrl = `http://localhost:8080/rest/don-hang/capnhat-trangthai/${this.orderId}?trangThai=6`;

    fetch(apiUrl, {
      method: 'PUT',
    })
      .then((res) => {
        if (res.ok) {
          console.log('✅ Đã cập nhật trạng thái đơn hàng thành "Đã thanh toán"');
        } else {
          console.error('❌ Cập nhật trạng thái thất bại');
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
      this.router.navigate(['/order-details', this.orderId]);
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
    const newMomoOrderId = `ORDER_${this.orderId}_${randomSuffix}`;

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
      requestId: 'REQ_' + new Date().getTime(),
      orderInfo: this.orderInfo,
      amount: this.amount,
      returnUrl: `http://localhost:4200/order-success/${this.orderId}?extraData=${extraData}`,
      notifyUrl: 'http://localhost:8080/api/momo/callback',
      requestType: 'payWithMethod',
      extraData,
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
