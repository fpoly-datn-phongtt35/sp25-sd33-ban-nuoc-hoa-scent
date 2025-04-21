import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
  selector: 'app-add-not-huong',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-not-huong.component.html',
  styleUrls: ['./add-not-huong.component.scss']
})
export class AddNotHuongComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() notHuongAdded = new EventEmitter<NotHuong>();

  notHuong: NotHuong = { tenNotHuong: '', moTa: '', muiHuongId: undefined };
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
    const payload = {
      tenNotHuong: this.notHuong.tenNotHuong,
      moTa: this.notHuong.moTa,
      muiHuong: this.notHuong.muiHuongId ? { id: this.notHuong.muiHuongId } : null
    };
    this.notHuongService.addNotHuong(payload).subscribe({
      next: (newNotHuong) => {
        this.notHuongAdded.emit({
          ...newNotHuong,
          muiHuongId: newNotHuong.muiHuong?.id,
          tenMuiHuong: newNotHuong.muiHuong?.tenMuiHuong
        });
        this.close.emit();
      },
      error: (err) => console.error('Error adding NotHuong:', err)
    });
  }
}
