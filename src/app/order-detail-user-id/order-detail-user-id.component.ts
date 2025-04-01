import { Component,OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { UserService } from '../service/user.service';
import { TokenService } from '../service/token.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-order-detail-user-id',
  standalone: true,
  imports: [CommonModule,HeaderComponent, FooterComponent],
  templateUrl: './order-detail-user-id.component.html',
  styleUrl: './order-detail-user-id.component.scss'
})
export class OrderDetailUserIDComponent implements OnInit{
  orders: any[] = [];
  userId: number=0;
  selectedOrder: any = null;
  constructor(private userService: UserService,private tokenService: TokenService) {
   
  }

  ngOnInit(): void {
    this.userId = this.tokenService.getUserId();

    if (this.userId) {
      this.userService.getOrders(this.userId).subscribe({
        next: (data) => {
          this.orders = data.map((order: { trangThai: number; }) => ({
            ...order,
            statusLabel: this.getStatusLabel(order.trangThai) // Thêm nhãn trạng thái vào mỗi đơn hàng
             
          }));
          console.log('Dữ liệu đơn hàng:', this.orders);
        },
        error: (error) => {
          console.error('Lỗi khi lấy đơn hàng', error);
        }
      });
    } else {
      console.error('Không tìm thấy userId từ token');
    }
  }
  getStatusLabel(statusCode: number): string {
    switch (statusCode) {
      case 1: return 'Chờ xác nhận';  // Trạng thái chờ xác nhận
      case 2: return 'Đã xác nhận';  // Trạng thái đã xác nhận
      case 3: return 'Đang giao';  // Trạng thái đang giao
      case 4: return 'Hoàn thành';  // Trạng thái đã hoàn thành
      case 5: return 'Đã hủy';  // Trạng thái đã hủy
      case 6: return 'Đã thanh toán';  // Trạng thái đã thanh toán (chuyển khoản)
      default: return 'Trạng thái không xác định';  // Nếu không phải một trong các trạng thái trên
    }
  }
  
  openModal(order: any) {
    console.log("Đơn hàng đã được nhấn:", order);
    this.selectedOrder = order;
    console.log("selectedOrder:", this.selectedOrder);
  }

  closeModal() {
    this.selectedOrder = null;
  }
   toggleOrderDetail(order: any) {
    if (this.selectedOrder === order) {
      this.selectedOrder = null; // Nếu đã chọn đơn hàng thì bỏ chọn
    } else {
      this.selectedOrder = order; // Chọn đơn hàng mới
    }
  }
  goBack() {
    this.selectedOrder = null; // Quay lại danh sách đơn hàng
  }
  
}
