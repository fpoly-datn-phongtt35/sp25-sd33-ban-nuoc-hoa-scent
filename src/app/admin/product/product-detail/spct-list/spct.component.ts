// src/app/product-detail/spct-list/spct.component.ts
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
  @Input() productId: number | null = null;
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
    console.log("ID sản phẩm trong modal:", this.productId);
    this.loadSpct();
  }

  ngOnChanges(): void {
    this.loadSpct();
  }

  loadSpct(): void {
    if (this.productId !== null) {
      console.log(`🔎 Đang tải chi tiết sản phẩm ID: ${this.productId}`);
      this.spctService.geSpctByIdProduct(this.productId).subscribe(data => {
        this.spct = data;
        console.log("✅ Dữ liệu sản phẩm:", this.spct);
        this.cdr.detectChanges();
      });
    }
  }

  openModalAddSpct(): void {
    const modalRef = this.modalService.open(AddSpctComponent, { backdrop: 'static', keyboard: false });
    modalRef.componentInstance.productId = this.productId;
    console.log('🎉 IdSpIdSp:', this.productId);

    modalRef.componentInstance.SpctAdded.subscribe((newSpct: any) => {
      console.log('🎉 Spct mới nhận được:', newSpct);
      this.loadSpct();
    });
  }

  openUpdateSpctModal(spct: any): void {
    const modalRef = this.modalService.open(EditSpctComponent, { backdrop: 'static', keyboard: false });
    modalRef.componentInstance.spctdata = spct;
    console.log('🎉 IdSpIdSp:', spct);

    modalRef.componentInstance.customerUpdated.subscribe((newSpct: any) => {
      console.log('🎉 Spct mới nhận được:', newSpct);
      this.loadSpct();
    });
  }

 // src/app/product-detail/spct-list/spct.component.ts
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

  closeDetail() {
    this.closeSpct.emit();
  }
}
