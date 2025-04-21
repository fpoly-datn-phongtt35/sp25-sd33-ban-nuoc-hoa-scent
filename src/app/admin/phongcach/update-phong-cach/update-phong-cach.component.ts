import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PhongCachService } from '../../../service/PhongCach.service';

export interface PhongCach {
  id?: number;
  tenPhongCach: string;
  moTa: string;
}

@Component({
  selector: 'app-update-phong-cach',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-phong-cach.component.html',
  styleUrls: ['./update-phong-cach.component.scss']
})
export class UpdatePhongCachComponent {
  @Input() phongCach: PhongCach = { tenPhongCach: '', moTa: '' };
  @Output() close = new EventEmitter<void>();
  @Output() phongCachUpdated = new EventEmitter<PhongCach>();

  constructor(private phongCachService: PhongCachService) {}

  onSubmit(): void {
    if (this.phongCach.id !== undefined) {
      this.phongCachService.updatePhongCach(this.phongCach.id, this.phongCach).subscribe({
        next: (updatedPhongCach) => {
          this.phongCachUpdated.emit(updatedPhongCach);
          this.close.emit();
        },
        error: (err) => console.error('Error updating PhongCach:', err)
      });
    }
  }
}
