import { Component,ChangeDetectorRef } from '@angular/core';
import { PhieugiamgiaService } from '../../service/phieugiamgia.service';
import { CommonModule } from '@angular/common';

import { Injectable, Inject } from '@angular/core';
import { NgbModal,NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AddVoucherComponent } from '../add-voucher/add-voucher.component';
import { EditVoucherComponent } from '../edit-voucher/edit-voucher.component';
@Component({
  selector: 'app-vourcher',
  standalone: true,
  imports: [CommonModule,NgbModalModule],
  templateUrl: './vourcher.component.html',
  styleUrl: './vourcher.component.scss'
})
export class VourcherComponent {
  phieuGiamGias: any[] = [];

  constructor(private phieuGiamGiaService: PhieugiamgiaService,private modalService: NgbModal,private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadAllPhieuGiamGia();
  }

  loadAllPhieuGiamGia(): void {
    this.phieuGiamGiaService.getAllPhieuGiamGia().subscribe(
      (      data: any[]) => {
        this.phieuGiamGias = data;
        console.log('Phiếu giảm giá:', data);
      },
      (      error: any) => {
        console.error('Có lỗi xảy ra khi lấy dữ liệu phiếu giảm giá:', error);
      }
    );
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
  
    modalRef.result.then(
      (updatedVoucher: any) => {
        if (updatedVoucher) {
          // Cập nhật dữ liệu tại chỗ mà không cần load lại trang
          const index = this.phieuGiamGias.findIndex((v) => v.id === updatedVoucher.id);
          if (index !== -1) {
            this.phieuGiamGias[index] = updatedVoucher;
          }
        }
      },
      (reason: any) => {
        console.log('Modal bị đóng:', reason);
      }
    );
  }
  
  

  
  
  
}
