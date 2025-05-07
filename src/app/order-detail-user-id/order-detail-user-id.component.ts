import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../service/user.service';
import { TokenService } from '../service/token.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { DonhangService } from '../service/donhang.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { WebSocketService } from '../service/WebSocketService';
import { TraHangService } from '../service/TraHangService';
import { MatDialog } from '@angular/material/dialog';
import { TraHangComponent } from '../tra-hang/tra-hang.component';
import { DanhGiaService } from '../service/DanhGiaService';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-order-detail-user-id',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule, MatDialogModule],
  templateUrl: './order-detail-user-id.component.html',
  styleUrls: ['./order-detail-user-id.component.scss'],
})
export class OrderDetailUserIDComponent implements OnInit, OnDestroy {
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
  danhGias: { [key: number]: { id?: number; rating: number; comment: string } } = {};
  isUpdateAddressFormVisible: boolean = false;
  provinces: { id: number; name: string }[] = [];
  districts: { id: string; name: string }[] = [];
  wards: { id: string; name: string }[] = [];
  private webSocketSubscription: Subscription | undefined;

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private donhangService: DonhangService,
    private danhGiaService: DanhGiaService,
    private cdRef: ChangeDetectorRef,
    private webSocketService: WebSocketService,
    private traHangService: TraHangService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userId = this.tokenService.getUserId();
  }

  ngOnInit(): void {
    if (!this.userId) {
      console.error('Không tìm thấy userId từ token');
      Swal.fire({
        title: 'Lỗi',
        text: 'Vui lòng đăng nhập để xem đơn hàng.',
        icon: 'error',
        confirmButtonText: 'OK',
      }).then(() => {
        // this.router.navigate(['/login']);
      });
      return;
    }

    this.loadOrders();
    this.loadProvinces();

    this.webSocketService.connect(this.userId);
    this.webSocketSubscription = this.webSocketService.getMessages().subscribe({
      next: (update: any) => this.handleWebSocketUpdate(update),
      error: (error) => console.error('WebSocket subscription error:', error),
      complete: () => console.log('WebSocket subscription completed'),
    });

    // Kiểm tra orderId từ route
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.loadOrders().then(() => {
        const selected = this.orders.find(order => order.maDonHang === parseInt(orderId));
        if (selected) {
          this.selectedOrder = selected;
          this.loadUserReviews();
          this.cdRef.detectChanges();
        } else {
          console.warn(`Không tìm thấy đơn hàng với mã ${orderId}`);
          Swal.fire({
            title: 'Lỗi',
            text: `Không tìm thấy đơn hàng với mã ${orderId}.`,
            icon: 'warning',
            confirmButtonText: 'OK',
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  private handleWebSocketUpdate(update: any): void {
    console.log('Received WebSocket update:', update);
    if (!update || !update.idDonHang || update.trangThai === undefined) {
      console.error('Invalid WebSocket update:', update);
      return;
    }

    const { idDonHang, trangThai } = update;
    console.log(`Cập nhật trạng thái đơn hàng ${idDonHang}: ${trangThai}`);
    const orderToUpdate = this.orders.find((order) => order.maDonHang === idDonHang);
    if (orderToUpdate) {
      orderToUpdate.trangThai = trangThai;
      orderToUpdate.statusLabel = this.getStatusLabel(trangThai);
      this.filteredOrders = [...this.orders];

      if (this.selectedOrder && this.selectedOrder.maDonHang === idDonHang) {
        this.selectedOrder.trangThai = trangThai;
        this.selectedOrder.statusLabel = this.getStatusLabel(trangThai);
        this.loadUserReviews();
      }

      this.cdRef.detectChanges();
    } else {
      this.loadOrders();
    }
  }

  loadOrders(): Promise<void> {
    return new Promise((resolve) => {
      this.userService.getOrders(this.userId).subscribe({
        next: (data) => {
          this.orders = data.map((order: { trangThai: number }) => ({
            ...order,
            statusLabel: this.getStatusLabel(order.trangThai),
          }));
          this.orders.sort((a, b) => b.maDonHang - a.maDonHang);
          this.filteredOrders = [...this.orders];
          console.log('Dữ liệu đơn hàng:', this.orders);
          resolve();
        },
        error: (error) => {
          console.error('Lỗi khi lấy đơn hàng:', error);
          Swal.fire({
            title: 'Lỗi',
            text: 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          resolve();
        },
      });
    });
  }

  loadProvinces(): void {
    this.donhangService.getProvinces().subscribe({
      next: (response: { result: { [key: number]: string } }) => {
        this.provinces = Object.keys(response.result).map((key) => ({
          id: parseInt(key),
          name: response.result[key],
        }));
      },
      error: (error) => {
        console.error('Lỗi khi lấy danh sách tỉnh:', error);
      },
    });
  }

  onProvinceChange(): void {
    if (this.selectedOrder?.maTinh) {
      this.donhangService.getDistricts(this.selectedOrder.maTinh).subscribe({
        next: (response: { result: { [key: string]: string } }) => {
          this.districts = Object.keys(response.result).map((key) => ({
            id: key,
            name: response.result[key],
          }));
          this.wards = [];
          this.selectedOrder.maQuan = this.selectedOrder.maQuan || '';
          if (this.selectedOrder.maQuan) {
            this.onDistrictChange();
          }
        },
        error: (error) => {
          console.error('Lỗi khi lấy danh sách quận:', error);
        },
      });
    } else {
      this.districts = [];
      this.wards = [];
      this.selectedOrder.maQuan = '';
      this.selectedOrder.maPhuong = '';
    }
  }

  onDistrictChange(): void {
    if (this.selectedOrder?.maQuan) {
      this.donhangService.getWards(this.selectedOrder.maQuan).subscribe({
        next: (response: { result: { [key: string]: string } }) => {
          this.wards = Object.keys(response.result).map((key) => ({
            id: key,
            name: response.result[key],
          }));
          this.selectedOrder.maPhuong = this.selectedOrder.maPhuong || '';
        },
        error: (error) => {
          console.error('Lỗi khi lấy danh sách phường:', error);
        },
      });
    } else {
      this.wards = [];
      this.selectedOrder.maPhuong = '';
    }
  }

  toggleUpdateAddressForm(): void {
    this.isUpdateAddressFormVisible = !this.isUpdateAddressFormVisible;
    if (this.isUpdateAddressFormVisible) {
      if (!this.provinces || this.provinces.length === 0) {
        this.loadProvinces();
      }
      if (this.selectedOrder?.maTinh) {
        this.onProvinceChange();
      }
    }
  }

  updateAddress(formData: any): void {
    const updateData = {
      tenNguoiNhanHang: formData.tenNguoiNhanHang,
      sdtNguoiNhan: formData.sdtNguoiNhan,
      diaChiChiTiet: formData.diaChiChiTiet,
      maTinh: parseInt(formData.maTinh),
      maQuan: parseInt(formData.maQuan),
      maPhuong: formData.maPhuong,
    };

    this.donhangService.updateOrderAddress(this.selectedOrder.maDonHang, updateData).subscribe({
      next: (response) => {
        this.isUpdateAddressFormVisible = false;
        Swal.fire({
          title: 'Thành công!',
          text: 'Địa chỉ giao hàng đã được cập nhật.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        this.loadOrders();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Có lỗi xảy ra khi cập nhật địa chỉ.';
        Swal.fire({
          title: 'Lỗi',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  getStatusLabel(statusCode: number): string {
    switch (statusCode) {
      case 1:
        return 'Chờ xác nhận';
      case 2:
        return 'Đã xác nhận';
      case 3:
        return 'Đang giao';
      case 4:
        return 'Hoàn thành';
      case 5:
        return 'Đã hủy';
      case 6:
        return 'Đã thanh toán';
      default:
        return 'Trạng thái không xác định';
    }
  }

  toggleOrderDetail(order: any): void {
    if (this.selectedOrder === order) {
      this.selectedOrder = null;
      this.router.navigate(['/app-order-id']); // Quay lại danh sách khi đóng chi tiết
    } else {
      this.selectedOrder = order;
      this.loadUserReviews();
      this.router.navigate(['/app-order-id', order.maDonHang]); // Điều hướng đến chi tiết với orderId
    }
    this.cdRef.detectChanges();
  }

  loadUserReviews(): void {
    if (!this.selectedOrder || this.selectedOrder.trangThai !== 4) {
      this.danhGias = {};
      return;
    }

    this.selectedOrder.chiTietDonHangs.forEach((item: any) => {
      if (item.idSanPham) {
        this.danhGiaService
          .getUserDanhGia(item.idSanPham, this.userId, this.selectedOrder.maDonHang)
          .subscribe({
            next: (danhGia: any) => {
              if (danhGia) {
                this.danhGias[item.idSanPham] = {
                  id: danhGia.id,
                  rating: danhGia.rating,
                  comment: danhGia.comment,
                };
              } else {
                this.danhGias[item.idSanPham] = { rating: 0, comment: '' };
              }
              this.cdRef.detectChanges();
            },
            error: (error) => {
              console.error(`Lỗi khi lấy đánh giá cho sản phẩm ${item.idSanPham}:`, error);
              this.danhGias[item.idSanPham] = { rating: 0, comment: '' };
              this.cdRef.detectChanges();
            },
          });
      }
    });
  }

  setRating(productId: string, rating: number): void {
    if (!this.danhGias[productId]) {
      this.danhGias[productId] = { rating: 0, comment: '' };
    }
    this.danhGias[productId].rating = rating;
  }

  goBack(): void {
    this.selectedOrder = null;
    this.danhGias = {};
    this.router.navigate(['/app-order-id']); // Quay lại danh sách
  }

  cancelOrder(orderId: number): void {
    Swal.fire({
      title: 'Xác nhận hủy đơn hàng',
      text: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hủy đơn hàng',
      cancelButtonText: 'Không',
    }).then((result) => {
      if (result.isConfirmed) {
        this.donhangService.cancelOrder(orderId).subscribe({
          next: (response: { status: string; message: any }) => {
            if (response.status === 'success') {
              this.loadOrders();
              Swal.fire({
                title: 'Thành công',
                text: 'Đơn hàng đã được hủy.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: 'Lỗi',
                text: response.message,
                icon: 'error',
                confirmButtonText: 'OK',
              });
            }
          },
          error: (error) => {
            Swal.fire({
              title: 'Lỗi',
              text: 'Không thể hủy đơn hàng. Vui lòng thử lại sau.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
            console.error('Error cancelling order:', error);
          },
        });
      }
    });
  }

  filterOrders(status: string): void {
    const statusCode = this.keyToStatus[status] ?? 0;
    this.selectedStatus = statusCode;

    if (statusCode === 0) {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter((order) => order.trangThai === statusCode);
      this.filteredOrders.sort((a, b) => b.maDonHang - a.maDonHang);
    }
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

    if (danhGia.id) {
      this.danhGiaService.getUserDanhGia(productId, this.userId, this.selectedOrder.maDonHang).subscribe({
        next: (existingDanhGia: any) => {
          if (existingDanhGia && existingDanhGia.id === danhGia.id) {
            const danhGiaDTO = {
              id: danhGia.id,
              idSanPham: productId,
              idTaiKhoan: this.userId,
              idDonHang: existingDanhGia.idDonHang,
              rating: danhGia.rating,
              comment: danhGia.comment,
            };

            this.danhGiaService.updateDanhGia(danhGia.id, danhGiaDTO).subscribe({
              next: (res) => {
                Swal.fire({
                  title: 'Thành công!',
                  text: 'Đánh giá của bạn đã được cập nhật.',
                  icon: 'success',
                  timer: 1500,
                  showConfirmButton: false,
                });
                this.loadUserReviews();
              },
              error: (err) => {
                const errorMessage = err.error?.message || 'Có lỗi xảy ra khi cập nhật đánh giá.';
                Swal.fire({
                  title: 'Lỗi',
                  text: errorMessage,
                  icon: 'error',
                  confirmButtonText: 'OK',
                });
              },
            });
          } else {
            Swal.fire({
              title: 'Lỗi',
              text: 'Đánh giá không tồn tại hoặc không khớp. Vui lòng thử lại.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
            this.loadUserReviews();
          }
        },
        error: (err) => {
          Swal.fire({
            title: 'Lỗi',
            text: 'Không thể kiểm tra đánh giá. Vui lòng thử lại.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          this.loadUserReviews();
        },
      });
    } else {
      const danhGiaDTO = {
        idSanPham: productId,
        idTaiKhoan: this.userId,
        idDonHang: this.selectedOrder.maDonHang,
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
          this.loadUserReviews();
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

  deleteDanhGia(productId: number): void {
    const danhGia = this.danhGias[productId];
    if (!danhGia.id) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Không tìm thấy đánh giá để xóa.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    Swal.fire({
      title: 'Xác nhận xóa đánh giá',
      text: 'Bạn có chắc chắn muốn xóa đánh giá này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.danhGiaService.deleteDanhGia(danhGia.id, this.userId).subscribe({
          next: () => {
            Swal.fire({
              title: 'Thành công!',
              text: 'Đánh giá đã được xóa.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            });
            this.danhGias[productId] = { rating: 0, comment: '' };
            this.loadUserReviews();
          },
          error: (err) => {
            const errorMessage = err.error?.message || 'Có lỗi xảy ra khi xóa đánh giá.';
            Swal.fire({
              title: 'Lỗi',
              text: errorMessage,
              icon: 'error',
              confirmButtonText: 'OK',
            });
          },
        });
      }
    });
  }

  openReturnModal(): void {
    if (this.selectedOrder && this.selectedOrder.maDonHang) {
      const dialogRef = this.dialog.open(TraHangComponent, {
        width: '500px',
        data: { maDonHang: this.selectedOrder.maDonHang }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadOrders();
        }
      });
    } else {
      Swal.fire({
        title: 'Lỗi',
        text: 'Không tìm thấy thông tin đơn hàng để trả.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }
}