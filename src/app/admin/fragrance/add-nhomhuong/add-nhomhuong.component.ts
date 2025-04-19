
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NhomHuongService } from '../../../service/nhomhuong.service';

@Component({
  selector: 'app-add-nhomhuong',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-nhomhuong.component.html',
  styleUrls: ['./add-nhomhuong.component.scss']
})
export class AddNhomhuongComponent {
  @Output() nhomHuongAdded = new EventEmitter<any>();
  addForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private nhomHuongService: NhomHuongService,
    public activeModal: NgbActiveModal
  ) {
    this.addForm = this.fb.group({
      tenNhomHuong: ['', [Validators.required, Validators.minLength(3)]],
      mota: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.addForm.valid) {
      this.nhomHuongService.createNhomHuong(this.addForm.value).subscribe({
        next: (newNhomHuong) => {
          this.nhomHuongAdded.emit(newNhomHuong);
          this.activeModal.close('Save');
        },
        error: (err) => console.error('Error creating NhomHuong:', err)
      });
    }
  }
}
