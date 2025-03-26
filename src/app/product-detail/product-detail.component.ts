import { Component, OnInit } from '@angular/core';

import { DetailService } from '../service/detail_product';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { CartService } from '../service/cart.Service';
import { SanPhamService } from '../service/product.service';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../Guard/authguard';
import { TokenService } from '../service/token.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, CommonModule,FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'], // Sửa từ `styleUrl` thành `styleUrls`
})
export class ProductDetailComponent implements OnInit {
  product: any; // Giả sử đây là đối tượng sản phẩm hiện tại
  recommendedProducts: any[] | undefined; // Danh sách các sản phẩm liên quan
  selectedVolume: any;
  volumes: any[] = [];
  quantity: number = 1;
  isLoading = true;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private detailService: DetailService,
    private cartService: CartService,
    private sanPhamService: SanPhamService,private tokenService:TokenService
  ) {}

  ngOnInit(): void {
    this.loadProductDetail();
    this.loadRecommendedProducts();
    this.loadVolumes();


  }

  loadProductDetail(): void {
    const productId = this.route.snapshot.paramMap.get('id');

    if (productId) {
      const numericProductId = parseInt(productId, 10);

      // Ensure numericProductId is a valid number
      if (!isNaN(numericProductId)) {
        // Load product volumes first
        this.sanPhamService.getProductVolumes(numericProductId).subscribe((volumes: any[]) => {
          this.volumes = volumes;
          // Check and assign the first volume as selected
          if (volumes && volumes.length > 0) {
            this.selectedVolume = volumes[0];
          }
        });

        // Then load the product details
        this.detailService.getProductDetailById(numericProductId).subscribe({
          next: (data: any) => {
            console.log('Dữ liệu API trả về:', data); // Debug API
            if (data && data.length > 0) {
              this.product = { ...data[0] }; // ✅ Chỉ lấy phần tử đầu tiên của mảng
              console.log('Sản phẩm được gán:', this.product);
              console.log('Tên sản phẩm:', this.product.tenSanPham);
              console.log('Giá sản phẩm:', this.product.donGia);

              console.log('ML sản phẩm:', this.product.dungTich);

            } else {
              console.error('Không tìm thấy sản phẩm');
              alert('Không tìm thấy sản phẩm');
            }
            this.isLoading = false;
          },
          error: (err: any) => {
            this.isLoading = false;
            console.error('Lỗi khi tải sản phẩm:', err);
            alert('Lỗi khi tải sản phẩm');
          }
        });
      } else {
        console.error('Invalid product ID');
        alert('Invalid product ID');
      }
    } else {
      console.error('Product ID is missing');
      alert('Product ID is missing');
    }
  }

  updateDisplayedPrice(): void {
    // Sự kiện này được kích hoạt khi người dùng thay đổi lựa chọn dung tích
    // Giả sử rằng dung tích đã bao gồm thông tin giá
    if (this.selectedVolume) {
      console.log(`Đã cập nhật giá: ${this.selectedVolume.gia} VND cho dung tích ${this.selectedVolume.dungTich}ml`);
    }
  }
  selectVolume(volume: any): void {
    console.log("🔍 Kiểm tra volume:", volume);
  this.selectedVolume = volume; // Set the selected volume
  this.product.dungTich = volume.dungTich;
  this.product.donGia = volume.donGia; // Update the product price based on selected volume
  this.product.idSpct=volume.idSpct;
  this.product.soLuongTonKho=volume.soLuongTonKho;
  console.log(`Giá được cập nhật là: ${this.product.donGia} VND cho dung tích ${this.selectedVolume.dungTich}ml với idSpct mới : ${this.product.idSpct}`);
}


  loadVolumes() {
    // Ensure there is a productId available
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      const numericProductId = parseInt(productId, 10);

      // Ensure numericProductId is a valid number before making the call
      if (!isNaN(numericProductId)) {
        this.sanPhamService.getProductVolumes(numericProductId).subscribe(
          (volumes: any[]) => {
            this.volumes = volumes;
            // Optionally, set the default selected volume here
            this.selectedVolume = volumes.length > 0 ? volumes[0] : null;
          },
          (          error: any) => {
            console.error('Error fetching volumes:', error);
          }
        );
      } else {
        console.error('Invalid product ID');
      }
    } else {
      console.error('Product ID is missing');
    }
  }

  loadRecommendedProducts(): void {
    this.detailService.getRecommendedProducts().subscribe({
      next: (data: any[]) => this.recommendedProducts = data,
      error: (err: any) => console.error('Error loading recommended products:', err)
    });
  }

  addToCart(): void {
    const token = this.tokenService.getToken();
    if (!token || this.tokenService.isTokenExpired()) {
      Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          position: 'bottom-end',
          text: 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!',
      });
      // Chuyển hướng đến trang đăng nhập
      this.router.navigate(['/login']);
      return;
  }
  if (!this.selectedVolume) {
    Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn dung tích',
        position: 'bottom-end',
        text: 'Vui lòng chọn dung tích trước khi thêm vào giỏ hàng!',
    });
    return;
}

    console.log('🛒 Sản phẩm được thêm vào giỏ hàng:', this.product);

    if (!this.product || !this.product.idSanPham) {
        console.error("❌ Lỗi: Thông tin sản phẩm bị thiếu!", this.product);
        return;
    }
    if (this.quantity > this.product.soLuongTonKho) {
      Swal.fire({
        icon: 'error',
        title: 'Số lượng vượt quá tồn kho',
        position: 'bottom-end',
        text: `Số lượng bạn nhập vượt quá số lượng tồn kho (${this.product.soLuongTonKho})!`,
      });
      return; // Stop execution if quantity is too high
    }
    if (this.quantity < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Số lượng không hợp lệ',
        position: 'bottom-end',
        text: 'Số lượng phải lớn hơn 0!',
      });
      this.quantity = 1; // Đặt lại số lượng về 1 nếu người dùng nhập số lượng không hợp lệ
      return;
    }
    // Tạo bản sao của sản phẩm để tránh lỗi khi lưu vào giỏ hàng
    const productCopy = {
        ...this.product,
        dungTich: this.selectedVolume.dungTich,
        donGia: this.selectedVolume.donGia
    };

    this.cartService.addToCart(productCopy, this.quantity);
    Swal.fire({
      icon: 'success',
      title: 'Thêm vào giỏ hàng thành công',
      position: 'bottom-end',
      text: `✅ Đã thêm ${this.quantity} sản phẩm vào giỏ hàng!`,
  });
    this.quantity = 1;

}






  viewRelatedProduct(productId: number): void {
    this.router.navigate(['/product/detail', productId]);
  }
}
