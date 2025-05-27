import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../service/user.service';
import { TokenService } from '../service/token.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { DonhangService } from '../service/donhang.service';
import { MomoPaymentService } from '../service/momoPayment.service'; // Thêm import
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
    private momoService: MomoPaymentService, // Thêm service
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

    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.loadOrders().then(() => {
        const selected = this.orders.find(order => order.maDonHang === parseInt(orderId));
        if (selected) {
          this.selectedOrder = selected;
          this.checkPaymentStatus(selected); // Kiểm tra trạng thái thanh toán
          this.loadUserReviews();
          this.cdRef.detectChanges();
        } else {
          
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
   
    if (!update || !update.idDonHang || update.trangThai === undefined) {
      
      return;
    }

    const { idDonHang, trangThai } = update;
    
    const orderToUpdate = this.orders.find((order) => order.maDonHang === idDonHang);
    if (orderToUpdate) {
      orderToUpdate.trangThai = trangThai;
      orderToUpdate.statusLabel = this.getStatusLabel(trangThai);
      orderToUpdate.paymentConfirmed = trangThai === 6; // Cập nhật trạng thái thanh toán
      this.filteredOrders = [...this.orders];

      if (this.selectedOrder && this.selectedOrder.maDonHang === idDonHang) {
        this.selectedOrder.trangThai = trangThai;
        this.selectedOrder.statusLabel = this.getStatusLabel(trangThai);
        this.selectedOrder.paymentConfirmed = trangThai === 6;
        this.loadUserReviews();
      }

      this.cdRef.detectChanges();
    } else {
      this.loadOrders();
    }
  }

  calculateProductTotal(chiTietDonHangs: any[]): number {
    return chiTietDonHangs.reduce((total, item) => total + (item.donGia * item.quantity), 0);
  }

  loadOrders(): Promise<void> {
    return new Promise((resolve) => {
      this.userService.getOrders(this.userId).subscribe({
        next: (data) => {
          this.orders = data.map((order: { trangThai: number }) => ({
            ...order,
            statusLabel: this.getStatusLabel(order.trangThai),
            paymentConfirmed: order.trangThai === 6, // Giả định đã thanh toán nếu trạng thái là 6
          }));
          this.orders.sort((a, b) => b.maDonHang - a.maDonHang);
          this.filteredOrders = [...this.orders];
          // Kiểm tra trạng thái thanh toán cho các đơn hàng chuyển khoản
          this.orders.forEach(order => {
            if (order.trangThai === 1 && order.phuongThucThanhToan === 'ck') {
              this.checkPaymentStatus(order);
            }
          });
          
          resolve();
        },
        error: (error) => {
          
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

  checkPaymentStatus(order: any): void {
    if (order.trangThai === 1 && order.phuongThucThanhToan === 'ck') {
      const momoOrderId = `ORDER_${order.maDonHang}`;
      this.momoService.checkStatus(momoOrderId).subscribe({
        next: (res: any) => {
          order.paymentConfirmed = res.resultCode === 0;
          if (order.paymentConfirmed) {
            this.updateOrderStatusToPaid(order.maDonHang);
          }
          this.cdRef.detectChanges();
        },
        error: () => {
          order.paymentConfirmed = false;
          this.cdRef.detectChanges();
        },
      });
    } else {
      order.paymentConfirmed = order.trangThai === 6;
      this.cdRef.detectChanges();
    }
  }

  retryPayment(order: any): void {
    if (!order || !order.maDonHang || !order.tongTien) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Thiếu thông tin để thực hiện thanh toán lại.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    const utf8ToBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));
    const randomSuffix = Math.random().toString(36).substring(2, 8);
   const now = new Date();
const timestamp = now.toISOString().replace(/[-:T.]/g, "").slice(0, 14); // Format: YYYYMMDDHHMMSS
const newMomoOrderId = `ORDERTOSCENT_${order.maDonHang}_${randomSuffix}_${timestamp}`;
    const extraData = utf8ToBase64(
      JSON.stringify({
        orderId: newMomoOrderId,
        originalOrderId: order.maDonHang,
        amount: order.tongTien,
        orderInfo: `Thanh toán đơn hàng ${order.maDonHang}`,
      })
    );

    const momoRequest = {
      orderId: newMomoOrderId,
      orderInfo: `Thanh toán đơn hàng ${order.maDonHang}`,
      amount: order.tongTien,
      returnUrl: `http://localhost:4200/order-success/${order.maDonHang}?extraData=${extraData}`,
      notifyUrl: 'http://localhost:8080/api/momo/callback',
      requestType: 'captureWallet',
    };

    

    this.momoService.createPayment(momoRequest).subscribe({
      next: (res: any) => {
        if (res?.payUrl) {
          window.location.href = res.payUrl;
        } else {
          Swal.fire({
            title: 'Lỗi',
            text: 'Không thể khởi tạo thanh toán. Vui lòng thử lại.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      },
      error: (err) => {
     
        Swal.fire({
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi khởi tạo thanh toán. Vui lòng thử lại.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  updateOrderStatusToPaid(orderId: number): void {
    const userInfo = this.tokenService.getUserInfo();
    const userID = userInfo.UserID;
    const tenDangNhap = userInfo.sub;
    const apiUrl = `http://localhost:8080/rest/don-hang/capnhat-trangthai/${orderId}?trangThai=6&userID=${userID}&tenDangNhap=${tenDangNhap}`;

    fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            
            this.loadOrders(); // Tải lại danh sách đơn hàng
          });
        } else {
          return res.text().then(errorMessage => {
          
            Swal.fire({
              title: 'Lỗi',
              text: 'Không thể cập nhật trạng thái đơn hàng.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          });
        }
      })
      .catch(err => {
       
        Swal.fire({
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.',
          icon: 'error',
          confirmButtonText: 'OK',
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
        
        if (this.provinces.length === 0) {
          console.warn('Danh sách tỉnh rỗng, thử tải lại sau 2 giây');
          setTimeout(() => this.loadProvinces(), 2000);
        }
      },
      error: (error) => {
       
        setTimeout(() => this.loadProvinces(), 2000);
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
        this.userService.getOrders(this.userId).subscribe({
          next: (data) => {
            this.orders = data.map((order: { trangThai: number }) => ({
              ...order,
              statusLabel: this.getStatusLabel(order.trangThai),
              paymentConfirmed: order.trangThai === 6,
            }));
            this.orders.sort((a, b) => b.maDonHang - a.maDonHang);
            this.filteredOrders = [...this.orders];

            const updatedOrder = this.orders.find(order => order.maDonHang === this.selectedOrder.maDonHang);
            if (updatedOrder) {
              this.selectedOrder = { ...this.selectedOrder, ...updatedOrder, statusLabel: this.getStatusLabel(updatedOrder.trangThai) };
              if (updatedOrder.diaChiGiaoHang) {
                this.selectedOrder.diaChiGiaoHang = updatedOrder.diaChiGiaoHang;
              } else if (!this.provinces || this.provinces.length === 0) {
                this.loadProvincesWithRetry();
              } else {
                this.processAddressUpdate(updatedOrder);
              }
            }

            this.isUpdateAddressFormVisible = false;
            this.cdRef.detectChanges();
            Swal.fire({
              title: 'Thành công!',
              text: 'Địa chỉ giao hàng đã được cập nhật.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          error: (error) => {
          
            this.isUpdateAddressFormVisible = false;
            Swal.fire({
              title: 'Lỗi',
              text: 'Cập nhật địa chỉ thành công nhưng không thể tải lại thông tin.',
              icon: 'warning',
              confirmButtonText: 'OK',
            });
          },
        });
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

  private loadProvincesWithRetry(attempts: number = 3): void {
    this.donhangService.getProvinces().subscribe({
      next: (response: { result: { [key: number]: string } }) => {
        this.provinces = Object.keys(response.result).map((key) => ({
          id: parseInt(key),
          name: response.result[key],
        }));
        console.log('Danh sách tỉnh sau khi tải lại:', this.provinces);
        if (this.provinces.length === 0 && attempts > 1) {
          console.warn(`Danh sách tỉnh rỗng, thử lại sau 2 giây (còn ${attempts - 1} lần)`);
          setTimeout(() => this.loadProvincesWithRetry(attempts - 1), 2000);
        } else {
          this.processAddressUpdate(this.selectedOrder);
        }
      },
      error: (error) => {
        console.error('Lỗi khi lấy danh sách tỉnh:', error);
        if (attempts > 1) {
          console.warn(`Thử lại tải danh sách tỉnh sau 2 giây (còn ${attempts - 1} lần)`);
          setTimeout(() => this.loadProvincesWithRetry(attempts - 1), 2000);
        } else {
          this.processAddressUpdate(this.selectedOrder);
        }
      },
    });
  }

  private processAddressUpdate(updatedOrder: any): void {
    if (updatedOrder.maTinh) {
      this.donhangService.getDistricts(updatedOrder.maTinh).subscribe({
        next: (districtResponse: { result: { [key: string]: string } }) => {
          this.districts = Object.keys(districtResponse.result).map((key) => ({
            id: key,
            name: districtResponse.result[key],
          }));
          if (updatedOrder.maQuan) {
            this.donhangService.getWards(updatedOrder.maQuan).subscribe({
              next: (wardResponse: { result: { [key: string]: string } }) => {
                this.wards = Object.keys(wardResponse.result).map((key) => ({
                  id: key,
                  name: wardResponse.result[key],
                }));
                this.buildDiaChiGiaoHang();
                this.isUpdateAddressFormVisible = false;
                this.cdRef.detectChanges();
                Swal.fire({
                  title: 'Thành công!',
                  text: 'Địa chỉ giao hàng đã được cập nhật.',
                  icon: 'success',
                  timer: 1500,
                  showConfirmButton: false,
                });
              },
              error: (error) => {
                console.error('Lỗi khi lấy danh sách phường:', error);
                this.buildDiaChiGiaoHang();
                this.isUpdateAddressFormVisible = false;
                this.cdRef.detectChanges();
                Swal.fire({
                  title: 'Thành công!',
                  text: 'Địa chỉ giao hàng đã được cập nhật, nhưng không thể tải đầy đủ thông tin phường.',
                  icon: 'warning',
                  confirmButtonText: 'OK',
                });
              },
            });
          } else {
            this.buildDiaChiGiaoHang();
            this.isUpdateAddressFormVisible = false;
            this.cdRef.detectChanges();
            Swal.fire({
              title: 'Thành công!',
              text: 'Địa chỉ giao hàng đã được cập nhật.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            });
          }
        },
        error: (error) => {
          console.error('Lỗi khi lấy danh sách quận:', error);
          this.buildDiaChiGiaoHang();
          this.isUpdateAddressFormVisible = false;
          this.cdRef.detectChanges();
          Swal.fire({
            title: 'Thành công!',
            text: 'Địa chỉ giao hàng đã được cập nhật, nhưng không thể tải đầy đủ thông tin quận.',
            icon: 'warning',
            confirmButtonText: 'OK',
          });
        },
      });
    } else {
      this.buildDiaChiGiaoHang();
      this.isUpdateAddressFormVisible = false;
      this.cdRef.detectChanges();
      Swal.fire({
        title: 'Thành công!',
        text: 'Địa chỉ giao hàng đã được cập nhật.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  }

  private buildDiaChiGiaoHang(): void {
    console.log('Dữ liệu trước khi xây dựng diaChiGiaoHang:', {
      maTinh: this.selectedOrder.maTinh,
      provinces: this.provinces,
      maQuan: this.selectedOrder.maQuan,
      districts: this.districts,
      maPhuong: this.selectedOrder.maPhuong,
      wards: this.wards,
      diaChiChiTiet: this.selectedOrder.diaChiChiTiet,
    });

    if (this.selectedOrder.diaChiGiaoHang && !this.isUpdateAddressFormVisible) {
      console.log('Sử dụng diaChiGiaoHang từ API:', this.selectedOrder.diaChiGiaoHang);
      return;
    }

    const maTinh = typeof this.selectedOrder.maTinh === 'string'
      ? parseInt(this.selectedOrder.maTinh, 10)
      : this.selectedOrder.maTinh;
    const province = this.provinces.find(p => p.id === maTinh)?.name || 'Tỉnh không xác định';
    const district = this.districts.find(d => d.id === this.selectedOrder.maQuan?.toString())?.name || '';
    const ward = this.wards.find(w => w.id === this.selectedOrder.maPhuong)?.name || '';
    const diaChiChiTiet = this.selectedOrder.diaChiChiTiet || '';

    this.selectedOrder.diaChiGiaoHang = `${diaChiChiTiet}${ward ? ', ' + ward : ''}${district ? ', ' + district : ''}${province ? ', ' + province : ''}`;
    console.log('Địa chỉ giao hàng đã xây dựng:', this.selectedOrder.diaChiGiaoHang);
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
  toggleOrderDetail(order: any): void {
    if (this.selectedOrder === order) {
      this.selectedOrder = null;
      this.router.navigate(['/app-order-id']);
    } else {
      this.selectedOrder = { ...order }; // Sao chép toàn bộ đối tượng
      this.checkPaymentStatus(this.selectedOrder); // Kiểm tra trạng thái thanh toán khi xem chi tiết
      this.loadUserReviews();
      this.router.navigate(['/app-order-id', order.maDonHang]);
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
        this.danhGiaService.getUserDanhGia(item.idSanPham, this.userId, this.selectedOrder.maDonHang).subscribe({
          next: (danhGia: any) => {
            this.danhGias[item.idSanPham] = danhGia
              ? { id: danhGia.id, rating: danhGia.rating, comment: danhGia.comment }
              : { rating: 0, comment: '' };
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
    this.router.navigate(['/app-order-id']);
  }

  async cancelOrder(orderId: number): Promise<void> {
    const result = await Swal.fire({
      title: 'Xác nhận hủy đơn hàng',
      text: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hủy đơn hàng',
      cancelButtonText: 'Không',
    });

    if (result.isConfirmed) {
      try {
        const response: { status: string; message: any } = await this.donhangService.cancelOrder(orderId).toPromise();
        if (response.status === 'success') {
          const orderToUpdate = this.orders.find(order => order.maDonHang === orderId);
          if (orderToUpdate) {
            orderToUpdate.trangThai = 5;
            orderToUpdate.statusLabel = this.getStatusLabel(5);
            orderToUpdate.lyDoHuy = 'Khách hàng hủy đơn hàng';
            this.filteredOrders = [...this.orders];

            if (this.selectedOrder && this.selectedOrder.maDonHang === orderId) {
              this.selectedOrder.trangThai = 5;
              this.selectedOrder.statusLabel = this.getStatusLabel(5);
              this.selectedOrder.lyDoHuy = 'Khách hàng hủy đơn hàng';
            }
          }

          await this.loadOrders();
          this.cdRef.detectChanges();
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
      } catch (error: any) {
        Swal.fire({
          title: 'Lỗi',
          text: 'Không thể hủy đơn hàng. Vui lòng thử lại sau.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        console.error('Error cancelling order:', error);
      }
    }
  }

  filterOrders(status: string): void {
    const statusCode = this.keyToStatus[status] ?? 0;
    this.selectedStatus = statusCode;
    this.filteredOrders = statusCode === 0
      ? [...this.orders]
      : this.orders.filter(order => order.trangThai === statusCode).sort((a, b) => b.maDonHang - a.maDonHang);
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
      id: danhGia.id,
      idSanPham: productId,
      idTaiKhoan: this.userId,
      idDonHang: this.selectedOrder.maDonHang,
      rating: danhGia.rating,
      comment: danhGia.comment,
    };

    const action = danhGia.id
      ? this.danhGiaService.updateDanhGia(danhGia.id, danhGiaDTO)
      : this.danhGiaService.addDanhGia(danhGiaDTO);

    action.subscribe({
      next: (res) => {
        Swal.fire({
          title: 'Thành công!',
          text: danhGia.id ? 'Đánh giá đã được cập nhật.' : 'Đánh giá đã được gửi.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        this.loadUserReviews();
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Có lỗi xảy ra khi xử lý đánh giá.';
        Swal.fire({
          title: 'Lỗi',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
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

  openReturnModal(order?: any): void {
    // Sử dụng order nếu được truyền từ danh sách, nếu không thì dùng selectedOrder
    const tempSelectedOrder = order || this.selectedOrder;
  
    if (tempSelectedOrder && tempSelectedOrder.maDonHang) {
      const dialogRef = this.dialog.open(TraHangComponent, {
        width: '500px',
        data: { 
          maDonHang: tempSelectedOrder.maDonHang,
          chiTietDonHangs: tempSelectedOrder.chiTietDonHangs // Truyền danh sách sản phẩm
        },
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadOrders(); // Làm mới danh sách đơn hàng
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