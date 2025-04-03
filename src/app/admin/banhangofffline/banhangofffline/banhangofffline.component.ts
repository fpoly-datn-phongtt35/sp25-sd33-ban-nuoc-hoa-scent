import { Component, OnInit, OnDestroy, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { TokenService } from '../../../service/token.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OrderOffService } from '../../../service/OrderOffService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HoadonOfComponent } from '../../../hoadon-of/hoadon-of.component';

@Component({
  selector: 'app-banhangoffline',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './banhangofffline.component.html',
  styleUrls: ['./banhangofffline.component.scss']
})
export class OfflineOrderComponent implements OnInit, OnDestroy {
  orders: any[] = [
    {
      donHang: { tenNguoiNhanHang: '', sdtNguoiNhan: '' },
      chiTietDonHangs: [],
      phuongThucThanhToan: 'tm'
    }
  ];
  currentOrderIndex: number = 0;
  orderId: number | null = null;
  get currentOrder() {
    return this.orders[this.currentOrderIndex];
  }

  products: any[] = [];
  searchKeyword: string = '';
  errorMessage: string | null = null;
  isLoading: boolean = false;
  showQuantityModal: boolean = false;
  selectedProduct: any = null;
  selectedQuantity: number = 1;
  totalBeforeDiscount: number = 0;

  // Thêm EventEmitter để thông báo cho màn hình "Hóa đơn" làm mới danh sách
  orderStatusUpdated = new EventEmitter<void>();

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  constructor(
    private orderoffservice: OrderOffService,
    private tokenService: TokenService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((keyword) => {
        this.searchProducts(keyword);
      });
  }

  ngOnInit(): void {
    this.searchProducts('');
    if (this.currentOrder.chiTietDonHangs.length > 0) {
      this.calculateTotal();
    }
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  addNewOrder(): void {
    this.orders.push({
      donHang: { tenNguoiNhanHang: '', sdtNguoiNhan: '' },
      chiTietDonHangs: [],
      phuongThucThanhToan: 'tm'
    });
    this.currentOrderIndex = this.orders.length - 1;
    this.calculateTotal();
  }

  switchOrder(index: number): void {
    this.currentOrderIndex = index;
    this.calculateTotal();
  }

  closeOrderTab(index: number): void {
    if (this.orders.length <= 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: 'Phải có ít nhất 1 đơn hàng!',
      });
      return;
    }
    this.orders.splice(index, 1);
    if (this.currentOrderIndex >= this.orders.length) {
      this.currentOrderIndex = this.orders.length - 1;
    }
    this.calculateTotal();
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchKeyword);
  }

  searchProducts(keyword: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.orderoffservice.searchSanPham(keyword).subscribe(
      (data) => {
        this.products = data;
        console.log('Products from API:', this.products);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching products:', error);
        this.errorMessage = 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.';
        this.products = [];
        this.isLoading = false;
      }
    );
  }

  openQuantityModal(product: any): void {
    this.selectedProduct = product;
    this.selectedQuantity = 1;
    this.showQuantityModal = true;
  }

  closeQuantityModal(): void {
    this.showQuantityModal = false;
    this.selectedProduct = null;
    this.selectedQuantity = 1;
  }

  calculateTotal(): void {
    console.log('chiTietDonHangs:', this.currentOrder.chiTietDonHangs);
    this.totalBeforeDiscount = this.currentOrder.chiTietDonHangs.reduce(
      (total: number, item: any) => {
        console.log('Item thanhTien:', item.thanhTien);
        return total + (item.thanhTien || 0);
      },
      0
    );
    console.log('Total Before Discount:', this.totalBeforeDiscount);
    this.cdr.detectChanges();
  }

  confirmAddProduct(): void {
    if (!this.selectedProduct) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không có sản phẩm được chọn!',
      });
      return;
    }

    if (this.selectedQuantity < 1) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Số lượng phải lớn hơn 0!',
      });
      return;
    }

    if (!this.selectedProduct.idSpct || isNaN(this.selectedProduct.idSpct)) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'ID sản phẩm chi tiết (idSpct) không hợp lệ!',
      });
      return;
    }

    if (!this.selectedProduct.donGia || this.selectedProduct.donGia <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: `Sản phẩm "${this.selectedProduct.tenSanPham || 'Không xác định'}" có giá không hợp lệ!`,
      });
      return;
    }

    const existingItem = this.currentOrder.chiTietDonHangs.find(
      (item: any) =>
        item.tenSanPham === this.selectedProduct.tenSanPham &&
        item.dungTich === this.selectedProduct.dungTich &&
        item.idSanPham === this.selectedProduct.idSanPham
    );
    if (existingItem) {
      existingItem.soLuong += this.selectedQuantity;
      existingItem.thanhTien = existingItem.donGia * existingItem.soLuong;
    } else {
      this.currentOrder.chiTietDonHangs.push({
        idSanPham: this.selectedProduct.idSanPham,
        idSpct: this.selectedProduct.idSpct,
        tenSanPham: this.selectedProduct.tenSanPham,
        donGia: this.selectedProduct.donGia || 0,
        dungTich: this.selectedProduct.dungTich,
        urlImage: this.selectedProduct.urlImage,
        soLuong: this.selectedQuantity,
        thanhTien: (this.selectedProduct.donGia || 0) * this.selectedQuantity
      });
    }

    this.calculateTotal();
    this.closeQuantityModal();
  }

  increaseQuantity(index: number): void {
    this.currentOrder.chiTietDonHangs[index].soLuong++;
    this.currentOrder.chiTietDonHangs[index].thanhTien =
      this.currentOrder.chiTietDonHangs[index].donGia * this.currentOrder.chiTietDonHangs[index].soLuong;
    this.calculateTotal();
    console.log('After increaseQuantity, totalBeforeDiscount:', this.totalBeforeDiscount);
  }

  decreaseQuantity(index: number): void {
    if (this.currentOrder.chiTietDonHangs[index].soLuong > 1) {
      this.currentOrder.chiTietDonHangs[index].soLuong--;
      this.currentOrder.chiTietDonHangs[index].thanhTien =
        this.currentOrder.chiTietDonHangs[index].donGia * this.currentOrder.chiTietDonHangs[index].soLuong;
      this.calculateTotal();
      console.log('After decreaseQuantity, totalBeforeDiscount:', this.totalBeforeDiscount);
    }
  }

  removeProduct(index: number): void {
    this.currentOrder.chiTietDonHangs.splice(index, 1);
    this.calculateTotal();
    console.log('After removeProduct, totalBeforeDiscount:', this.totalBeforeDiscount);
  }

  validateOrder(): boolean {
    if (!this.currentOrder.donHang.tenNguoiNhanHang) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Vui lòng nhập tên khách hàng!',
      });
      return false;
    }

    if (!this.currentOrder.donHang.sdtNguoiNhan) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Vui lòng nhập số điện thoại!',
      });
      return false;
    }

    if (this.currentOrder.chiTietDonHangs.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Giỏ hàng trống, không thể tạo đơn hàng!',
      });
      return false;
    }

    const idTaiKhoan = this.tokenService.getUserId();
    if (!idTaiKhoan) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể lấy ID tài khoản. Vui lòng đăng nhập lại!',
      });
      return false;
    }

    const invalidItem = this.currentOrder.chiTietDonHangs.find((item: any) => !item.idSanPham);
    if (invalidItem) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: `Sản phẩm "${invalidItem.tenSanPham || 'Không xác định'}" có ID không hợp lệ!`,
      });
      return false;
    }

    return true;
  }

  submitOrder(): void {
    if (!this.validateOrder()) {
      return;
    }

    this.isLoading = true;

    const userId = this.tokenService.getUserInfo();
    console.log('userId from tokenService.getUserInfo():', userId);

    if (!userId || !userId.UserID || isNaN(userId.UserID) || userId.UserID <= 0) {
      console.log('userId không hợp lệ:', { userId, userIdDotUserID: userId?.UserID });
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'ID tài khoản không hợp lệ! Vui lòng đăng nhập lại.',
      });
      return;
    }

    const invalidItem = this.currentOrder.chiTietDonHangs.find(
      (item: any) => !item.idSpct || isNaN(item.idSpct) || item.idSpct <= 0
    );
    if (invalidItem) {
      console.log('Sản phẩm có idSpct không hợp lệ:', invalidItem);
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: `Sản phẩm "${invalidItem.tenSanPham || 'Không xác định'}" không có idSpct hợp lệ!`,
      });
      return;
    }

    const orderRequest = {
      userId: Number(userId.UserID),
      tenNguoiNhanHang: this.currentOrder.donHang.tenNguoiNhanHang || '',
      sdtNguoiNhan: this.currentOrder.donHang.sdtNguoiNhan || '',
      chiTietDonHangs: this.currentOrder.chiTietDonHangs.map((item: any) => ({
        spctId: item.idSpct,
        quantity: item.soLuong,
      })),
      maGiamGia: null,
      phuongThucThanhToan: this.currentOrder.phuongThucThanhToan,
      ghiChu: null,
    };
    console.log('orderRequest before sending:', orderRequest);

    this.orderoffservice.createOrder(orderRequest).subscribe(
      (response) => {
        this.isLoading = false;
        this.orderId = response.orderId; // Lưu orderId từ response

        const orderData = {
          orderId: this.orderId,
          tenNguoiNhanHang: this.currentOrder.donHang.tenNguoiNhanHang,
          sdtNguoiNhan: this.currentOrder.donHang.sdtNguoiNhan,
          chiTietDonHangs: [...this.currentOrder.chiTietDonHangs],
          phuongThucThanhToan: this.currentOrder.phuongThucThanhToan === 'tm' ? 'Tiền mặt' : 'Chuyển khoản',
          total: this.totalBeforeDiscount,
          ngayTao: new Date().toLocaleString(),
        };

        const modalRef = this.modalService.open(HoadonOfComponent, { size: 'lg' });
        modalRef.componentInstance.orderData = orderData;

        let isPrinted = false;

        modalRef.result.then(
          (result) => {
            if (result === 'printed') {
              isPrinted = true;
              // In hóa đơn thành công -> Cập nhật trạng thái thành 4 (Hoàn tất)
              this.orderoffservice.updateOrderStatus(this.orderId!, {
                trangThai: 4,
                lyDoHuy: null,
              }).subscribe(
                (updateResponse) => {
                  this.isLoading = false;
                  console.log('Cập nhật trạng thái thành công:', updateResponse);
                  Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Đơn hàng thành công!',
                    timer: 1500,
                    showConfirmButton: false,
                  });

                  // Reset giỏ hàng
                  this.resetCurrentOrder();

                  // Thông báo cho màn hình "Hóa đơn" làm mới danh sách
                  this.orderStatusUpdated.emit();
                },
                (error) => {
                  this.isLoading = false;
                  console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
                  Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể cập nhật trạng thái đơn hàng. Vui lòng kiểm tra lại đơn hàng!',
                  });
                }
              );
            }
          },
          (reason) => {
            if (!isPrinted) {
              this.cancelOrder();
            }
          }
        );
      },
      (error) => {
        this.isLoading = false;
        console.error('Lỗi khi tạo đơn hàng:', error);
        let errorMessage = 'Không thể tạo đơn hàng. Vui lòng thử lại sau!';
        if (error.status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        } else if (error.status === 400) {
          errorMessage = error.error.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!';
        }
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: errorMessage,
        });
      }
    );
  }

  cancelOrder(): void {
    if (!this.orderId) {
      this.isLoading = false;
      this.resetCurrentOrder();
      return;
    }

    Swal.fire({
      title: 'Hủy đơn hàng',
      text: 'Vui lòng nhập lý do hủy đơn:',
      input: 'text',
      inputPlaceholder: 'Nhập lý do hủy...',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận hủy',
      cancelButtonText: 'Quay lại',
      preConfirm: (lyDoHuy) => {
        if (!lyDoHuy) {
          Swal.showValidationMessage('Lý do hủy không được để trống!');
        }
        return lyDoHuy;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderoffservice.updateOrderStatus(this.orderId!, {
          trangThai: 5,
          lyDoHuy: result.value,
        }).subscribe(
          (updateResponse) => {
            this.isLoading = false;
            console.log('Hủy đơn hàng thành công:', updateResponse);
            Swal.fire({
              icon: 'info',
              title: 'Đã hủy',
              text: 'Đơn hàng đã được hủy!',
              timer: 1500,
              showConfirmButton: false,
            });

            // Reset giỏ hàng
            this.resetCurrentOrder();

            // Thông báo cho màn hình "Hóa đơn" làm mới danh sách
            this.orderStatusUpdated.emit();
          },
          (error) => {
            this.isLoading = false;
            console.error('Lỗi khi hủy đơn hàng:', error);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: 'Không thể hủy đơn hàng. Vui lòng thử lại!',
            });
          }
        );
      } else {
        this.orderoffservice.updateOrderStatus(this.orderId!, {
          trangThai: 5,
          lyDoHuy: 'Người dùng đóng modal mà không in hóa đơn',
        }).subscribe(
          (updateResponse) => {
            this.isLoading = false;
            console.log('Hủy đơn hàng thành công:', updateResponse);
            Swal.fire({
              icon: 'info',
              title: 'Đã hủy',
              text: 'Đơn hàng đã được hủy!',
              timer: 1500,
              showConfirmButton: false,
            });

            // Reset giỏ hàng
            this.resetCurrentOrder();

            // Thông báo cho màn hình "Hóa đơn" làm mới danh sách
            this.orderStatusUpdated.emit();
          },
          (error) => {
            this.isLoading = false;
            console.error('Lỗi khi hủy đơn hàng:', error);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: 'Không thể hủy đơn hàng. Vui lòng thử lại!',
            });
          }
        );
      }
    });
  }

  resetCurrentOrder(): void {
    this.orders[this.currentOrderIndex] = {
      donHang: { tenNguoiNhanHang: '', sdtNguoiNhan: '' },
      chiTietDonHangs: [],
      phuongThucThanhToan: 'tm',
    };
    this.orderId = null;
    this.calculateTotal();
  }
}