  import { SpctComponent } from './../spct/spct.component';
  import { Product } from './../../entity/product';
  import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
  import { Component } from '@angular/core';
  import { SpctService } from '../../service/spct.service';
  import { SanPhamService } from '../../service/product.service';
  import { ReactiveFormsModule,FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
  import { CommonModule } from '@angular/common';
  import { Router } from '@angular/router';

  @Component({
    selector: 'app-product-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SpctComponent // ✅ Đảm bảo đã import SpctComponent vào đây
  ],
  templateUrl: './product-admin.component.html',
  styleUrls: ['./product-admin.component.scss'],
      providers: [NgbActiveModal]
  })
  export class ProductAdminComponent {
    products: any[] = [];
    searchQuery: string = '';
    selectedCategory: string = '';
    minPrice: number = 0;
    maxPrice: number = 10000000;
    page: number = 0; // Trang hiện tại
    size: number = 5; // Số bản ghi mỗi trang
    totalPages: number = 20; // Tổng số trang
    constructor(private sanPhamService: SanPhamService, private router: Router) {}


    ngOnInit(): void {
      this.loadProducts();
    }

    loadProducts() {
      console.log('📌 Gọi API với:', this.page, this.size);
      this.sanPhamService.getSanPhamDetails(this.page, this.size).subscribe({
        next: (response) => {
          console.log('✅ API response:', response);
          this.products = response.content || [];
          this.totalPages = response.page?.totalPages || 1; // Nếu totalPages bị null, đặt mặc định là 1
        },
        error: (error) => {
          console.error('❌ Lỗi khi lấy dữ liệu sản phẩm:', error);
        }
      });
    }

    openUpdateProductModal(product:any){
      alert('Chưa làm nha\n Product:'+product);
    }
    deleteProduct(id:number){
      alert('Chưa làm nha\n idSP:'+id);
    }
    // viewProduct(id:number){
    //   alert('Chưa làm nha\n idSP:'+id);
    // }
  // 🔄 Phân trang
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

  // 🔢 Cập nhật cách lấy danh sách số trang hiển thị
  getPaginationRange(): number[] {
    let range: number[] = [];
    let start = Math.max(0, this.page - 2);
    let end = Math.min(this.totalPages, this.page + 3);

    for (let i = start; i < end; i++) {
      range.push(i);
    }

    console.log('📌 Pagination range:', range); // Debug
    return range;
  }
  selectedProductId: number | null = null; // Lưu ID sản phẩm được chọn

  onRowClick(id: number) {
    console.log(`🔎 Chọn sản phẩm ID: ${id}`);
    this.selectedProductId = id; // ✅ Cập nhật sản phẩm đang chọn
  }

  closeProductDetail() {
    this.selectedProductId = null; // ✅ Đóng chi tiết sản phẩm
    console.log("🔄 Đã đóng chi tiết sản phẩm.");
  }



  }

