import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-order-detai',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  standalone: true,
  imports: [CommonModule] // Thêm những module cần thiết
})
export class OrderDetaiComponent  {
  @Input() order: any; // ✅ Sửa tại đây
  @Output() closeDetail = new EventEmitter<void>();

  // Có thể dùng this.order để hiển thị dữ liệu
  close() {
    this.closeDetail.emit();
  }
  getPaymentMethod(method: string): string {
    const normalized = method?.toLowerCase(); // chuyển về viết thường

    switch (normalized) {
      case 'ck': return '💳 Chuyển khoản';
      case 'tienmat': return '💵 Tiền mặt';
      case 'momo': return '📱 Ví MoMo';
      default: return '❓ Không rõ';
    }
  }


  getOrderStatus(status: number): string {
    switch (status) {
      case 1: return '🕒 Chờ xác nhận';
      case 2: return '✅ Đã xác nhận';
      case 3: return '🚚 Đang giao';
      case 4: return '🎉 Hoàn thành';
      case 5: return '❌ Đã hủy';
      case 6: return '💰 Đã thanh toán (CK)';
      default: return 'Không rõ';
    }
  }

}
