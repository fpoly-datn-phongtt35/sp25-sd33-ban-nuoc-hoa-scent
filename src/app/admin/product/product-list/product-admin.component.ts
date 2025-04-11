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
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.userRole = this.tokenService.getRole();
    console.log('Vai trò trong ProductAdminComponent:', this.userRole);
    this.loadProducts();
  }

  // Helper method to get concatenated notes for huongDau, huongGiua, huongCuoi
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

  loadProducts() {
    console.log('📌 Gọi API với:', this.page, this.size);
    this.sanPhamService.getSanPhamDetailonAdmin(this.searchTerm, this.page, this.size).subscribe({
      next: (response) => {
        // Preprocess the products to add huongDauString, huongGiuaString, and huongCuoiString
        this.products = (response.content || []).map(product => ({
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

  openUpdateProductModal(productId: number) {
    const modalRef = this.modalService.open(UpdateProductComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.productId = productId;
    modalRef.componentInstance.productUpdate.subscribe(() => {
      this.loadProducts();
    });
  }

  deleteProduct(id: number) {
    alert('Chưa làm nha\n idSP:' + id);
  }

  onSearch(): void {
    console.log('Tìm kiếm với từ khóa:', this.searchTerm);
    this.page = 0;
    this.loadProducts();
  }

  onRowClick(id: number) {
    console.log(`🔎 Chọn sản phẩm ID: ${id}`);
    this.selectedProductId = id;
  }

  closeProductDetail() {
    this.selectedProductId = null;
    console.log("🔄 Đã đóng chi tiết sản phẩm.");
  }

  openAddModal() {
    const modalRef = this.modalService.open(AddProductComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.productAdd.subscribe((newproduct: any) => {
      console.log('🎉 Sản phẩm mới:', newproduct);
      // Preprocess the new product to add the string properties
      const processedProduct = {
        ...newproduct,
        huongDauString: this.getNotesString(newproduct.huongDau),
        huongGiuaString: this.getNotesString(newproduct.huongGiua),
        huongCuoiString: this.getNotesString(newproduct.huongCuoi)
      };
      this.products.unshift(processedProduct);
      this.loadProducts();
    });
  }

  goToPage(p: number) {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
      this.page = p;
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadProducts();
    }
  }

  nextPage() {
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
