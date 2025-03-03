import { Component } from '@angular/core';
import { SpctService } from '../../service/spct.service';
import { SanPhamService } from '../../service/product.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-product-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-admin.component.html',
  styleUrl: './product-admin.component.scss'
})
export class ProductAdminComponent {
  products: any[] = [];
  categories: any[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';
  minPrice: number = 0;
  maxPrice: number = 10000000;
  currentPage: number = 0;
  pageSize: number = 30;
  totalPages: number = 0;
  constructor(private sanPhamService: SanPhamService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.sanPhamService.getSanPhamDetails(this.currentPage, this.pageSize).subscribe(
      (data) => {
        this.products = data.content;
        this.totalPages = data.totalPages; // Đảm bảo API trả về totalPages
        console.log(this.totalPages);
      },
      (error) => {
        console.error('Lỗi khi tải danh sách sản phẩm:', error);
      }
    );
  }


  loadCategories(): void {
    this.sanPhamService.getCategories().subscribe(
      (data) => {
        this.categories = data;
      },
      (error) => {
        console.error('Lỗi khi tải danh mục:', error);
      }
    );
  }
  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      console.log(page);
      this.loadProducts(); // Gọi lại API để cập nhật sản phẩm
    }
  }
  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}
