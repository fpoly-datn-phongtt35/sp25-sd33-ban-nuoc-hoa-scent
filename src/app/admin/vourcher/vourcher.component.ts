import { Component } from '@angular/core';
import { PhieugiamgiaService } from '../../service/phieugiamgia.service';
import { CommonModule } from '@angular/common';

import { Injectable, Inject } from '@angular/core';
import { NgbModal,NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AddVoucherComponent } from '../add-voucher/add-voucher.component';
@Component({
  selector: 'app-vourcher',
  standalone: true,
  imports: [CommonModule,NgbModalModule],
  templateUrl: './vourcher.component.html',
  styleUrl: './vourcher.component.scss'
})
export class VourcherComponent {
  phieuGiamGias: any[] = [];

  constructor(private phieuGiamGiaService: PhieugiamgiaService,private modalService: NgbModal) { }

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
    const modalRef = this.modalService.open(AddVoucherComponent);
    modalRef.result.then((newVoucher: any) => {
      if (newVoucher) {
        this.phieuGiamGiaService.addVoucher(newVoucher).subscribe(
          (response: any) => {
            this.phieuGiamGias.push(response); // Cập nhật UI với dữ liệu từ API
          },
          (error: any) => {
            console.error('Lỗi khi thêm voucher', error);
          }
        );
      }
    }).catch(() => {});
  }
}
