import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MuiHuongService } from '../../../service/muihuong.service';
import { NotHuongService } from '../../../service/nothuong.service';

export interface NotHuong {
  id?: number;
  tenNotHuong: string;
  moTa: string;
  muiHuongId?: number;
}

export interface MuiHuong {
  id: number;
  tenMuiHuong: string;
}

@Component({
  selector: 'app-update-not-huong',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-not-huong.component.html',
  styleUrls: ['./update-not-huong.component.scss']
})
export class UpdateNotHuongComponent implements OnInit {
  @Input() notHuong: NotHuong = { tenNotHuong: '', moTa: '', muiHuongId: undefined };
  @Output() close = new EventEmitter<void>();
  @Output() notHuongUpdated = new EventEmitter<NotHuong>();

  muiHuongs: MuiHuong[] = [];

  constructor(
    private notHuongService: NotHuongService,
    private muiHuongService: MuiHuongService
  ) {}

  ngOnInit(): void {
    this.loadMuiHuongs();
  }

  loadMuiHuongs(): void {
    this.muiHuongService.getAllMuiHuong().subscribe({
      next: (res) => {
        this.muiHuongs = res.content;
      },
      error: (err) => console.error('Error loading MuiHuong:', err)
    });
  }

  onSubmit(): void {
    if (this.notHuong.id !== undefined) {
      const payload = {
        tenNotHuong: this.notHuong.tenNotHuong,
        moTa: this.notHuong.moTa,
        muiHuong: this.notHuong.muiHuongId ? { id: this.notHuong.muiHuongId } : null
      };
      this.notHuongService.updateNotHuong(this.notHuong.id, payload).subscribe({
        next: (updatedNotHuong) => {
          this.notHuongUpdated.emit(updatedNotHuong);
          this.close.emit();
        },
        error: (err) => console.error('Error updating NotHuong:', err)
      });
    }
  }
}
