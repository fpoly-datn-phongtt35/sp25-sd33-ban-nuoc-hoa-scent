import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MuiHuongService } from '../../../service/muihuong.service';

export interface MuiHuong {
  id?: number;
  tenMuiHuong: string;
  moTa: string;
}

@Component({
  selector: 'app-update-mui-huong',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-mui-huong.component.html',
  styleUrls: ['./update-mui-huong.component.scss']
})
export class UpdateMuiHuongComponent {
  @Input() muiHuong: MuiHuong = { tenMuiHuong: '', moTa: '' };
  @Output() close = new EventEmitter<void>();
  @Output() muiHuongUpdated = new EventEmitter<MuiHuong>();

  constructor(private muiHuongService: MuiHuongService) {}

  onSubmit(): void {
    if (this.muiHuong.id !== undefined) {
      this.muiHuongService.updateMuiHuong(this.muiHuong.id, this.muiHuong).subscribe({
        next: (updatedMuiHuong) => {
          this.muiHuongUpdated.emit(updatedMuiHuong);
          this.close.emit();
        },
        error: (err) => console.error('Error updating MuiHuong:', err)
      });
    }
  }
}
