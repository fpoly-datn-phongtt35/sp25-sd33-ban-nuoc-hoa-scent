import { Component,OnInit } from '@angular/core';
import { LichSuThaoTacService } from '../service/LichSuThaoTac';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // <-- Add this line

export class LichSuThaoTac {
  id:number;
  maDonHang: number;
  trangThaiCu: number;
  trangThaiMoi: number;
  taiKhoanId: number;
  tenTaiKhoan: string;
  ghiChu: string;
  thoiGianThaoTac: string;
  thaoTac: string;
}

@Component({
  selector: 'app-lichsuthaotac',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './lichsuthaotac.component.html',
  styleUrl: './lichsuthaotac.component.scss'
})
export class LichsuthaotacComponent implements OnInit{
  lichSuThaoTacs: LichSuThaoTac[] = [];
  filteredLichSuThaoTacs: LichSuThaoTac[] = []; // Danh sách sau khi lọc
  searchTerm: string = ''; // Từ khóa tìm kiếm
  

  constructor(private lichSuThaoTacService: LichSuThaoTacService) {}

  ngOnInit(): void {
    this.loadAllLichSuThaoTac();
  }

  loadAllLichSuThaoTac(): void {
    this.lichSuThaoTacService.getAllLichSuThaoTac().subscribe(
      (data) => {
        this.lichSuThaoTacs = data;
        this.filteredLichSuThaoTacs = data; // Ban đầu hiển thị toàn bộ
      },
      (error) => {
        console.error('Error fetching all data:', error);
      }
    );
  }

  // Hàm tìm kiếm
  search(): void {
    if (!this.searchTerm) {
      this.filteredLichSuThaoTacs = this.lichSuThaoTacs; // Nếu không có từ khóa, hiển thị toàn bộ
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredLichSuThaoTacs = this.lichSuThaoTacs.filter(item =>
      item.maDonHang.toString().includes(this.searchTerm) ||
      item.taiKhoanId.toString().includes(this.searchTerm) ||
      item.tenTaiKhoan.toLowerCase().includes(searchTermLower)
    );
  }
}
