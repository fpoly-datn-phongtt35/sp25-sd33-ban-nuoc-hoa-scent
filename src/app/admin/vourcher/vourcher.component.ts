import { Component } from '@angular/core';
import { PhieugiamgiaService } from '../../service/phieugiamgia.service';
import { CommonModule } from '@angular/common';

import { Injectable, Inject } from '@angular/core';
@Component({
  selector: 'app-vourcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vourcher.component.html',
  styleUrl: './vourcher.component.scss'
})
export class VourcherComponent {
  phieuGiamGias: any[] = [];

  constructor(private phieuGiamGiaService: PhieugiamgiaService) { }

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
}
