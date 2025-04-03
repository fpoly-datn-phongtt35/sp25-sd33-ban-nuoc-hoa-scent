import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { OrderOffService } from '../../../service/offdonhang.Service';
import { TokenService } from '../../../service/token.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SpctComponent } from '../../product/product-detail/spct-list/spct.component';
import { CartService } from '../../../service/cart.Service';

@Component({
  selector: 'app-banhangoffline',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
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

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  constructor(
    private orderoffservice: OrderOffService,
    private tokenService: TokenService,private cartservice:CartService
  ) {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((keyword) => {
        this.searchProducts(keyword);
      });
  }

  ngOnInit(): void {
    this.searchProducts('');
    this.calculateTotal();
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
    this.totalBeforeDiscount = this.currentOrder.chiTietDonHangs.reduce(
      (total: number, item: any) => total + item.thanhTien,
      0
    );
  }

  confirmAddProduct(): void {
    if (this.selectedQuantity < 1) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Số lượng phải lớn hơn 0!',
      });
      return;
    }

    if (!this.selectedProduct.idSanPham) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'ID sản phẩm không hợp lệ!',
      });
      return;
    }

    const existingItem = this.currentOrder.chiTietDonHangs.find(
      (item: any) => item.idSanPham === this.selectedProduct.idSanPham
    );

    if (existingItem) {
      existingItem.soLuong += this.selectedQuantity;
      existingItem.thanhTien = existingItem.donGia * existingItem.soLuong;
    } else {
      this.currentOrder.chiTietDonHangs.push({
        idSanPham: this.selectedProduct.idSanPham,
        tenSanPham: this.selectedProduct.tenSanPham,
        donGia: this.selectedProduct.donGia,
        dungTich: this.selectedProduct.dungTich || 'N/A',
        urlImage: this.selectedProduct.urlImage,
        soLuong: this.selectedQuantity,
        thanhTien: this.selectedProduct.donGia * this.selectedQuantity
      });
    }

    this.calculateTotal();
    this.closeQuantityModal();

    Swal.fire({
      icon: 'success',
      title: 'Thành công',
      text: `Đã thêm ${this.selectedQuantity} sản phẩm ${this.selectedProduct.tenSanPham} vào giỏ hàng!`,
      timer: 1500,
      showConfirmButton: false
    });
  }

  increaseQuantity(index: number): void {
    this.currentOrder.chiTietDonHangs[index].soLuong++;
    this.currentOrder.chiTietDonHangs[index].thanhTien =
      this.currentOrder.chiTietDonHangs[index].donGia * this.currentOrder.chiTietDonHangs[index].soLuong;
    this.calculateTotal();
  }

  decreaseQuantity(index: number): void {
    if (this.currentOrder.chiTietDonHangs[index].soLuong > 1) {
      this.currentOrder.chiTietDonHangs[index].soLuong--;
      this.currentOrder.chiTietDonHangs[index].thanhTien =
        this.currentOrder.chiTietDonHangs[index].donGia * this.currentOrder.chiTietDonHangs[index].soLuong;
      this.calculateTotal();
    }
  }

  removeProduct(index: number): void {
    this.currentOrder.chiTietDonHangs.splice(index, 1);
    this.calculateTotal();
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

    // Kiểm tra idSanPham trong giỏ hàng
    const invalidItem = this.currentOrder.chiTietDonHangs.find((item: any) => !item.idSanPham);
    if (invalidItem) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: `Sản phẩm "${invalidItem.tenSanPham}" có ID không hợp lệ!`,
      });
      return false;
    }

    return true;
  }

  submitOrder(): void {
    // Validate trước khi tạo đơn hàng
    if (!this.validateOrder()) {
      return;
    }

    this.isLoading = true;

    // Chuẩn bị dữ liệu cho API
    const usserId = this.tokenService.getUserInfo();
    console.log('duuuuu',usserId)
    const orderRequest = {
      idTaiKhoan: usserId.UserID,
      tenNguoiNhanHang: this.currentOrder.donHang.tenNguoiNhanHang,
      sdtNguoiNhan: this.currentOrder.donHang.sdtNguoiNhan,
      chiTietDonHangs: this.currentOrder.chiTietDonHangs.map((item: any) => ({
        spctId: item.idSanPham,
        quantity: item.soLuong
      })),
      maGiamGia: null,
      phuongThucThanhToan: this.currentOrder.phuongThucThanhToan,
      ghiChu: null
    };
console.log('quang ddaanf',orderRequest)
    // Gọi API tạo đơn hàng
    this.orderoffservice.createOrder(orderRequest).subscribe(
      (response) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Đơn hàng đã được tạo thành công!',
          timer: 1500,
          showConfirmButton: false
        });

        // Reset đơn hàng hiện tại sau khi tạo thành công
        this.orders[this.currentOrderIndex] = {
          donHang: { tenNguoiNhanHang: '', sdtNguoiNhan: '' },
          chiTietDonHangs: [],
          phuongThucThanhToan: 'tm'
        };
        this.calculateTotal();
      },
      (error) => {
        this.isLoading = false;
        console.error('Error creating order:', error);
        let errorMessage = 'Không thể tạo đơn hàng. Vui lòng thử lại sau!';
        if (error.status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        } else if (error.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!';
        }
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: errorMessage,
        });
      }
    );
  }
}
