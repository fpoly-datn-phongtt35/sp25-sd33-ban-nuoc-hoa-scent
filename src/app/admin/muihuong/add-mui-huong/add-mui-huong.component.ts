import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MuiHuongService } from '../../../service/muihuong.service';

export interface MuiHuong {
  id?: number;
  tenMuiHuong: string;
  moTa: string;
}

@Component({
  selector: 'app-add-mui-huong',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-mui-huong.component.html',
  styleUrls: ['./add-mui-huong.component.scss']
})
export class AddMuiHuongComponent {
  @Output() close = new EventEmitter<void>();
  @Output() muiHuongAdded = new EventEmitter<MuiHuong>();

  muiHuong: MuiHuong = { tenMuiHuong: '', moTa: '' };

  constructor(private muiHuongService: MuiHuongService) {}

  onSubmit(): void {
    this.muiHuongService.addMuiHuong(this.muiHuong).subscribe({
      next: (newMuiHuong) => {
        this.muiHuongAdded.emit(newMuiHuong);
        this.close.emit();
      },
      error: (err) => console.error('Error adding MuiHuong:', err)
    });
  }
}
