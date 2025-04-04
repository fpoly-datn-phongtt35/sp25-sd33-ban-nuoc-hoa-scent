import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddProductComponent } from '../add-product/add-product.component';
import { UpdateProductComponent } from '../update-product/update-product.component';
import { SpctComponent } from '../product-detail/spct-list/spct.component';
import { SanPhamService } from '../../../service/product.service';
import { TokenService } from '../../../service/token.service'; // Import TokenService

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
  userRole: string | null = null; // Lưu vai trò người dùng
  products: any[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';
  minPrice: number = 0;
  maxPrice: number = 10000000;
  page: number = 0;
  size: number = 5;
  totalPages: number = 20;
  searchTerm: string = '';
  selectedProductId: number | null = null;

  constructor(
    private sanPhamService: SanPhamService,
    private router: Router,
    private modalService: NgbModal,
    private tokenService: TokenService // Inject TokenService
  ) {}

  ngOnInit(): void {
    this.userRole = this.tokenService.getRole(); // Lấy userRole từ TokenService
    console.log('Vai trò trong ProductAdminComponent:', this.userRole);
    this.loadProducts();
  }

  loadProducts() {
    console.log('📌 Gọi API với:', this.page, this.size);
    this.sanPhamService.getSanPhamDetailonAdmin(this.searchTerm, this.page, this.size).subscribe({
      next: (response) => {
        console.log('✅ API response:', response);
        this.products = response.content || [];
        this.totalPages = response.page?.totalPages || 1;
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

  goToPage(p: number) {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
      this.page = p;
      this.loadProducts();
    }
  }

  onSearch(): void {
    console.log('Tìm kiếm với từ khóa:', this.searchTerm);
    this.page = 0;
    this.loadProducts();
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
    let start = Math.max(0, this.page - 2);
    let end = Math.min(this.totalPages, this.page + 3);
    for (let i = start; i < end; i++) {
      range.push(i);
    }
    console.log('📌 Pagination range:', range);
    return range;
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
      this.loadProducts();
      this.products.unshift(newproduct);
    });
  }
}
