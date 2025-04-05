import { Component,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Injectable, Inject } from '@angular/core';
import { NgbModal,NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AddVoucherComponent } from '../add-voucher/add-voucher.component';
import { EditVoucherComponent } from '../edit-voucher/edit-voucher.component';
import { PhieugiamgiaService } from '../../../service/phieugiamgia.service';
@Component({
  selector: 'app-vourcher',
  standalone: true,
  imports: [CommonModule,NgbModalModule],
  templateUrl: './vourcher.component.html',
  styleUrl: './vourcher.component.scss'
})
export class VourcherComponent {
  phieuGiamGias: any[] = [];
  filteredPhieuGiamGias: any[] = []; // Danh sách đã lọc để hiển thị
  page: number = 0;
  size: number = 5;
  totalPages: number = 20;
  filterType: string = 'all'; // Trạng thái bộ lọc: 'all', 'online', 'offline'

  constructor(
    private phieuGiamGiaService: PhieugiamgiaService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllPhieuGiamGia();
  }

  loadAllPhieuGiamGia(): void {
    console.log('📌 Gọi API với:', this.page, this.size);
    this.phieuGiamGiaService.getAllPhieuGiamGia(this.page, this.size).subscribe({
      next: (response) => {
        console.log('✅ API response:', response);
        this.phieuGiamGias = response.content || [];
        this.totalPages = response.page?.totalPages || 1;
        this.applyFilter(); // Áp dụng bộ lọc ngay sau khi tải dữ liệu
      },
      error: (error) => {
        console.error('❌ Lỗi khi lấy dữ liệu khách hàng:', error);
      }
    });
  }

  // Hàm lọc dữ liệu dựa trên loại luồng
  filterVouchers(type: string): void {
    this.filterType = type;
    this.page = 0; // Reset về trang đầu tiên khi thay đổi bộ lọc
    this.applyFilter();
  }

  // Áp dụng bộ lọc cho danh sách
  applyFilter(): void {
    console.log('📌 Dữ liệu trước khi lọc:', this.phieuGiamGias);
    if (this.filterType === 'all') {
      this.filteredPhieuGiamGias = [...this.phieuGiamGias];
    } else if (this.filterType === 'online') {
      this.filteredPhieuGiamGias = this.phieuGiamGias.filter(item => item.dieuKienapDung !== 0);
    } else if (this.filterType === 'offline') {
      this.filteredPhieuGiamGias = this.phieuGiamGias.filter(item => item.dieuKienapDung === 0);
    }
    console.log('📌 Dữ liệu sau khi lọc:', this.filteredPhieuGiamGias);
    this.cdr.detectChanges(); // Cập nhật UI
  }

  // Cập nhật các hàm khác để dùng filteredPhieuGiamGias thay vì phieuGiamGias
  goToPage(p: number) {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
      this.page = p;
      this.loadAllPhieuGiamGia();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadAllPhieuGiamGia();
    }
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadAllPhieuGiamGia();
    }
  }

  openAddVoucherModal() {
    const modalRef = this.modalService.open(AddVoucherComponent, { backdrop: 'static', keyboard: false });

    modalRef.componentInstance.voucherAdded.subscribe((newVoucher: any) => {
      console.log('🎉 Voucher mới nhận được:', newVoucher);
      this.phieuGiamGias.push(newVoucher);
      this.applyFilter(); // Áp dụng lại bộ lọc sau khi thêm
    });
  }

  deleteVoucher(voucherId: number) {
    if (confirm('Bạn có chắc chắn muốn xóa voucher này không?')) {
      this.phieuGiamGiaService.deleteVoucher(voucherId).subscribe(
        () => {
          alert('Xóa voucher thành công!');
          this.phieuGiamGias = this.phieuGiamGias.filter(item => item.id !== voucherId);
          this.applyFilter(); // Áp dụng lại bộ lọc sau khi xóa
        },
        (error: any) => {
          console.error('❌ Lỗi khi xóa voucher:', error);
        }
      );
    }
  }

  openEditVoucherModal(voucher: any) {
    const modalRef = this.modalService.open(EditVoucherComponent, {
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.voucher = { ...voucher };

    modalRef.componentInstance.voucherUpdated.subscribe((updatedVoucher: any) => {
      if (updatedVoucher) {
        console.log('🔄 Cập nhật voucher:', updatedVoucher);
        const index = this.phieuGiamGias.findIndex((v) => v.id === updatedVoucher.id);
        if (index !== -1) {
          this.phieuGiamGias[index] = { ...updatedVoucher };
          this.applyFilter(); // Áp dụng lại bộ lọc sau khi chỉnh sửa
        }
        this.cdr.detectChanges();
      }
    });
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
}
