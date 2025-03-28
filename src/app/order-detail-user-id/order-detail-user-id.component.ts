import { Component,OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { UserService } from '../service/user.service';
import { TokenService } from '../service/token.service';

@Component({
  selector: 'app-order-detail-user-id',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail-user-id.component.html',
  styleUrl: './order-detail-user-id.component.scss'
})
export class OrderDetailUserIDComponent implements OnInit{
  orders: any[] = [];
  userId: number=0;

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
      case 1: return 'Chờ xác nhận';
      case 2: return 'Đã xác nhận';
      case 3: return 'Đang giao';
      case 4: return 'Đã thanh toán';
      case 5: return 'Đã hủy';
      default: return 'Trạng thái không xác định';
    }
  }
}
