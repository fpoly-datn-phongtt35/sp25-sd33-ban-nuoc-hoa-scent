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
    SpctComponent,
    FormsModule
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

  private restorePageState(): void {
    console.log('🔄 Khôi phục trạng thái trang...');

    // Xóa lớp modal-open khỏi body
    document.body.classList.remove('modal-open');

    // Xóa tất cả backdrop còn sót lại
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      console.log('🗑️ Xóa backdrop:', backdrop);
      backdrop.remove();
    });

    // Xóa lớp show và phần tử modal khỏi DOM
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
      console.log('🗑️ Xóa modal:', modal);
      modal.classList.remove('show');
      modal.remove();
    });

    // Khôi phục trạng thái body
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';

    // Đặt lại trạng thái giao diện
    this.selectedProductId = null;
    this.refreshProductList();
    this.cdr.detectChanges();

    console.log('✅ Đã khôi phục trạng thái trang');
  }

  private refreshProductList(): void {
    this.loadProducts();
  }

  deleteProduct(id: number): void {
    alert('Chưa làm nha\n idSP:' + id);
  }

  onSearch(): void {
    console.log('Tìm kiếm với từ khóa:', this.searchTerm);
    this.page = 0;
    this.loadProducts();
  }

  onRowClick(id: number): void {
    console.log(`🔎 Chọn sản phẩm ID: ${id}`);
    this.selectedProductId = id;
  }

  closeProductDetail(): void {
    this.selectedProductId = null;
    console.log("🔄 Đã đóng chi tiết sản phẩm.");
    this.restorePageState();
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

  getPaginationRange(): number[] {
    let range: number[] = [];
    const maxPagesToShow = 5;
    let start = Math.max(0, this.page - Math.floor(maxPagesToShow / 2));
    let end = Math.min(this.totalPages, start + maxPagesToShow);

    if (end === this.totalPages) {
      start = Math.max(0, end - maxPagesToShow);
    }

    for (let i = start; i < end; i++) {
      range.push(i);
    }

    console.log('📌 Pagination range:', range);
    return range;
  }
}
