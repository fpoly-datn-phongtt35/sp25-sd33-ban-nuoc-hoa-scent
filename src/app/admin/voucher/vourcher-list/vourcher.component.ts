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
  page: number = 0; // Trang hiện tại
  size: number = 5; // Số bản ghi mỗi trang
  totalPages: number = 20; // Tổng số trang
  constructor(private phieuGiamGiaService: PhieugiamgiaService,private modalService: NgbModal,private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadAllPhieuGiamGia();
  }

  loadAllPhieuGiamGia(): void {
    console.log('📌 Gọi API với:', this.page, this.size);

    this.phieuGiamGiaService.getAllPhieuGiamGia(this.page, this.size).subscribe({
      next: (response) => {
        console.log('✅ API response:', response);
        this.phieuGiamGias = response.content || [];
        this.totalPages = response.page?.totalPages || 1;// Nếu `totalPages` bị null, đặt mặc định là 1
      },
      error: (error) => {
        console.error('❌ Lỗi khi lấy dữ liệu khách hàng:', error);
      }
    });
  } goToPage(p: number) {
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

  openAddVoucherModal() {
    const modalRef = this.modalService.open(AddVoucherComponent, { backdrop: 'static', keyboard: false });

    modalRef.componentInstance.voucherAdded.subscribe((newVoucher: any) => {
      console.log('🎉 Voucher mới nhận được:', newVoucher);

      // ✅ Thêm voucher mới vào đầu danh sách mà không cần load lại trang
      this.phieuGiamGias.push(newVoucher);

    });

  }

  deleteVoucher(voucherId: number) {
    if (confirm('Bạn có chắc chắn muốn xóa voucher này không?')) {
      this.phieuGiamGiaService.deleteVoucher(voucherId).subscribe(
        () => {
          alert('Xóa voucher thành công!');
          this.phieuGiamGias = this.phieuGiamGias.filter(item => item.id !== voucherId);
        },
        (error: any) => {
          console.error('❌ Lỗi khi xóa voucher:', error);
        }
      );
    }
  }
  openEditVoucherModal(voucher: any) {
    console.log('🟡 Đang mở modal chỉnh sửa với dữ liệu:', voucher);

    const modalRef = this.modalService.open(EditVoucherComponent, {
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.voucher = { ...voucher }; // 🔥 Truyền dữ liệu vào modal

    modalRef.componentInstance.voucherUpdated.subscribe((updatedVoucher: any) => {
      if (updatedVoucher) {
        console.log('🔄 Cập nhật voucher:', updatedVoucher);

        // ✅ Cập nhật dữ liệu trực tiếp trong danh sách
        const index = this.phieuGiamGias.findIndex((v) => v.id === updatedVoucher.id);
        if (index !== -1) {
          this.phieuGiamGias[index] = { ...updatedVoucher };
        }

        this.cdr.detectChanges(); // 🔥 Cập nhật UI ngay lập tức
      }
    });

    modalRef.result.then(
      () => console.log('✅ Modal đóng thành công'),
      (reason: any) => console.log('❌ Modal bị đóng:', reason)
    );
  }






}
