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
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
declare const html2pdf: any;
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
      phuongThucThanhToan: 'tm',
      maGiamGia: null
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
  totalAfterDiscount: number | undefined; // Tổng tiền sau giảm giá
  discountCodeInput: string = ''; // Mã giảm giá người dùng nhập
  discountMessage: string | null = null; // Thông báo về trạng thái mã giảm giá
  discountAmount: number = 0; // Số tiền giảm
  private discountDetails: any = null; // Lưu thông tin chi tiết mã giảm giá

  orderStatusUpdated = new EventEmitter<void>();

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  constructor(
    private orderoffservice: OrderOffService,
    private tokenService: TokenService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
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
      phuongThucThanhToan: 'tm',
      maGiamGia: null
    });
    this.currentOrderIndex = this.orders.length - 1;
    this.calculateTotal();
  }

  switchOrder(index: number): void {
    this.currentOrderIndex = index;
    this.calculateTotal();
    this.reapplyDiscountIfExists(); // Áp dụng lại mã giảm giá nếu có
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
    this.reapplyDiscountIfExists(); // Áp dụng lại mã giảm giá nếu có
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
    this.reapplyDiscountIfExists(); // Tự động áp dụng lại mã giảm giá nếu có
    this.closeQuantityModal();
  }

  increaseQuantity(index: number): void {
    this.currentOrder.chiTietDonHangs[index].soLuong++;
    this.currentOrder.chiTietDonHangs[index].thanhTien =
      this.currentOrder.chiTietDonHangs[index].donGia * this.currentOrder.chiTietDonHangs[index].soLuong;
    this.calculateTotal();
    this.reapplyDiscountIfExists(); // Tự động áp dụng lại mã giảm giá nếu có
    this.cdr.detectChanges();
  }

  decreaseQuantity(index: number): void {
    if (this.currentOrder.chiTietDonHangs[index].soLuong > 1) {
      this.currentOrder.chiTietDonHangs[index].soLuong--;
      this.currentOrder.chiTietDonHangs[index].thanhTien =
        this.currentOrder.chiTietDonHangs[index].donGia * this.currentOrder.chiTietDonHangs[index].soLuong;
      this.calculateTotal();
      this.reapplyDiscountIfExists(); // Tự động áp dụng lại mã giảm giá nếu có
      this.cdr.detectChanges();
    }
  }

  removeProduct(index: number): void {
    this.currentOrder.chiTietDonHangs.splice(index, 1);
    this.calculateTotal();
    this.reapplyDiscountIfExists(); // Tự động áp dụng lại mã giảm giá nếu có
    this.cdr.detectChanges();
  }

  applyDiscountCode(): void {
    if (!this.discountCodeInput) {
      this.discountMessage = 'Vui lòng nhập mã giảm giá!';
      return;
    }

    if (this.totalBeforeDiscount <= 0) {
      this.discountMessage = 'Giỏ hàng trống, không thể áp dụng mã giảm giá!';
      return;
    }

    this.isLoading = true;
    this.discountMessage = null;

    this.orderoffservice.getDiscountCodeDetails(this.discountCodeInput).subscribe(
      (response) => {
        this.isLoading = false;
        console.log('Discount code details:', response);

        if (response.dieuKienapDung !== 0) {
          this.currentOrder.maGiamGia = null;
          this.discountDetails = null;
          this.totalAfterDiscount = undefined;
          this.discountAmount = 0;
          this.discountMessage = 'Mã giảm giá này chỉ áp dụng cho đơn hàng online!';
          this.cdr.detectChanges();
          return;
        }

        // Lưu thông tin mã giảm giá để tái sử dụng
        this.discountDetails = response;
        this.currentOrder.maGiamGia = this.discountCodeInput;

        // Tính toán số tiền giảm
        this.applyDiscountLogic(response);

        this.discountMessage = `Áp dụng mã giảm giá thành công! Số tiền giảm: ${this.discountAmount.toLocaleString()} VNĐ`;
        this.cdr.detectChanges();
      },
      (error) => {
        this.isLoading = false;
        this.currentOrder.maGiamGia = null;
        this.discountDetails = null;
        this.totalAfterDiscount = undefined;
        this.discountAmount = 0;
        this.discountMessage = 'Mã giảm giá không tồn tại hoặc không hợp lệ!';
        this.cdr.detectChanges();
        console.error('Error fetching discount code:', error);
      }
    );
  }

  private applyDiscountLogic(response: any): void {
    // Tính toán số tiền giảm (mặc định là giảm theo phần trăm)
    let discountAmount = this.totalBeforeDiscount * response.giaTriGiam;
    console.log('Initial discountAmount:', discountAmount);

    // Kiểm tra giá trị giảm tối đa (nếu có)
    if (response.gia_tri_toi_da && discountAmount > response.gia_tri_toi_da) {
      discountAmount = response.gia_tri_toi_da;
      console.log('Adjusted discountAmount (max limit):', discountAmount);
    }

    // Đảm bảo số tiền giảm không vượt quá tổng tiền
    if (discountAmount > this.totalBeforeDiscount) {
      discountAmount = this.totalBeforeDiscount;
      console.log('Adjusted discountAmount (cannot exceed total):', discountAmount);
    }

    // Cập nhật số tiền giảm và tổng tiền sau giảm
    this.discountAmount = discountAmount;
    this.totalAfterDiscount = this.totalBeforeDiscount - discountAmount;
    console.log('Final discountAmount:', this.discountAmount);
    console.log('Total after discount:', this.totalAfterDiscount);
  }

  private reapplyDiscountIfExists(): void {
    if (this.currentOrder.maGiamGia && this.discountDetails) {
      // Nếu đã có mã giảm giá và thông tin mã giảm giá, tự động áp dụng lại
      this.applyDiscountLogic(this.discountDetails);
      this.discountMessage = `Áp dụng mã giảm giá thành công! Số tiền giảm: ${this.discountAmount.toLocaleString()} VNĐ`;
      this.cdr.detectChanges();
    } else {
      // Nếu không có mã giảm giá, reset các giá trị
      this.totalAfterDiscount = undefined;
      this.discountAmount = 0;
      this.discountMessage = null;
    }
  }

  validateOrder(): boolean {
   

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
    if (!userId || !userId.UserID || isNaN(userId.UserID) || userId.UserID <= 0) {
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'ID tài khoản không hợp lệ! Vui lòng đăng nhập lại.',
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
      maGiamGia: this.currentOrder.maGiamGia,
      phuongThucThanhToan: this.currentOrder.phuongThucThanhToan,
      ghiChu: null,
    };

    this.orderoffservice.createOrder(orderRequest).subscribe(
      (response) => {
        this.isLoading = false;
        this.orderId = response.orderId;
        this.totalAfterDiscount = response.tongTien; // Cập nhật lại tổng tiền từ back-end

        const orderData = {
          orderId: this.orderId,
          tenNguoiNhanHang: this.currentOrder.donHang.tenNguoiNhanHang,
          sdtNguoiNhan: this.currentOrder.donHang.sdtNguoiNhan,
          chiTietDonHangs: [...this.currentOrder.chiTietDonHangs],
          phuongThucThanhToan: this.currentOrder.phuongThucThanhToan === 'tm' ? 'Tiền mặt' : 'Chuyển khoản',
          total: this.totalAfterDiscount,
          ngayTao: new Date().toLocaleString(),
        };

        // Tạo và in hóa đơn PDF tự động
        this.generatePDF(orderData);

        // Cập nhật trạng thái đơn hàng thành công (trạng thái 4)
        this.orderoffservice.updateOrderStatus(this.orderId!, {
          trangThai: 4,
          lyDoHuy: null,
        }).subscribe(
          (updateResponse) => {
            console.log('Cập nhật trạng thái thành công:', updateResponse);
            Swal.fire({
              icon: 'success',
              title: 'Thành công',
              text: 'Đơn hàng thành công và hóa đơn đã được in!',
              timer: 1500,
              showConfirmButton: false,
            });

            this.resetCurrentOrder();
            this.orderStatusUpdated.emit();
          },
          (error) => {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: 'Không thể cập nhật trạng thái đơn hàng!',
            });
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
          errorMessage = error.error.message || 'Dữ liệu không hợp lệ!';
        }
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: errorMessage,
        });
      }
    );
  }

  // Phương thức mới để tạo và tải PDF

  
  private async generatePDF(orderData: any): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.error('jsPDF cannot run in SSR or Node environment');
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tạo PDF trong môi trường SSR!',
      });
      return;
    }

    const escapeHtml = (unsafe: string) => {
      if (!unsafe) return '';
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '210mm';
    container.style.padding = '10px';
    container.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(container);

    const chiTietDonHangs = orderData.chiTietDonHangs || [];
    const rows = chiTietDonHangs.map((item: any) => {
      const tenSanPham = escapeHtml(item.tenSanPham || 'Không xác định');
      const soLuong = item.soLuong || 0;
      const donGia = item.donGia ? item.donGia.toLocaleString() : '0';
      const thanhTien = item.thanhTien ? item.thanhTien.toLocaleString() : '0';

      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${tenSanPham}</td>
          <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${donGia} VNĐ</td>
          <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${soLuong}</td>
          <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${thanhTien} VNĐ</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <div style="font-size: 12px;">
        <div id="header-section">
          <h2 style="text-align: center; font-size: 18px; margin-bottom: 8px; color: red;">HÓA ĐƠN BÁN HÀNG</h2>
          <h3 style="text-align: center; font-size: 14px; margin-bottom: 15px;">Mã đơn hàng: #${this.formatOrderId(orderData)}</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div style="width: 45%;">
              <p style="font-size: 10px;"><strong>Nguồn gửi</strong></p>
              <p style="font-size: 10px;">TỪ: Scent</p>
              <p style="font-size: 10px;">SĐT: 0974671634</p>
              <p style="font-size: 10px;">Địa chỉ: 43 Phú Diễn, Nam Từ Liêm, Hà Nội</p>
            </div>
            <div style="width: 45%;">
              <p style="font-size: 10px;"><strong>Nguồn nhận</strong></p>
              <p style="font-size: 10px;">ĐẾN: ${escapeHtml(orderData.tenNguoiNhanHang || 'N/A')}</p>
              <p style="font-size: 10px;">SĐT: ${escapeHtml(orderData.sdtNguoiNhan || 'N/A')}</p>
              <p style="font-size: 10px;">Địa chỉ: Thôn 4, Phường Kim Mã, Quận Ba Đình, Hà Nội</p>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div style="width: 45%;">
              <p style="font-size: 10px;"><strong>Người đặt hàng</strong></p>
              <p style="font-size: 10px;">Họ tên: trungkien1711</p>
              <p style="font-size: 10px;">Email: kientpph42696@fpt.edu.vn</p>
            </div>
            <div style="width: 45%;">
              <p style="font-size: 10px;"><strong>Ngày đặt: ${escapeHtml(orderData.ngayTao || 'N/A')}</strong></p>
              <p style="font-size: 10px;"><strong>Phương thức thanh toán: ${escapeHtml(orderData.phuongThucThanhToan || 'N/A')}</strong></p>
              <p style="font-size: 10px;"><strong>Phương thức vận chuyển: Giao hàng nhanh</strong></p>
            </div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;" id="product-table">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">Sản phẩm</th>
              <th style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">Giá</th>
              <th style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">Số lượng</th>
              <th style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">Tổng</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="4" style="border: 1px solid #ddd; padding: 4px; text-align: center; font-size: 10px;">Không có sản phẩm</td></tr>'}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;" id="footer">
          <div style="width: 45%;">
            <p style="font-size: 10px;"><strong>Số tiền giảm: ${(this.totalBeforeDiscount - orderData.total) >= 0 ? (this.totalBeforeDiscount - orderData.total).toLocaleString() : '0'} VNĐ</strong></p>
            <p style="font-size: 10px;"><strong>Ngày ${new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong></p>
          </div>
          <div style="width: 45%; text-align: right;">
            <p style="font-size: 10px;"><strong>(Ký tên)</strong></p>
          </div>
        </div>

        <p style="font-size: 12px; font-weight: bold; text-align: right;" id="total">Tổng tiền: ${orderData.total ? orderData.total.toLocaleString() : '0'} VNĐ</p>
      </div>
    `;

    // Set the container HTML only once
    container.innerHTML = htmlContent;
    console.log('Container HTML before rendering:', container.innerHTML);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 5;
    let yPosition = margin;

    const addElementToPDF = async (element: HTMLElement, addNewPageIfNeeded: boolean = true) => {
      if (!element) {
        console.warn('Element is null or undefined, skipping rendering.');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: true,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const imgHeight = (canvas.height * (pageWidth - 2 * margin)) / canvas.width;

      if (yPosition + imgHeight > pageHeight - margin && addNewPageIfNeeded) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.addImage(imgData, 'JPEG', margin, yPosition, pageWidth - 2 * margin, imgHeight);
      yPosition += imgHeight + 5; // Reduced spacing between sections
    };

    try {
      // Select each section precisely using IDs
      const headerSection = container.querySelector('#header-section') as HTMLElement;
      const productTable = container.querySelector('#product-table') as HTMLElement;
      const footer = container.querySelector('#footer') as HTMLElement;
      const total = container.querySelector('#total') as HTMLElement;

      // Render each section only once
      if (headerSection) {
        console.log('Rendering header section...');
        await addElementToPDF(headerSection);
      } else {
        console.warn('Header section not found!');
      }

      if (productTable) {
        console.log('Rendering product table...');
        await addElementToPDF(productTable);
      } else {
        console.warn('Product table not found!');
      }

      if (footer) {
        console.log('Rendering footer...');
        await addElementToPDF(footer);
      } else {
        console.warn('Footer not found!');
      }

      if (total) {
        console.log('Rendering total...');
        await addElementToPDF(total, false);
      } else {
        console.warn('Total not found!');
      }

      pdf.save(`hoadon_${orderData.orderId || 'unknown'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tạo PDF. Vui lòng thử lại!',
      });
    } finally {
      document.body.removeChild(container);
    }
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

            this.resetCurrentOrder();
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

            this.resetCurrentOrder();
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
// Trong OfflineOrderComponent
private formatOrderId(orderData: any): string {
  // Lấy ngày tạo từ orderData.ngayTao
  const date = new Date(orderData.ngayTao);
  
  // Định dạng ngày thành YYYYMMDD
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Thêm số 0 nếu tháng < 10
  const day = date.getDate().toString().padStart(2, '0'); // Thêm số 0 nếu ngày < 10
  const dateString = `${year}${month}${day}`;
  
  // Đảm bảo orderId có ít nhất 4 chữ số (pad với số 0 nếu cần)
  const paddedId = orderData.orderId.toString().padStart(4, '0');
  
  // Kết hợp ngày và orderId
  return `${dateString}${paddedId}`;
}
  resetCurrentOrder(): void {
    this.orders[this.currentOrderIndex] = {
      donHang: { tenNguoiNhanHang: '', sdtNguoiNhan: '' },
      chiTietDonHangs: [],
      phuongThucThanhToan: 'tm',
      maGiamGia: null
    };
    this.discountCodeInput = '';
    this.discountMessage = null;
    this.totalAfterDiscount = undefined;
    this.discountAmount = 0;
    this.discountDetails = null;
    this.calculateTotal();
    this.cdr.detectChanges();
  }
}