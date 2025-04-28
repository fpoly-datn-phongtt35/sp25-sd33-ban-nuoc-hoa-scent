import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface DefectiveProduct {
  idYeuCau: number;
  idSpct: number;
  tenSanPham: string;
  soLuong: number;
  tinhTrangHang: string;
  lyDoTraHang: string;
  tenThuongHieu: string;
  idThuongHieu: number;
  selected?: boolean;
}

interface CartItem extends DefectiveProduct {
  cartQuantity: number;
}

interface Page<T> {
  content: T[];
  pageable: {
    sort: any;
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: any;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

@Component({
  selector: 'app-tra-hang-nha-san-xuat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tra-hang-nha-san-xuat.component.html',
  styleUrls: ['./tra-hang-nha-san-xuat.component.scss']
})
export class TraHangNhaSanXuatComponent implements OnInit {
  defectiveProducts: DefectiveProduct[] = [];
  cart: CartItem[] = [];
  sendForm = {
    ghiChu: '',
    trangThaiGui: 0
  };
  selectedBrand: string | null = null;
  filterBrand: string | null = null;
  allBrands: string[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  page: number = 0;
  size: number = 16;
  totalPages: number = 1;
  totalElements: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllBrands();
    this.loadDefectiveProducts();
  }

  loadAllBrands(): void {
    this.http.get<Page<DefectiveProduct>>(`http://localhost:8080/api/tra-hang/defective-products`, {
      params: new HttpParams().set('page', '0').set('size', '1000')
    }).subscribe({
      next: (data) => {
        this.allBrands = [...new Set(data.content.map(product => product.tenThuongHieu))];
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách thương hiệu:', err);
      }
    });
  }

  loadDefectiveProducts(page: number = this.page, size: number = this.size): void {
    page = page ?? 0;
    size = size ?? 16;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (this.filterBrand) {
      params = params.set('brand', this.filterBrand);
    }

    this.isLoading = true;
    this.defectiveProducts = [];

    this.http.get<Page<DefectiveProduct>>(`http://localhost:8080/api/tra-hang/defective-products`, { params }).subscribe({
      next: (data) => {
        this.defectiveProducts = data.content.map(product => ({ ...product, selected: false }));
        this.page = data.number ?? 0;
        this.size = data.size ?? 16;
        this.totalPages = data.totalPages ?? 1;
        this.totalElements = data.totalElements ?? 0;
        this.isLoading = false;

        console.log('Defective Products after load:', this.defectiveProducts);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Lỗi khi tải danh sách sản phẩm lỗi: ' + err.message;
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: this.errorMessage,
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

  onFilterBrandChange(): void {
    this.page = 0;
    // Tự động đặt selectedBrand theo filterBrand
    this.selectedBrand = this.filterBrand || null;
    // Lọc lại giỏ hàng để chỉ giữ sản phẩm của thương hiệu đã lọc
    if (this.filterBrand) {
      this.cart = this.cart.filter(item => item.tenThuongHieu === this.filterBrand);
    }
    this.loadDefectiveProducts();
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      this.page = p;
      console.log('[TraHangNhaSanXuatComponent] Navigating to page:', this.page);
      this.loadDefectiveProducts();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      console.log('[TraHangNhaSanXuatComponent] Navigating to previous page:', this.page);
      this.loadDefectiveProducts();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      console.log('[TraHangNhaSanXuatComponent] Navigating to next page:', this.page);
      this.loadDefectiveProducts();
    }
  }

  getPaginationRange(): number[] {
    const range: number[] = [];
    const pagesToShow = 5;
    const start = Math.max(0, this.page - Math.floor(pagesToShow / 2));
    const end = Math.min(this.totalPages, start + pagesToShow);

    for (let i = start; i < end; i++) {
      range.push(i);
    }
    console.log('[TraHangNhaSanXuatComponent] Pagination range:', range);
    return range;
  }

  addToCart(product: DefectiveProduct): void {
    // Nếu đang lọc theo thương hiệu, chỉ cho phép thêm sản phẩm của thương hiệu đó
    if (this.filterBrand && product.tenThuongHieu !== this.filterBrand) {
      this.errorMessage = `Chỉ được thêm sản phẩm của thương hiệu ${this.filterBrand} khi đang lọc.`;
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: this.errorMessage,
        confirmButtonText: 'Đóng'
      });
      product.selected = false;
      return;
    }

    // Kiểm tra xem giỏ hàng đã có sản phẩm của thương hiệu khác chưa
    if (this.cart.length > 0) {
      const firstBrandInCart = this.cart[0].tenThuongHieu;
      if (product.tenThuongHieu !== firstBrandInCart) {
        this.errorMessage = `Giỏ hàng chỉ được chứa sản phẩm của một thương hiệu. Hiện tại giỏ hàng đang chứa sản phẩm của thương hiệu ${firstBrandInCart}.`;
        Swal.fire({
          icon: 'warning',
          title: 'Cảnh báo',
          text: this.errorMessage,
          confirmButtonText: 'Đóng'
        });
        product.selected = false;
        return;
      }
    }

    const existingItem = this.cart.find(item => item.idSpct === product.idSpct && item.idYeuCau === product.idYeuCau);
    if (existingItem) {
      if (existingItem.cartQuantity < product.soLuong) {
        existingItem.cartQuantity += 1;
      } else {
        this.errorMessage = `Số lượng tối đa cho ${product.tenSanPham} đã đạt.`;
        Swal.fire({
          icon: 'warning',
          title: 'Cảnh báo',
          text: this.errorMessage,
          confirmButtonText: 'Đóng'
        });
      }
    } else {
      this.cart.push({ ...product, cartQuantity: 1 });
    }
    product.selected = false;
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(cartItem => cartItem.idSpct !== item.idSpct || cartItem.idYeuCau !== item.idYeuCau);
  }

  updateCartQuantity(item: CartItem, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(item);
    } else if (quantity <= item.soLuong) {
      item.cartQuantity = quantity;
    } else {
      item.cartQuantity = item.soLuong;
      this.errorMessage = `Số lượng tối đa cho ${item.tenSanPham} là ${item.soLuong}.`;
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: this.errorMessage,
        confirmButtonText: 'Đóng'
      });
    }
  }

  getBrandsInCart(): string[] {
    // Nếu đang lọc theo thương hiệu, chỉ hiển thị thương hiệu đó trong dropdown "Chọn thương hiệu"
    if (this.filterBrand) {
      return [this.filterBrand];
    }
    return [...new Set(this.cart.map(item => item.tenThuongHieu))];
  }

  sendToManufacturer(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.selectedBrand) {
      this.errorMessage = 'Vui lòng chọn một thương hiệu để gửi.';
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: this.errorMessage,
        confirmButtonText: 'Đóng'
      });
      return;
    }

    const itemsToSend = this.cart.filter(item => item.tenThuongHieu === this.selectedBrand);
    if (itemsToSend.length === 0) {
      this.errorMessage = `Không có sản phẩm nào của thương hiệu ${this.selectedBrand} trong giỏ hàng.`;
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: this.errorMessage,
        confirmButtonText: 'Đóng'
      });
      return;
    }

    const requests = itemsToSend.map(item => ({
      idYeuCau: item.idYeuCau,
      idSpct: item.idSpct,
      soLuongGui: item.cartQuantity,
      idThuongHieu: item.idThuongHieu,
      ghiChu: this.sendForm.ghiChu
    }));

    this.isLoading = true;
    Swal.fire({
      title: 'Đang gửi...',
      text: 'Vui lòng đợi trong khi yêu cầu được xử lý.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post<any>(`http://localhost:8080/api/tra-hang/send-to-manufacturer`, requests).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = typeof response === 'string'
          ? response
          : (response?.message || 'Gửi yêu cầu trả hàng thành công!');
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: this.successMessage,
          confirmButtonText: 'Đóng'
        });
        this.cart = this.cart.filter(item => item.tenThuongHieu !== this.selectedBrand);
        this.selectedBrand = null;
        this.sendForm.ghiChu = '';
        this.loadDefectiveProducts();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Lỗi từ backend:', err);
        const errorMessage = err.error && typeof err.error === 'object' ? JSON.stringify(err.error) : (err.error || err.message);
        this.errorMessage = 'Lỗi khi gửi sản phẩm: ' + errorMessage;
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: this.errorMessage,
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

  resetCart(): void {
    this.cart = [];
    this.selectedBrand = null;
    this.sendForm.ghiChu = '';
    this.defectiveProducts.forEach(product => (product.selected = false));
  }
}