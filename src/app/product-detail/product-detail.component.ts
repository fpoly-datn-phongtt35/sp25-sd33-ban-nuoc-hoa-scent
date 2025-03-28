import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

import { DetailService } from '../service/detail_product';
import { CartService } from '../service/cart.Service';
import { SanPhamService } from '../service/product.service';
import { TokenService } from '../service/token.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  product: any;
  recommendedProducts: any[] = [];
  selectedVolume: any;
  imageUrls: string[] = [];
  volumes: any[] = [];
  quantity: number = 1;
  selectedImageIndex: number = 0;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private detailService: DetailService,
    private cartService: CartService,
    private sanPhamService: SanPhamService,
    private tokenService: TokenService
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
      if (!isNaN(numericProductId)) {
        this.sanPhamService.getProductVolumes(numericProductId).subscribe((volumes: any[]) => {
          this.volumes = volumes;
          if (volumes.length > 0) {
            this.selectedVolume = volumes[0];
          }
        });

        this.detailService.getProductDetailById(numericProductId).subscribe({
          next: (data: any) => {
            if (data && data.length > 0) {
              this.product = { ...data[0] };
              if (this.product.imageURL) {
                this.imageUrls = this.product.imageURL.split(',').map((url: string) => url.trim());
              }
              console.log('Sản phẩm:', this.product);
            } else {
              Swal.fire('Không tìm thấy sản phẩm', '', 'error');
            }
            this.isLoading = false;
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Lỗi khi tải sản phẩm:', err);
            Swal.fire('Lỗi khi tải sản phẩm', '', 'error');
          },
        });
      }
    }
  }

  loadVolumes(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      const numericProductId = parseInt(productId, 10);
      if (!isNaN(numericProductId)) {
        this.sanPhamService.getProductVolumes(numericProductId).subscribe({
          next: (volumes: any[]) => {
            this.volumes = volumes;
            this.selectedVolume = volumes.length > 0 ? volumes[0] : null;
          },
          error: (err) => console.error('Error fetching volumes:', err),
        });
      }
    }
  }

  loadRecommendedProducts(): void {
    this.detailService.getRecommendedProducts().subscribe({
      next: (data: any[]) => (this.recommendedProducts = data),
      error: (err) => console.error('Lỗi khi tải sản phẩm gợi ý:', err),
    });
  }

  scrollImages(direction: string): void {
    if (direction === 'up' && this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    } else if (direction === 'down' && this.selectedImageIndex < this.imageUrls.length - 1) {
      this.selectedImageIndex++;
    }
  }

  setMainImage(index: number): void {
    this.selectedImageIndex = index;
  }

  selectVolume(volume: any): void {
    this.selectedVolume = volume;
    this.product.dungTich = volume.dungTich;
    this.product.donGia = volume.donGia;
    this.product.idSpct = volume.idSpct;
    this.product.soLuongTonKho = volume.soLuongTonKho;

    console.log(`Giá cập nhật: ${this.product.donGia} VND cho ${this.selectedVolume.dungTich}ml`);
  }

  updateDisplayedPrice(): void {
    if (this.selectedVolume) {
      console.log(`Giá: ${this.selectedVolume.gia} cho dung tích ${this.selectedVolume.dungTich}ml`);
    }
  }

  addToCart(): void {
    const token = this.tokenService.getToken();
    if (!token || this.tokenService.isTokenExpired()) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!',
        position: 'bottom-end',
      });
      this.router.navigate(['/login']);
      return;
    }

    if (!this.selectedVolume) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn dung tích',
        text: 'Vui lòng chọn dung tích trước khi thêm vào giỏ hàng!',
        position: 'bottom-end',
      });
      return;
    }

    if (!this.product || !this.product.idSanPham) {
      console.error('❌ Lỗi: Thông tin sản phẩm bị thiếu!', this.product);
      return;
    }

    if (this.quantity > this.product.soLuongTonKho) {
      Swal.fire({
        icon: 'error',
        title: 'Số lượng vượt quá tồn kho',
        text: `Chỉ còn ${this.product.soLuongTonKho} sản phẩm!`,
        position: 'bottom-end',
      });
      return;
    }

    if (this.quantity < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Số lượng không hợp lệ',
        text: 'Số lượng phải lớn hơn 0!',
        position: 'bottom-end',
      });
      this.quantity = 1;
      return;
    }

    const productCopy = {
      ...this.product,
      dungTich: this.selectedVolume.dungTich,
      donGia: this.selectedVolume.donGia,
    };

    this.cartService.addToCart(productCopy, this.quantity);
    Swal.fire({
      icon: 'success',
      title: 'Đã thêm vào giỏ hàng',
      text: `✅ ${this.quantity} sản phẩm đã được thêm!`,
      position: 'bottom-end',
    });

    this.quantity = 1;
  }

  viewRelatedProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.router.navigate(['/product/detail', productId]).then(() => {
        this.loadProductDetail();
      });
    } else {
      console.error('Product ID is undefined');
    }
  }

  updateProductDetails(product: any): void {
    this.product = product;

    if (product.imageURL) {
      this.imageUrls = product.imageURL.split(',').map((url: string) => url.trim());
    }

    this.volumes = product.volumes?.length
      ? product.volumes
      : [{
          dungTich: product.dungTich,
          donGia: product.donGia,
          soLuongTonKho: product.soLuongTonKho,
        }];

    this.selectedVolume = this.volumes.length > 0 ? this.volumes[0] : null;
    console.log('Thông tin sản phẩm đã được cập nhật:', this.product);
  }


}

