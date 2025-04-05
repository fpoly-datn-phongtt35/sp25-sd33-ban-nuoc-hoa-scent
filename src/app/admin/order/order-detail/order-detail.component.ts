import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LichSuThaoTacService } from '../../../service/LichSuThaoTac';
import Swal from 'sweetalert2';
export class LichSuThaoTac {
  id:number;
  maDonHang: number;
  trangThaiCu: number;
  trangThaiMoi: number;
  taiKhoanId: number;
  tenTaiKhoan: string;
  ghiChu: string;
  thoiGianThaoTac: string;
  thaoTac: string;
}
@Component({
  selector: 'app-order-detai',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class OrderDetaiComponent {
  @Input() order: any;
  @Input() selectedTab: string = 'online'; // Thêm input để biết chế độ online/offline
  @Output() closeDetail = new EventEmitter<void>();
  lichSuThaoTacs: LichSuThaoTac[] = []; // Danh sách lịch sử thao tác
  showLichSuModal: boolean = false;
  close() {
    this.closeDetail.emit();
  }
  constructor(private lichSuThaoTacService: LichSuThaoTacService) {}
  getPaymentMethod(method: string): string {
    const normalized = method?.toLowerCase();
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
  showLichSuThaoTac() {
    console.log('Order ID:', this.order.id);
    this.lichSuThaoTacService.getLichSuThaoTacByMaDonHang(this.order.id).subscribe(
      (data) => {
        this.lichSuThaoTacs = data;
        this.showLichSuModal = true;
        console.log('Hiển thị modal lịch sử:', this.lichSuThaoTacs);
      },
      (error) => {
        console.error('Error fetching lich su thao tac:', error);
        if (error.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Phiên đăng nhập hết hạn',
            text: 'Vui lòng đăng nhập lại để tiếp tục.',
            confirmButtonText: 'Đăng nhập'
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = '/login';
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể tải lịch sử thao tác. Vui lòng thử lại sau.',
          });
        }
      }
    );
  }

  // Đóng modal lịch sử thao tác
  closeLichSuModal() {
    this.showLichSuModal = false;
  }
}