import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../service/user.service';
import { TokenService } from '../service/token.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { DonhangService } from '../service/donhang.service';
 
 import { ChangeDetectorRef } from '@angular/core';

import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DanhGiaService } from '../service/DanhGiaService';

@Component({
  selector: 'app-order-detail-user-id',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule],
  templateUrl: './order-detail-user-id.component.html',
  styleUrls: ['./order-detail-user-id.component.scss'],
})
export class OrderDetailUserIDComponent implements OnInit {
  orders: any[] = [];
  userId: number = 0;
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
  danhGias: { [key: number]: { rating: number; comment: string } } = {}; // Lưu thông tin đánh giá cho từng sản phẩm

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private donhangService: DonhangService,
    private danhGiaService: DanhGiaService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = this.tokenService.getUserId();

    if (this.userId) {
      this.userService.getOrders(this.userId).subscribe({
        next: (data) => {
          this.orders = data.map((order: { trangThai: number }) => ({
            ...order,
            statusLabel: this.getStatusLabel(order.trangThai),
          }));
          this.filteredOrders = [...this.orders];
          console.log('Dữ liệu đơn hàng:', this.orders);
        },
        error: (error) => {
          console.error('Lỗi khi lấy đơn hàng', error);
        },
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
      case 4: return 'Hoàn thành';
      case 5: return 'Đã hủy';
      case 6: return 'Đã thanh toán';
      default: return 'Trạng thái không xác định';
    }
  }

  toggleOrderDetail(order: any) {
    if (this.selectedOrder === order) {
      this.selectedOrder = null;
    } else {
      this.selectedOrder = order;
      // Khởi tạo form đánh giá cho từng sản phẩm trong đơn hàng
      if (this.selectedOrder.trangThai === 4) { // Chỉ khởi tạo nếu đơn hàng đã hoàn thành
        this.selectedOrder.chiTietDonHangs.forEach((item: any) => {
          if (!item.idSanPham) {
            console.error('Lỗi: sanPhamId không tồn tại cho sản phẩm:', item);
            return;
          }
          this.danhGias[item.idSanPham] = { rating: 0, comment: '' };
          console.log(`Khởi tạo danhGias cho sanPhamId: ${item.idSanPham}`, this.danhGias[item.idSanPham]);
        });
      }
    }
  }
  
  setRating(productId: string, rating: number) {
    if (!this.danhGias[productId]) {
      this.danhGias[productId] = { rating: 0, comment: '' };
    }
    this.danhGias[productId].rating = rating;
    // Optionally, force a change detection if the UI doesn't update
    this.cdRef.detectChanges(); // If you have ChangeDetectorRef injected
  }

  goBack() {
    this.selectedOrder = null;
  }

  cancelOrder(orderId: number) {
    this.donhangService.cancelOrder(orderId).subscribe(
      (response: { status: string; message: any }) => {
        if (response.status === 'success') {
          this.selectedOrder.trangThai = 5;
          this.selectedOrder.statusLabel = 'Đã hủy';
          alert(response.message);
        } else {
          alert(response.message);
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

    if (statusCode === null || statusCode === 0) {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => order.trangThai === statusCode);
    }

    console.log("Lọc đơn hàng với trạng thái:", status, this.filteredOrders);
  }

 

  submitDanhGia(productId: number): void {
    const danhGia = this.danhGias[productId];
    if (danhGia.rating < 1 || danhGia.rating > 5) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Vui lòng chọn đánh giá từ 1 đến 5 sao!',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (!danhGia.comment.trim()) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Vui lòng nhập bình luận!',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    const danhGiaDTO = {
      idSanPham: productId,
      idTaiKhoan: this.userId,
      rating: danhGia.rating,
      comment: danhGia.comment,
    };

    this.danhGiaService.addDanhGia(danhGiaDTO).subscribe({
      next: (res) => {
        Swal.fire({
          title: 'Thành công!',
          text: 'Đánh giá của bạn đã được gửi.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        // Reset form sau khi gửi
        this.danhGias[productId] = { rating: 0, comment: '' };
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Có lỗi xảy ra khi gửi đánh giá.';
        Swal.fire({
          title: 'Lỗi',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }
}