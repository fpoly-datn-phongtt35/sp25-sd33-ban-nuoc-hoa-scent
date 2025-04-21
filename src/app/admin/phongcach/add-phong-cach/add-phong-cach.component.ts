import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhongCachService } from '../../../service/PhongCach.service';

export interface PhongCach {
  id?: number;
  tenPhongCach: string;
  moTa: string;
}

@Component({
  selector: 'app-add-phong-cach',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-phong-cach.component.html',
  styleUrls: ['./add-phong-cach.component.scss']
})
export class AddPhongCachComponent {
  @Output() close = new EventEmitter<void>();
  @Output() phongCachAdded = new EventEmitter<PhongCach>();

  phongCach: PhongCach = { tenPhongCach: '', moTa: '' };

  constructor(private phongCachService: PhongCachService) {}

  onSubmit(): void {
    this.phongCachService.addPhongCach(this.phongCach).subscribe({
      next: (newPhongCach) => {
        this.phongCachAdded.emit(newPhongCach);
        this.close.emit();
      },
      error: (err) => console.error('Error adding PhongCach:', err)
    });
  }
}
