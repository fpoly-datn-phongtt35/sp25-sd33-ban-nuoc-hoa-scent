
import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NhomHuongService } from '../../../service/nhomhuong.service';

@Component({
  selector: 'app-update-nhomhuong',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-nhomhuong.component.html',
  styleUrls: ['./update-nhomhuong.component.scss']
})
export class UpdateNhomhuongComponent implements OnInit {
  @Input() nhomHuong: any;
  @Output() nhomHuongUpdated = new EventEmitter<any>();
  updateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private nhomHuongService: NhomHuongService,
    public activeModal: NgbActiveModal
  ) {
    this.updateForm = this.fb.group({
      tenNhomHuong: ['', [Validators.required, Validators.minLength(3)]],
      mota: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.nhomHuong) {
      this.updateForm.patchValue({
        tenNhomHuong: this.nhomHuong.tenNhomHuong,
        mota: this.nhomHuong.mota
      });
    }
  }

  onSubmit(): void {
    if (this.updateForm.valid) {
      this.nhomHuongService.updateNhomHuong(this.nhomHuong.id, this.updateForm.value).subscribe({
        next: (updatedNhomHuong) => {
          this.nhomHuongUpdated.emit(updatedNhomHuong);
          this.activeModal.close('Save');
        },
        error: (err) => console.error('Error updating NhomHuong:', err)
      });
    }
  }
}
