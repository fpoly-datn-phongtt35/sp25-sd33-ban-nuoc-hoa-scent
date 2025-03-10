import { Component,ChangeDetectorRef } from '@angular/core';

import { FormsModule } from '@angular/forms';  // 🔥 Đảm bảo import FormsModule
import { CommonModule } from '@angular/common';
import { OrderService } from '../service/order.service';
import { CartService } from '../service/cart.Service';
import { Router } from '@angular/router';
import { TokenService } from '../service/token.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

interface OrderDetail {
  spctId: number;
  quantity: number;
}

interface Order {
  idTaiKhoan: number;
  tenNguoiNhanHang: string;
  diaChiGiaoHang: string;
  sdtNguoiNhan: string;
  phuongThucThanhToan: string;
  chiTietDonHangs: OrderDetail[];
}

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [FormsModule, CommonModule,HeaderComponent, FooterComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent {
  orderData: Order = {
    idTaiKhoan: 0,
    tenNguoiNhanHang: '',
    diaChiGiaoHang: '',
    sdtNguoiNhan: '',
    phuongThucThanhToan: '',
    chiTietDonHangs: []
  };

  selectedProducts: any[] = []; // Danh sách sản phẩm để hiển thị

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Lấy ID tài khoản từ TokenService hoặc localStorage
    const idTaiKhoan = this.tokenService.getUserId() || Number(localStorage.getItem('idTaiKhoan'));
    
    if (!idTaiKhoan) {
      console.error("❌ LỖI: Không tìm thấy ID tài khoản!");
      return;
    }

    this.orderData.idTaiKhoan = idTaiKhoan;

    // Lấy sản phẩm đã chọn từ localStorage
    const storedSelectedProducts = localStorage.getItem('selectedProducts');
    if (storedSelectedProducts) {
      const selectedProducts = JSON.parse(storedSelectedProducts);

      // Tạo dữ liệu gửi đi (đúng format Postman)
      this.orderData.chiTietDonHangs = selectedProducts.map((item: any) => ({
        spctId: item.product.idSpct, // Gửi đúng Postman
        quantity: item.quantity
      }));

      // Lưu danh sách sản phẩm để hiển thị
      this.selectedProducts = selectedProducts.map((item: any) => ({
        tenSanPham: item.product.tenSanPham,
        quantity: item.quantity,
        volume: item.volume,
        donGia: item.product.donGia,
        imageUrl:item.product.imageURL
      }));
    }
  }

  onSubmit(): void {
    // Kiểm tra nếu thiếu dữ liệu thì báo lỗi ngay trên UI (tránh gửi request sai)
    if (!this.orderData.tenNguoiNhanHang || !this.orderData.diaChiGiaoHang || !this.orderData.sdtNguoiNhan || !this.orderData.phuongThucThanhToan) {
      console.error("❌ Lỗi: Thiếu thông tin giao hàng!");
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }
    const storedProducts = localStorage.getItem('selectedProducts');
    const updatedProducts = storedProducts ? JSON.parse(storedProducts) : [];

    if (updatedProducts.length === 0) {
        alert("Giỏ hàng trống!");
        return;
    }
    // Cập nhật dữ liệu trước khi gửi
    const formattedOrderData = {
      idTaiKhoan: this.orderData.idTaiKhoan,
      tenNguoiNhanHang: this.orderData.tenNguoiNhanHang,
      diaChiGiaoHang: this.orderData.diaChiGiaoHang,
      sdtNguoiNhan: this.orderData.sdtNguoiNhan,
      phuongThucThanhToan: this.orderData.phuongThucThanhToan,
      phuongThucVanChuyen: "Giao hàng nhanh", // 🔥 Thêm giá trị mặc định
      ngayVanChuyen: new Date().toISOString(), // 🔥 Gửi ngày hiện tại
      chiTietDonHangs: this.orderData.chiTietDonHangs.map(item => ({
        spctId: Number(item.spctId),
        quantity: Number(item.quantity)
      }))
    };
  
    console.log("📤 Dữ liệu gửi đi:", formattedOrderData);
  
    this.orderService.createOrder(formattedOrderData).subscribe({
      
      next: (response: any) => {
        
        console.log('✅ Đơn hàng đã tạo thành công:', response);
        this.cartService.clearCartOnClient();
        localStorage.removeItem('selectedProducts');
        
        this.router.navigateByUrl('/order-success');
      },
      error: (error: any) => {
        console.error('❌ Lỗi khi tạo đơn hàng:', error);
      }
    });
  }
  removeProduct(index: number) {
    this.selectedProducts.splice(index, 1); // Xóa sản phẩm khỏi danh sách
    localStorage.setItem('selectedProducts', JSON.stringify(this.selectedProducts)); // Cập nhật localStorage

    if (this.selectedProducts.length === 0) {
      this.router.navigate(['/']); // Chuyển về trang chủ nếu không còn sản phẩm
    }
  }
 
  updateQuantity(index: number, change: number) {
    let newQuantity = this.selectedProducts[index].quantity + change;

    if (newQuantity < 1) {
        this.removeProduct(index); // Xóa nếu số lượng < 1
    } else {
        // 🔥 Cập nhật số lượng trong `selectedProducts`
        this.selectedProducts[index].quantity = newQuantity;

        // 🔥 Cập nhật `orderData.chiTietDonHangs`
        this.orderData.chiTietDonHangs[index].quantity = newQuantity;

        // 🔥 Lưu vào localStorage
        localStorage.setItem('selectedProducts', JSON.stringify(this.selectedProducts));
        localStorage.setItem('orderData', JSON.stringify(this.orderData));

        console.log("🔄 Cập nhật số lượng trong chiTietDonHangs:", this.orderData.chiTietDonHangs);
    }
}



  /** Cập nhật localStorage */
  updateLocalStorage() {
    localStorage.setItem('selectedProducts', JSON.stringify(this.selectedProducts));
    console.log("📦 Đã cập nhật localStorage:", this.selectedProducts);
}

}
