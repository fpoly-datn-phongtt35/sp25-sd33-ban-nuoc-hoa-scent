import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddProductComponent } from '../add-product/add-product.component';
import { UpdateProductComponent } from '../update-product/update-product.component';
import { SpctComponent } from '../product-detail/spct-list/spct.component';
import { SanPhamService } from '../../../service/product.service';
import { TokenService } from '../../../service/token.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-product-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SpctComponent // Ensure this is included
  ],
  templateUrl: './product-admin.component.html',
  styleUrls: ['./product-admin.component.scss'],
  providers: [NgbActiveModal]
})
export class ProductAdminComponent implements OnInit {
  userRole: string | null = null;
  products: any[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';
  minPrice: number = 0;
  maxPrice: number = 10000000;
  page: number = 0;
  size: number = 5;
  totalPages: number = 0;
  searchTerm: string = '';
  selectedProductId: number | null = null;
  selectedProduct: any = null;

  constructor(
    private sanPhamService: SanPhamService,
    private router: Router,
    private modalService: NgbModal,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userRole = this.tokenService.getRole();
    console.log('Vai trò trong ProductAdminComponent:', this.userRole);
    this.loadProducts();
  }

  getNotesString(notes: any[]): string {
    if (!notes || !Array.isArray(notes)) {
      return 'Không xác định';
    }
    return notes.map(note => note.tenNotHuong).join(', ') || 'Không xác định';
  }

  getPhongCachString(phongCach: any[]): string {
    if (!phongCach || !Array.isArray(phongCach)) {
      return 'Không có phong cách';
    }
    return phongCach.map(style => style.tenPhongCach).join(', ');
  }

  loadProducts(): void {
    console.log('📌 Gọi API với:', this.page, this.size);
    this.sanPhamService.getSanPhamDetailonAdmin(this.searchTerm, this.page, this.size).subscribe({
      next: (response) => {
        this.products = (response.content || []).map((product: any) => ({
          ...product,
          huongDauString: this.getNotesString(product.huongDau),
          huongGiuaString: this.getNotesString(product.huongGiua),
          huongCuoiString: this.getNotesString(product.huongCuoi)
        }));
        this.totalPages = response.page?.totalPages || 1;
        console.log('✅ Sản phẩm response:', response);
      },
      error: (error) => {
        console.error('❌ Lỗi khi lấy dữ liệu sản phẩm:', error);
      }
    });
  }

  formatScent(huongDau: string, huongGiua: string, huongCuoi: string): string {
    const parts = [
      huongDau || 'N/A',
      huongGiua || 'N/A',
      huongCuoi || 'N/A'
    ].filter(part => part !== 'N/A');
    return parts.join(' / ') || 'Không xác định';
  }

  getMuiChonString(selections: any[]): string {
    if (!selections?.length) return 'Không xác định';
    return selections
      .map(scent => `${scent.tenMuiHuong || 'N/A'} (${scent.prominenceLevel || 0})`)
      .join(', ');
  }

  getMuiHuongTitle(product: any): string {
    return `Đầu: ${product.huongDauString}\nGiữa: ${product.huongGiuaString}\nCuối: ${product.huongCuoiString}`;
  }

  getMuiChonTitle(muiHuongSelections: any[]): string {
    return muiHuongSelections?.map(scent => `${scent.tenMuiHuong} (${scent.prominenceLevel})`).join(', ') || '';
  }

  openAddModal(): void {
    const modalRef = this.modalService.open(AddProductComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.productAdd.subscribe((newProduct: any) => {
      console.log('Sản phẩm mới:', newProduct);
      this.refreshProductList();
    });

    modalRef.result
      .then(
        (result) => {
          console.log('Modal đóng với kết quả:', result);
          this.restorePageState();
        },
        (reason) => {
          console.log('Modal bị hủy với lý do:', reason);
          this.restorePageState();
        }
      )
      .catch((error) => {
        console.error('Lỗi khi đóng modal:', error);
        this.restorePageState();
      });
  }

  openUpdateProductModal(productId: number): void {
    const modalRef = this.modalService.open(UpdateProductComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.productId = productId;

    modalRef.componentInstance.productUpdate.subscribe((updatedProduct: any) => {
      console.log('Sản phẩm cập nhật:', updatedProduct);
      this.refreshProductList();
    });

    modalRef.result
      .then(
        (result) => {
          console.log('Modal đóng với kết quả:', result);
          this.restorePageState();
        },
        (reason) => {
          console.log('Modal bị hủy với lý do:', reason);
          this.restorePageState();
        }
      )
      .catch((error) => {
        console.error('Lỗi khi đóng modal:', error);
        this.restorePageState();
      });
  }

  toggleProductStatus(id: number, currentTrangThai: number): void {
    const action = currentTrangThai === 1 ? 'ngưng bán' : 'tiếp tục bán';
    const confirmed = window.confirm(`Bạn có chắc muốn ${action} sản phẩm này không?`);
    if (confirmed) {
      const newTrangThai = currentTrangThai === 1 ? 0 : 1;
      this.sanPhamService.updateSanPhamTrangThai(id, newTrangThai).subscribe({
        next: (response) => {
          console.log('✅ Cập nhật trạng thái SanPham:', response);
          this.loadProducts();
        },
        error: (error) => {
          console.error('❌ Lỗi khi cập nhật trạng thái:', error);
          alert('Cập nhật trạng thái thất bại!');
        }
      });
    }
  }

  viewProductDetails(product: any): void {
    this.selectedProductId = product.idSanPham;
    this.selectedProduct = product;
    console.log(`🔎 Đang xem chi tiết sản phẩm ID: ${this.selectedProductId}`);
  }

  closeProductDetail(): void {
    this.selectedProductId = null;
    this.selectedProduct = null;
    console.log("🔄 Đã đóng chi tiết sản phẩm.");
    this.restorePageState();
  }

  private restorePageState(): void {
    console.log('🔄 Khôi phục trạng thái trang...');
    document.body.classList.remove('modal-open');
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      console.log('🗑️ Xóa backdrop:', backdrop);
      backdrop.remove();
    });
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
      console.log('🗑️ Xóa modal:', modal);
      modal.classList.remove('show');
      modal.remove();
    });
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';
    this.selectedProductId = null;
    this.selectedProduct = null;
    this.refreshProductList();
    this.cdr.detectChanges();
    console.log('✅ Đã khôi phục trạng thái trang');
  }

  private refreshProductList(): void {
    this.loadProducts();
  }

  onSearch(): void {
    console.log('Tìm kiếm với từ khóa:', this.searchTerm);
    this.page = 0;
    this.loadProducts();
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
      this.page = p;
      this.loadProducts();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadProducts();
    }
  }

  getPaginationRange(): { page: number, isEllipsis: boolean }[] {
    const range: { page: number, isEllipsis: boolean }[] = [];
    const maxVisiblePages = 3;

    if (this.totalPages <= 5) {
      for (let i = 0; i < this.totalPages; i++) {
        range.push({ page: i, isEllipsis: false });
      }
    } else {
      range.push({ page: 0, isEllipsis: false });

      let start = Math.max(1, this.page - 1);
      let end = Math.min(this.totalPages - 2, this.page + 1);

      if (end - start + 1 < maxVisiblePages) {
        if (start === 1) {
          end = Math.min(start + maxVisiblePages - 1, this.totalPages - 2);
        } else if (end === this.totalPages - 2) {
          start = Math.max(1, end - maxVisiblePages + 1);
        }
      }

      if (start > 1) {
        range.push({ page: -1, isEllipsis: true });
      }

      for (let i = start; i <= end; i++) {
        range.push({ page: i, isEllipsis: false });
      }

      if (end < this.totalPages - 2) {
        range.push({ page: -1, isEllipsis: true });
      }

      range.push({ page: this.totalPages - 1, isEllipsis: false });
    }

    console.log('📌 Pagination range:', range);
    return range;
  }
}
