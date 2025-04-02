import { Component,OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { UserService } from '../service/user.service';
import { TokenService } from '../service/token.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { DonhangService } from '../service/donhang.service';
import { FormsModule } from '@angular/forms'; 
@Component({
  selector: 'app-order-detail-user-id',
  standalone: true,
  imports: [CommonModule,HeaderComponent, FooterComponent,FormsModule],
  templateUrl: './order-detail-user-id.component.html',
  styleUrl: './order-detail-user-id.component.scss'
})
export class OrderDetailUserIDComponent implements OnInit{
  orders: any[] = [];
  userId: number=0;
  selectedOrder: any = null;
  filteredOrders: any[] = [];
  selectedStatus: number = 0;
  keyToStatus: Record<string, number> = {
    pending: 1,
    unPaid: 1,
    processed: 2,
    shipping: 3,
    prepaid: 6,
    completed: 4,
    cancelled: 5,
  };
  constructor(private userService: UserService,private tokenService: TokenService,private donhangService :DonhangService) {
   
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
          this.filteredOrders = [...this.orders];
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
  cancelOrder(orderId: number) {
    this.donhangService.cancelOrder(orderId).subscribe(
      (response: { status: string; message: any; }) => {
        if (response.status === 'success') {
          // If cancellation is successful, update the order status
          this.selectedOrder.trangThai = 5;  // Update the status to "Đã huỷ"
          this.selectedOrder.statusLabel = 'Đã huỷ';  // Update the label accordingly
          alert(response.message);  // Display success message from API
        } else {
          // If cancellation failed
          alert(response.message);  // Display error message from API
        }
      },
      (error) => {
        alert('Lỗi hệ thống. Không thể hủy đơn hàng.');
        console.error(error);
      }
    );
  }
  filterOrders(status: string): void {
    const statusCode = this.keyToStatus[status] ?? null;
    this.selectedStatus = statusCode;
  
    // Nếu trạng thái không có hoặc là 0 (Tất cả), hiển thị tất cả đơn hàng
    if (statusCode === null || statusCode === 0) {
      this.filteredOrders = [...this.orders];  // Hiển thị tất cả đơn hàng
    } else {
      // Lọc đơn hàng theo trạng thái
      this.filteredOrders = this.orders.filter(order => order.trangThai === statusCode);
    }
  
    // Đảm bảo lọc lại đơn hàng mỗi khi chọn trạng thái mới
    console.log("Lọc đơn hàng với trạng thái:", status, this.filteredOrders);
  }
  
  // filterOrders(status: number) {
  //   if (status === 0) {
  //     this.filteredOrders = this.orders; // Hiển thị tất cả đơn hàng nếu không có trạng thái lọc
  //   } else {
  //     this.filteredOrders = this.orders.filter(order => order.statusLabel === status);
  //   }
  // }
  
}
