import { Component, EventEmitter, Output, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { SpctService } from '../../../../service/spct.service';
@Component({
  selector: 'app-edit-spct',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [NgbActiveModal],
  templateUrl: './edit-spct.component.html',
  styleUrl: './edit-spct.component.scss'
})
export class EditSpctComponent implements OnInit{
  @Output() customerUpdated = new EventEmitter<any>();
  @Input() spctdata: any; // ✅ Nhận dữ liệu khách hàng từ component cha
  spctForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private spctService: SpctService,
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef
  ){
      this.spctForm = this.fb.group({
        idSpct: [''], // ID để cập nhật, không cần validate required vì đây là trường tự động
  donGia: ['', [
    Validators.required, // Bắt buộc nhập
    Validators.min(0), // Giá không được âm
    Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/) // Chỉ cho phép số và tối đa 2 chữ số thập phân
  ]],
  soLuongTonKho: ['', [
    Validators.required, // Bắt buộc nhập
    Validators.min(0), // Số lượng không được âm
    Validators.pattern(/^[0-9]+$/) // Chỉ cho phép số nguyên
  ]],
  dungTich: ['', [
    Validators.required, // Bắt buộc nhập
    Validators.min(0), // Dung tích không được âm
    Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/) // Chỉ cho phép số và tối đa 2 chữ số thập phân
  ]],
  idSanPham: ['']
      });

    }
    ngOnInit(): void {

      if (this.spctdata) {
        this.spctForm.patchValue({
          idSpct:this.spctdata.idSpct,
          donGia: this.spctdata.donGia,
          soLuongTonKho: this.spctdata.soLuongTonKho,
          dungTich: this.spctdata.dungTich,
          idSanPham: this.spctdata.sanPham.idSanPham
        });
      } else {
        console.error('spctdata is undefined');
      }
      console.log("spctData:"+this.spctForm);
    }


  saveProductDetail() {
    if (this.spctForm.valid) {
      this.spctService.updateSpctOnAdmin(this.spctForm.value).subscribe(
        (response) => {
          alert('Cập nhật spct thành công!');
          this.customerUpdated.emit(response); // ✅ Gửi dữ liệu mới về `CustomerComponent`
          this.closeModal(); // ✅ Đóng modal sau khi cập nhật thành công
        },
        (error) => {
          console.error('❌ Lỗi khi cập nhật spct:', error);
          alert('❌ Không thể cập nhật spct. Vui lòng thử lại!');
        }
      );
    } else {
      alert('⚠️ Vui lòng điền đầy đủ thông tin hợp lệ.');
    }
  }

  closeModal() {
    console.log('🛑 Attempting to close modal...', this.activeModal);

    // 🟢 Gọi dismiss() trước
    if (this.activeModal) {
        this.activeModal.dismiss('cancel');
        console.log('✅ Dismiss method called');
    } else {
        console.error('❌ ActiveModal is not available');
    }

    // 🟠 Backup plan: Xóa modal bằng Bootstrap
    setTimeout(() => {
        const modalElement = document.querySelector('.modal');
        if (modalElement) {
            modalElement.remove();
        }
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        document.body.classList.remove('modal-open');
        console.log('✅ Forced modal removal executed');

        // 🔥 Kích hoạt Change Detection để cập nhật UI
        this.cdr.detectChanges();
    }, 100);
}
}
