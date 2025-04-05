import { Component,Input, Inject, PLATFORM_ID  } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
declare const html2pdf: any;
@Component({
  selector: 'app-hoadon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hoadon.component.html',
  styleUrl: './hoadon.component.scss'
})
export class HoadonComponent {
  @Input() orderId: string = '';

  @Input() orderData: any;
  constructor(public activeModal: NgbActiveModal,@Inject(PLATFORM_ID) private platformId: Object) {}
  ngOnInit() {
    console.log('🧾 orderData:', this.orderData);
  }
  close() {
    this.activeModal.dismiss('Cross click');
  }
  exportToPDF() {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById('invoice-content');
      if (!element) {
        console.error('Element with id "invoice-content" not found!');
        this.activeModal.dismiss('Error: Element not found');
        return;
      }

      const options = {
        margin: 1,
        filename: `hoadon_${this.orderData.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      try {
        html2pdf()
          .set(options)
          .from(element)
          .save();
        // Đóng modal và trả về 'confirm' ngay sau khi gọi save()
        this.activeModal.close('confirm');
      } catch (error) {
        console.error('Error generating PDF:', error);
        this.activeModal.dismiss('Error generating PDF');
      }
    } else {
      console.error('html2pdf.js cannot run in SSR or Node environment');
      this.activeModal.dismiss('SSR environment');
    }
  }
  // Trong OfflineOrderComponent
  formatOrderId(orderData: any): string {
    // Lấy ngày tạo từ orderData.ngayTao
    const date = new Date(orderData.ngayTao);
    
    // Định dạng ngày thành YYYYMMDD
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Thêm số 0 nếu tháng < 10
    const day = date.getDate().toString().padStart(2, '0'); // Thêm số 0 nếu ngày < 10
    const dateString = `${year}${month}${day}`;
    
    // Đảm bảo orderId có ít nhất 4 chữ số (pad với số 0 nếu cần)
    const paddedId = orderData.id.toString().padStart(4, '0');
    
    // Kết hợp ngày và orderId
    return `${dateString}${paddedId}`;
  }
}
