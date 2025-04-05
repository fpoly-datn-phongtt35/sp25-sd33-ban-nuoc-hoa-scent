import { Component, Input, Inject, PLATFORM_ID } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';

declare const html2pdf: any;

@Component({
  selector: 'app-hoadon-of',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hoadon-of.component.html',
  styleUrls: ['./hoadon-of.component.scss']
})
export class HoadonOfComponent {
  @Input() orderId: string = '';
  @Input() orderData: any;
  totalBeforeDiscount: number = 0; // Tổng tiền trước giảm
  discountAmount: number = 0; // Số tiền giảm

  constructor(
    public activeModal: NgbActiveModal,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    console.log('🧾 orderData:', this.orderData);

    // Kiểm tra dữ liệu đầu vào
    if (!this.orderData || !this.orderData.orderId || !this.orderData.chiTietDonHangs) {
      console.error('Dữ liệu hóa đơn không hợp lệ:', this.orderData);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Dữ liệu hóa đơn không hợp lệ. Vui lòng thử lại!',
      });
      this.activeModal.dismiss('Invalid data');
      return;
    }

    // Tính tổng tiền trước giảm từ chi tiết đơn hàng
    this.totalBeforeDiscount = this.orderData.chiTietDonHangs.reduce(
      (total: number, item: any) => total + (item.thanhTien || 0),
      0
    );

    // Tính số tiền giảm: Tổng tiền trước giảm - Tổng tiền sau giảm
    this.discountAmount = this.totalBeforeDiscount - (this.orderData.total || 0);

    console.log('Tổng tiền trước giảm:', this.totalBeforeDiscount);
    console.log('Số tiền giảm:', this.discountAmount);
    console.log('Tổng tiền sau giảm:', this.orderData.total);
  }

  close() {
    this.activeModal.dismiss('cancel');
  }

  exportToPDF() {
    if (!isPlatformBrowser(this.platformId)) {
      console.error('html2pdf.js cannot run in SSR or Node environment');
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tạo PDF trong môi trường SSR!',
      });
      this.activeModal.dismiss('SSR environment');
      return;
    }

    const element = document.getElementById('invoice-content');
    if (!element) {
      console.error('Element with id "invoice-content" not found!');
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không tìm thấy nội dung hóa đơn để in!',
      });
      this.activeModal.dismiss('Error: Element not found');
      return;
    }

    const options = {
      margin: 1,
      filename: `hoadon_${this.orderData.orderId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      html2pdf()
        .set(options)
        .from(element)
        .save()
        .then(() => {
          // Hiển thị thông báo thành công
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Hóa đơn đã được in thành công!',
            timer: 1500,
            showConfirmButton: false,
          });
          // Đóng modal và trả về 'printed' để khớp với OfflineOrderComponent
          this.activeModal.close('printed');
        });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tạo PDF. Vui lòng thử lại!',
      });
      this.activeModal.dismiss('Error generating PDF');
    }
  }
  // Trong OfflineOrderComponent
private formatOrderId(orderData: any): string {
  // Lấy ngày tạo từ orderData.ngayTao
  const date = new Date(orderData.ngayTao);
  
  // Định dạng ngày thành YYYYMMDD
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Thêm số 0 nếu tháng < 10
  const day = date.getDate().toString().padStart(2, '0'); // Thêm số 0 nếu ngày < 10
  const dateString = `${year}${month}${day}`;
  
  // Đảm bảo orderId có ít nhất 4 chữ số (pad với số 0 nếu cần)
  const paddedId = orderData.orderId.toString().padStart(4, '0');
  
  // Kết hợp ngày và orderId
  return `${dateString}${paddedId}`;
}


}