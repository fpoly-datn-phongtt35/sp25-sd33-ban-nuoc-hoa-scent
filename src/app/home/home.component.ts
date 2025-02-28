import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SanPhamService } from '../service/product.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule,FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'], // Sửa từ styleUrl thành styleUrls
})
export class HomeComponent implements OnInit {
  sanPhams: any[] = [];
  currentPage: number = 1; // Trang hiện tại (1-based index)
  totalPages: number = 0; // Tổng số trang
  pageSize: number = 12; // Số sản phẩm mỗi trang
  visiblePages: number[] = []; // Các trang hiển thị
  query: string = '';
  results: any[] = [];
  constructor(private sanPhamService: SanPhamService,private router: Router) {}

  ngOnInit(): void {
    this.fetchSanPhamDetails();
    
  }

  // Lấy danh sách sản phẩm từ API
  fetchSanPhamDetails(): void {
    this.sanPhamService.getSanPhamDetails(this.currentPage - 1, this.pageSize).subscribe(
      (data: any) => {
        console.log('API Response:', data); // Kiểm tra dữ liệu trả về từ API
        this.sanPhams = data.content;
        this.totalPages = data.totalPages;
        this.updateVisiblePages();
      },
      (error: any) => {
        console.error('Lỗi khi gọi API:', error);
      }
    );
  }
  

  // Chuyển đến trang mới
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Kiểm tra nếu có truy vấn tìm kiếm, sử dụng nó để tải kết quả
      if (this.query) {
        this.loadSearchResults();  // Tải kết quả tìm kiếm với trang hiện tại và kích thước trang
      } else {
        this.fetchSanPhamDetails();  // Tải lại toàn bộ sản phẩm nếu không có truy vấn tìm kiếm
      }
    }
  }
  
 
  
  // Cập nhật các trang hiển thị
  updateVisiblePages(): void {
    const pagesToShow = 5; // Hiển thị tối đa 5 trang
    const startPage = Math.max(1, this.currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(this.totalPages, startPage + pagesToShow - 1);

    this.visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  viewProductDetail(productId: number): void {
    if (productId) {
      this.router.navigate([`/detail/${productId}`]); // Đảm bảo `productId` hợp lệ
    } else {
      console.error('Product ID is invalid:', productId); // Log lỗi nếu `productId` không hợp lệ
    }
  }
  
  onSearch(): void {
    if (this.query.trim()) {
      this.currentPage = 1; // Reset to the first page for new search
      this.loadSearchResults(); // Call to load search results based on the query
    } else {
      this.fetchSanPhamDetails(); // Fetch all products when there is no query
    }
  }
  
  loadSearchResults(): void {
    this.sanPhamService.searchProducts(this.query.trim(), this.currentPage - 1, this.pageSize).subscribe({
      next: (data: any) => {
        console.log('text:',data);
        this.sanPhams = data.content;
        this.totalPages = data.totalPages;
        this.updateVisiblePages();
      },
      error: (error: any) => {
        console.error('Search error:', error);
        this.sanPhams = [];
      },
      complete: () => console.log('Search completed')
    });
  }
  
  
  
}
