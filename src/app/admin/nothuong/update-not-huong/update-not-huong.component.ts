import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotHuongService } from '../../../service/nothuong.service';

export interface NotHuong {
  id?: number;
  tenNotHuong: string;
  moTa: string;
}

@Component({
  selector: 'app-update-not-huong',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-not-huong.component.html',
  styleUrls: ['./update-not-huong.component.scss']
})
export class UpdateNotHuongComponent implements OnInit {
  @Input() notHuong: NotHuong = { tenNotHuong: '', moTa: '' };
  @Output() close = new EventEmitter<void>();
  @Output() notHuongUpdated = new EventEmitter<NotHuong>();
  errorMessage: string = '';

  constructor(private notHuongService: NotHuongService) {}

  ngOnInit(): void {
    // Không cần tải muiHuongs
  }

  onSubmit(): void {
    if (this.notHuong.id !== undefined) {
      this.errorMessage = '';
      const payload = {
        tenNotHuong: this.notHuong.tenNotHuong,
        moTa: this.notHuong.moTa
      };
      this.notHuongService.updateNotHuong(this.notHuong.id, payload).subscribe({
        next: (updatedNotHuong) => {
          this.notHuongUpdated.emit({
            id: updatedNotHuong.id,
            tenNotHuong: updatedNotHuong.tenNotHuong,
            moTa: updatedNotHuong.moTa
          });
          this.close.emit();
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật Nốt Hương:', err);
          this.errorMessage = 'Không thể cập nhật nốt hương: ' + (err.message || 'Lỗi không xác định');
        }
      });
    }
  }
}