import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TokenService } from '../service/token.service';
import { TraHangService } from '../service/TraHangService';
import Swal from 'sweetalert2';
import { YeuCauTraHang } from '../service/response/YeuCauTraHang';

@Component({
  selector: 'app-tra-hang',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './tra-hang.component.html',
  styleUrls: ['./tra-hang.component.scss']
})
export class TraHangComponent implements OnInit {
  traHangForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  hinhAnhFiles: File[] = [];
  videoFile: File | null = null;
  hinhAnhError: boolean = false;
  videoError: boolean = false;
  urlVideo: string | null = null;
  hinhAnhUrls: string[] = [];

  idTaiKhoan: number;
  donHangs: any[] = [];
  spctList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private traHangService: TraHangService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {
    this.idTaiKhoan = this.tokenService.getUserId();
    console.log('idTaiKhoan from TokenService:', this.idTaiKhoan);
    if (!this.idTaiKhoan) {
      this.errorMessage = 'Vui lòng đăng nhập để thực hiện yêu cầu trả hàng.';
    }

    this.traHangForm = this.fb.group({
      idDonHang: ['', [Validators.required]],
      idSpct: ['', [Validators.required]],
      soLuong: ['', [Validators.required, Validators.min(1)]],
      lyDoTraHang: ['', [Validators.required]],
      tinhTrangHang: ['NguyenVen', [Validators.required]],
      hinhThucTraHang: ['TaiCuaHang', [Validators.required]],
      ghiChu: ['']
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.loadCompletedDonHangs();
  }

  loadCompletedDonHangs(): void {
    if (this.idTaiKhoan) {
      console.log('Calling API to load completed orders for idTaiKhoan:', this.idTaiKhoan);
      this.traHangService.getCompletedDonHangs(this.idTaiKhoan).subscribe({
        next: (data) => {
          console.log('API Response:', data);
          this.donHangs = data;
          console.log('donHangs:', this.donHangs);
          if (this.donHangs.length === 0) {
            this.errorMessage = 'Bạn không có đơn hàng hoàn thành nào để trả.';
            Swal.fire({
              icon: 'info',
              title: 'Thông báo',
              text: this.errorMessage,
              confirmButtonText: 'OK',
              confirmButtonColor: '#3b82f6'
            });
          }
          this.cdr.detectChanges();
        },
        error: (err: Error) => {
          console.error('Error loading completed orders:', err);
          this.errorMessage = err.message; // Lấy thông báo lỗi từ backend
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: this.errorMessage,
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
          });
          this.cdr.detectChanges();
        }
      });
    } else {
      console.warn('idTaiKhoan is not set. Cannot load completed orders.');
    }
  }

  onDonHangChange(): void {
    console.log('onDonHangChange called');
    const idDonHang = this.traHangForm.get('idDonHang')?.value;
    console.log('Selected maDonHang:', idDonHang);

    if (idDonHang) {
      const maDonHangToCompare = this.donHangs.length > 0 && typeof this.donHangs[0]?.maDonHang === 'number' ? Number(idDonHang) : idDonHang;
      const selectedDonHang = this.donHangs.find(dh => dh.maDonHang === maDonHangToCompare);
      console.log('Selected donHang:', selectedDonHang);

      if (selectedDonHang && selectedDonHang.maDonHang) {
        this.traHangService.getSpctByDonHang(selectedDonHang.maDonHang).subscribe({
          next: (spctData) => {
            console.log('spctData from API:', spctData);
            this.spctList = spctData;
            console.log('spctList:', this.spctList);

            if (this.spctList.length === 0) {
              this.errorMessage = 'Đơn hàng này không có sản phẩm để trả.';
              Swal.fire({
                icon: 'info',
                title: 'Thông báo',
                text: this.errorMessage,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3b82f6'
              });
            } else {
              this.errorMessage = null;
            }
            this.traHangForm.get('idSpct')?.setValue('');
            this.cdr.detectChanges();
          },
          error: (err: Error) => {
            console.error('Error loading spct list:', err);
            this.spctList = [];
            this.errorMessage = err.message; // Lấy thông báo lỗi từ backend
            Swal.fire({
              icon: 'error',
              title: 'Lỗi!',
              text: this.errorMessage,
              confirmButtonText: 'OK',
              confirmButtonColor: '#ef4444'
            });
            this.traHangForm.get('idSpct')?.setValue('');
            this.cdr.detectChanges();
          }
        });
      } else {
        this.spctList = [];
        this.errorMessage = 'Không tìm thấy đơn hàng hợp lệ.';
        Swal.fire({
          icon: 'warning',
          title: 'Cảnh báo!',
          text: this.errorMessage,
          confirmButtonText: 'OK',
          confirmButtonColor: '#f59e0b'
        });
        this.traHangForm.get('idSpct')?.setValue('');
        this.cdr.detectChanges();
      }
    } else {
      this.spctList = [];
      this.errorMessage = 'Vui lòng chọn đơn hàng hợp lệ.';
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo!',
        text: this.errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b'
      });
      this.traHangForm.get('idSpct')?.setValue('');
      this.cdr.detectChanges();
    }
  }

  onTinhTrangHangChange(): void {
    const tinhTrangHang = this.traHangForm.get('tinhTrangHang')?.value;
    if (tinhTrangHang !== 'HuHong') {
      this.hinhAnhFiles = [];
      this.videoFile = null;
      this.hinhAnhError = false;
      this.videoError = false;
    }
    this.cdr.detectChanges();
  }

  onHinhAnhChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.hinhAnhFiles = Array.from(input.files);
      this.hinhAnhError = this.hinhAnhFiles.length === 0 && this.traHangForm.get('tinhTrangHang')?.value === 'HuHong';
      if (this.hinhAnhFiles.length > 2) {
        this.hinhAnhError = true;
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Chỉ được phép tải lên tối đa 2 hình ảnh.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
        this.hinhAnhFiles = [];
      }
      this.cdr.detectChanges();
    } else {
      this.hinhAnhFiles = [];
      this.hinhAnhError = this.traHangForm.get('tinhTrangHang')?.value === 'HuHong';
      this.cdr.detectChanges();
    }
  }

  onVideoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.videoFile = input.files[0];
      if (this.videoFile.size > 50 * 1024 * 1024) { // 50MB
        this.videoError = true;
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Kích thước video không được vượt quá 50MB.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
        this.videoFile = null;
      } else {
        this.videoError = false;
      }
      this.cdr.detectChanges();
    } else {
      this.videoFile = null;
      this.videoError = this.traHangForm.get('tinhTrangHang')?.value === 'HuHong';
      this.cdr.detectChanges();
    }
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.traHangForm.valid) {
      const tinhTrangHang = this.traHangForm.get('tinhTrangHang')?.value;
      if (tinhTrangHang === 'HuHong') {
        if (this.hinhAnhFiles.length === 0) {
          this.hinhAnhError = true;
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Vui lòng tải lên ít nhất một hình ảnh sản phẩm hỏng.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
          });
          return;
        }
        if (!this.videoFile) {
          this.videoError = true;
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Vui lòng tải lên một video sản phẩm hỏng.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
          });
          return;
        }
      }

      // Hiển thị Swal loading
      Swal.fire({
        title: 'Đang gửi yêu cầu trả hàng...',
        text: 'Vui lòng đợi trong giây lát.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const formValue = this.traHangForm.value;
      const idDonHang = this.traHangForm.get('idDonHang')?.value;
      const maDonHangToCompare = this.donHangs.length > 0 && typeof this.donHangs[0]?.maDonHang === 'number' ? Number(idDonHang) : idDonHang;
      const selectedDonHang = this.donHangs.find(dh => dh.maDonHang === maDonHangToCompare);

      if (selectedDonHang) {
        const yeuCauTraHangRequest: YeuCauTraHang = {
          idTaiKhoan: this.idTaiKhoan,
          donHang: { id: selectedDonHang.id || selectedDonHang.maDonHang },
          spct: { idSpct: Number(formValue.idSpct) },
          soLuong: formValue.soLuong,
          trangThai: 0,
          lyDoTraHang: formValue.lyDoTraHang,
          tinhTrangHang: formValue.tinhTrangHang,
          hinhThucTraHang: formValue.hinhThucTraHang,
          ghiChu: formValue.ghiChu || undefined,
          hinhAnhUrls: undefined
        };

        const formData = new FormData();
        formData.append('yeuCauRequest', new Blob([JSON.stringify(yeuCauTraHangRequest)], { type: 'application/json' }));
        this.hinhAnhFiles.forEach((file) => {
          formData.append('hinhAnh', file, file.name);
        });
        if (this.videoFile) {
          formData.append('video', this.videoFile, this.videoFile.name);
        }

        console.log('Dữ liệu gửi đi:', { yeuCauRequest: yeuCauTraHangRequest, hinhAnhFiles: this.hinhAnhFiles, videoFile: this.videoFile });

        this.traHangService.createYeuCauTraHang(formData).subscribe({
          next: (response) => {
            this.urlVideo = response.urlVideo || null;
            this.hinhAnhUrls = response.hinhAnhUrls || [];
            this.successMessage = 'Yêu cầu trả hàng đã được tạo thành công!';
            Swal.fire({
              icon: 'success',
              title: 'Thành công!',
              text: this.successMessage,
              confirmButtonText: 'OK',
              confirmButtonColor: '#3b82f6',
              timer: 1500 // Tự đóng sau 1.5 giây
            });

            this.traHangForm.reset({
              idDonHang: '',
              idSpct: '',
              soLuong: 1,
              lyDoTraHang: 'Không thích',
              tinhTrangHang: 'NguyenVen',
              hinhThucTraHang: 'TaiCuaHang',
              ghiChu: ''
            });
            this.hinhAnhFiles = [];
            this.videoFile = null;
            this.spctList = [];
            this.hinhAnhError = false;
            this.videoError = false;
            this.cdr.detectChanges();
          },
          error: (err: Error) => {
            this.errorMessage = err.message;
            Swal.fire({
              icon: 'error',
              title: 'Lỗi!',
              text: this.errorMessage,
              confirmButtonText: 'OK',
              confirmButtonColor: '#ef4444'
            });
            this.cdr.detectChanges();
          }
        });
      } else {
        this.errorMessage = 'Không tìm thấy đơn hàng hợp lệ.';
        Swal.fire({
          icon: 'warning',
          title: 'Cảnh báo!',
          text: this.errorMessage,
          confirmButtonText: 'OK',
          confirmButtonColor: '#f59e0b'
        });
        this.cdr.detectChanges();
      }
    } else {
      this.errorMessage = 'Vui lòng điền đầy đủ các thông tin bắt buộc.';
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo!',
        text: this.errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b'
      });
      this.cdr.detectChanges();
    }
  }
}