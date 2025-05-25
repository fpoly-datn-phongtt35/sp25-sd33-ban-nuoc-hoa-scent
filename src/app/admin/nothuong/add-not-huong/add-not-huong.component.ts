import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotHuongService } from '../../../service/nothuong.service';

export interface NotHuong {
  id?: number;
  tenNotHuong: string;
  moTa: string;
}

@Component({
  selector: 'app-add-not-huong',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-not-huong.component.html',
  styleUrls: ['./add-not-huong.component.scss']
})
export class AddNotHuongComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() notHuongAdded = new EventEmitter<NotHuong>();

  notHuong: NotHuong = { tenNotHuong: '', moTa: '' };

  constructor(private notHuongService: NotHuongService) {}

  ngOnInit(): void {
    // Không cần tải muiHuongs nữa
  }

  onSubmit(): void {
    const payload = {
      tenNotHuong: this.notHuong.tenNotHuong,
      moTa: this.notHuong.moTa
    };
    this.notHuongService.addNotHuong(payload).subscribe({
      next: (newNotHuong) => {
        this.notHuongAdded.emit({
          id: newNotHuong.id,
          tenNotHuong: newNotHuong.tenNotHuong,
          moTa: newNotHuong.moTa
        });
        this.close.emit();
      },
      error: (err) => console.error('Lỗi khi thêm Nốt Hương:', err)
    });
  }
}