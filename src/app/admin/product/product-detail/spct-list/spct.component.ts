import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddSpctComponent } from '../add-spct/add-spct.component';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditSpctComponent } from '../edit-spct/edit-spct.component';
import { SpctService } from '../../../../service/spct.service';
import { TokenService } from '../../../../service/token.service';

@Component({
  selector: 'app-spct',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spct.component.html',
  styleUrls: ['./spct.component.scss'],
  providers: [NgbActiveModal]
})
export class SpctComponent implements OnInit {
  @Input() product: any = null;
  @Output() closeSpct = new EventEmitter<void>();
  spct: any[] = [];
  userRole: string | null = null;

  constructor(
    private spctService: SpctService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.userRole = this.tokenService.getRole();
    console.log('Vai trò trong SpctComponent:', this.userRole);
    if (this.product) {
      console.log('Sản phẩm nhận được:', this.product);
      this.loadSpct();
    }
  }

  ngOnChanges(): void {
    if (this.product) {
      this.loadSpct();
    }
  }

  loadSpct(): void {
    if (this.product?.idSanPham) {
      console.log(`🔎 Đang tải chi tiết sản phẩm ID: ${this.product.idSanPham}`);
      this.spctService.geSpctByIdProduct(this.product.idSanPham).subscribe(data => {
        this.spct = data;
        console.log("✅ Dữ liệu biến thể:", this.spct);
        this.cdr.detectChanges();
      });
    }
  }

  getPhongCachString(phongCach: any[]): string {
    if (!phongCach || !Array.isArray(phongCach)) {
      return 'Không có phong cách';
    }
    return phongCach.map(style => style.tenPhongCach).join(', ');
  }

  openModalAddSpct(): void {
    const modalRef = this.modalService.open(AddSpctComponent, { backdrop: 'static', keyboard: false });
    modalRef.componentInstance.productId = this.product?.idSanPham;
    modalRef.componentInstance.spctList = this.spct; // Truyền danh sách spct vào AddSpctComponent
    console.log('🎉 IdSpIdSp:', this.product?.idSanPham);
    console.log('🎉 Danh sách Spct truyền đi:', this.spct);

    modalRef.componentInstance.SpctAdded.subscribe((newSpct: any) => {
      console.log('🎉 Spct mới nhận được:', newSpct);
      this.loadSpct(); // Tải lại danh sách sau khi thêm mới
    });
  }

  openUpdateSpctModal(spct: any): void {
    const modalRef = this.modalService.open(EditSpctComponent, { backdrop: 'static', keyboard: false });
    modalRef.componentInstance.spctdata = spct;
    modalRef.componentInstance.spctList = this.spct; // Thêm dòng này để truyền spctList
    console.log('🎉 IdSpIdSp:', spct);
    console.log('🎉 Danh sách Spct truyền đi:', this.spct);
  
    modalRef.componentInstance.customerUpdated.subscribe((newSpct: any) => {
      console.log('🎉 Spct mới nhận được:', newSpct);
      this.loadSpct();
    });
  }

  toggleSpctStatus(id: number, currentTrangThai: number): void {
    const action = currentTrangThai === 1 ? 'ngưng bán' : 'tiếp tục bán';
    const confirmed = window.confirm(`Bạn có chắc muốn ${action} sản phẩm chi tiết này không?`);
    if (confirmed) {
      const newTrangThai = currentTrangThai === 1 ? 0 : 1;
      this.spctService.updateSpctTrangThai(id, newTrangThai).subscribe({
        next: (response) => {
          console.log('✅ Cập nhật trạng thái Spct:', response);
          this.loadSpct();
        },
        error: (error) => {
          console.error('❌ Lỗi khi cập nhật trạng thái:', error);
          alert('Cập nhật trạng thái thất bại!');
        }
      });
    }
  }
}