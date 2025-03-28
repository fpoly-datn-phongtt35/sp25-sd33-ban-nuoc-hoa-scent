import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderService } from '../service/order.service';
import { CartService } from '../service/cart.Service';
import { Router } from '@angular/router';
import { TokenService } from '../service/token.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { DiaChiService } from '../service/diachi.service';

interface OrderDetail {
  spctId: number;
  quantity: number;
}

interface Order {
  idTaiKhoan: number;
  tenNguoiNhanHang: string;
  diaChiGiaoHang: string;
  diachiChiTiet:string;
  sdtNguoiNhan: string;
  phuongThucThanhToan: string;
  chiTietDonHangs: OrderDetail[];
  ghichu: string;
}

interface DiaChiDonVi {
  id: number;
  name: string;
}

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
})
export class OrderComponent implements OnInit {
  orderData: Order = {
    idTaiKhoan: 0,
    tenNguoiNhanHang: '',
    diaChiGiaoHang: '',
    diachiChiTiet:'',
    sdtNguoiNhan: '',
    phuongThucThanhToan: '',
    chiTietDonHangs: [],
    ghichu: '',
  };

  selectedProducts: any[] = [];
  totalProductPrice = 0;
  discount = 0;
  shippingFee = 0;
  finalAmount = 0;
  currentTab: 'tinh' | 'huyen' | 'xa' = 'tinh';
  danhSachTinh: DiaChiDonVi[] = [];
  danhSachHuyen: DiaChiDonVi[] = [];
  danhSachXa: DiaChiDonVi[] = [];
  selectedTinh: DiaChiDonVi | null = null;
  selectedHuyen: DiaChiDonVi | null = null;
  selectedXa: DiaChiDonVi | null = null;
  showAddressPicker = false;
  addressTouched = false;
  fullAddress = '';
  searchTinh = '';
  searchHuyen = '';
  searchXa = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef,
    private diaChiService: DiaChiService
  ) {}

  ngOnInit() {
    this.layTinhThanh();

    const idTaiKhoan = this.tokenService.getUserId() || Number(localStorage.getItem('idTaiKhoan'));
    if (!idTaiKhoan) {
      console.error('Token không tồn tại hoặc rỗng.');
      return;
    }
    this.orderData.idTaiKhoan = idTaiKhoan;

    const stored = localStorage.getItem('selectedProducts');
    if (stored) {
      const parsed = JSON.parse(stored);
      this.selectedProducts = parsed.map((item: any) => ({
        tenSanPham: item.product.tenSanPham,
        quantity: item.quantity,
        volume: item.volume,
        donGia: item.product.donGia,
        imageUrl: item.product.imageURL,
      }));

      this.orderData.chiTietDonHangs = parsed.map((item: any) => ({
        spctId: item.product.idSpct,
        quantity: item.quantity,
      }));

      this.calculateTotals();
    }
  }
  get searchValue(): string {
    if (this.currentTab === 'tinh') return this.searchTinh;
    if (this.currentTab === 'huyen') return this.searchHuyen;
    return this.searchXa;
  }

  set searchValue(value: string) {
    if (this.currentTab === 'tinh') this.searchTinh = value;
    else if (this.currentTab === 'huyen') this.searchHuyen = value;
    else this.searchXa = value;
  }

  // ====================== ĐỊA CHỈ ======================

  private mapDiaChiObjectToArray(resultObj: any): DiaChiDonVi[] {
    return Object.entries(resultObj).map(([id, name]) => ({
      id: Number(id),
      name: name as string,
    }));
  }
  isSelected(item: DiaChiDonVi): boolean {
    if (this.currentTab === 'tinh') return this.selectedTinh?.id === item.id;
    if (this.currentTab === 'huyen') return this.selectedHuyen?.id === item.id;
    if (this.currentTab === 'xa') return this.selectedXa?.id === item.id;
    return false;
  }

  get currentList(): DiaChiDonVi[] {
    let list: DiaChiDonVi[] = [];

    if (this.currentTab === 'tinh') {
      list = this.danhSachTinh;
      return list.filter(item => item.name.toLowerCase().includes(this.searchTinh.toLowerCase()));
    }

    if (this.currentTab === 'huyen') {
      list = this.danhSachHuyen;
      return list.filter(item => item.name.toLowerCase().includes(this.searchHuyen.toLowerCase()));
    }

    list = this.danhSachXa;
    return list.filter(item => item.name.toLowerCase().includes(this.searchXa.toLowerCase()));
  }


  selectTab(tab: 'tinh' | 'huyen' | 'xa') {
    if ((tab === 'huyen' && !this.selectedTinh) || (tab === 'xa' && !this.selectedHuyen)) return;
    this.currentTab = tab;
  }

  onSelect(item: DiaChiDonVi) {
    if (this.currentTab === 'tinh') {
      this.selectedTinh = item;
      this.selectedHuyen = this.selectedXa = null;
      this.fullAddress = item.name;
      this.orderData.diaChiGiaoHang = '';
      this.layQuanHuyen(item.id);
      this.selectTab('huyen');
    } else if (this.currentTab === 'huyen') {
      this.selectedHuyen = item;
      this.selectedXa = null;
      this.fullAddress = `${item.name}, ${this.selectedTinh?.name}`;
      this.layPhuongXa(item.id);
      this.selectTab('xa');
    } else if (this.currentTab === 'xa') {
      this.selectedXa = item;
      this.fullAddress = `${item.name}, ${this.selectedHuyen?.name}, ${this.selectedTinh?.name}`;
      this.orderData.diaChiGiaoHang = this.fullAddress;
      this.showAddressPicker = false; // ✅ Tự động ẩn sau khi chọn xã
      this.tinhPhiVanChuyen();
    }
  }

  toggleAddressPicker() {
    this.showAddressPicker = !this.showAddressPicker;
    this.addressTouched = true;
  }


  layTinhThanh() {
    this.diaChiService.getTinhThanh().subscribe((res) => {
      this.danhSachTinh = this.mapDiaChiObjectToArray(res.result);
    });
  }

  layQuanHuyen(idTinh: number) {
    this.diaChiService.getQuanHuyen(idTinh).subscribe((res) => {
      this.danhSachHuyen = this.mapDiaChiObjectToArray(res.result);
    });
  }

  layPhuongXa(idHuyen: number) {
    this.diaChiService.getPhuongXa(idHuyen).subscribe((res) => {
      this.danhSachXa = this.mapDiaChiObjectToArray(res.result);
    });
  }

  tinhPhiVanChuyen() {
    const soLuong = this.selectedProducts.reduce((sum, item) => sum + item.quantity, 0);
    const body = {
      from_district_id: 1482,
      to_ward_code: this.selectedXa?.id || 0,
      weight: 1482,
      length: 1482,
      width: 1482,
      height: 1482,
      idMaTinh: this.selectedTinh?.id || 0,
      idQuanHuyen: this.selectedHuyen?.id || 0,
      idPhuongXa: this.selectedXa?.id || 0,
      soLuongSanPham: soLuong,
      trungBinhCacCanh: 1482,
    };

    this.diaChiService.tinhPhiVanChuyen(body).subscribe((fee) => {
      this.shippingFee = fee;
      this.calculateTotals();
    });
  }

  // ====================== ĐƠN HÀNG ======================

  calculateTotals() {
    const products = Array.isArray(this.selectedProducts) ? this.selectedProducts : [];

    this.totalProductPrice = products.reduce((total, item) => {
      return total + (item.quantity || 0) * (item.donGia || 0);
    }, 0);

    this.discount = 0;
    this.finalAmount = this.totalProductPrice + this.shippingFee - this.discount;
  }

  updateQuantity(index: number, change: number) {
    const newQty = this.selectedProducts[index].quantity + change;
    if (newQty < 1) return this.removeProduct(index);

    this.selectedProducts[index].quantity = newQty;
    this.orderData.chiTietDonHangs[index].quantity = newQty;

    localStorage.setItem('selectedProducts', JSON.stringify(this.selectedProducts));
    this.calculateTotals();
  }

  removeProduct(index: number) {
    this.selectedProducts.splice(index, 1);
    this.orderData.chiTietDonHangs.splice(index, 1);
    localStorage.setItem('selectedProducts', JSON.stringify(this.selectedProducts));
    this.calculateTotals();

    if (this.selectedProducts.length === 0) {
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    if (
      !this.orderData.tenNguoiNhanHang ||
      !this.orderData.diachiChiTiet ||  // Kiểm tra luôn địa chỉ chi tiết
      !this.orderData.sdtNguoiNhan ||
      !this.orderData.phuongThucThanhToan
    ) {
      alert('Vui lòng nhập đầy đủ thông tin giao hàng!');
      return;
    }

    const payload = {
      ...this.orderData,
      diaChiGiaoHang: `${this.orderData.diachiChiTiet}, ${this.fullAddress}`, // 👈 Gộp địa chỉ chi tiết + tỉnh/huyện/xã
      phuongThucVanChuyen: 'Giao hàng nhanh',
      ngayVanChuyen: new Date().toISOString(),
      chiTietDonHangs: this.orderData.chiTietDonHangs.map((item) => ({
        spctId: Number(item.spctId),
        quantity: Number(item.quantity),
      })),
      totalAmount: this.finalAmount,
      maTinh: this.selectedTinh?.id || 0,
      maQuan: this.selectedHuyen?.id || 0,
      maPhuong: String(this.selectedXa?.id || ''),
    };

    this.orderService.createOrder(payload).subscribe({
      next: (res) => {
        this.cartService.clearCartOnClient();
        localStorage.removeItem('selectedProducts');
        this.router.navigate(['/order-success', res.id]);
      },
      error: (err) => {
        console.error('❌ Lỗi khi tạo đơn hàng:', err);
      },
    });
  }

}
