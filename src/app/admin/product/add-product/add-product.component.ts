import { Component, EventEmitter, Output, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SanPhamService } from '../../../service/product.service';
import { ThuongHieuService } from '../../../service/thuonghieu.service';
import { DanhMucService } from '../../../service/danhmuc.service';
import { NhomHuongService } from '../../../service/nhomhuong.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule, NgSelectComponent } from '@ng-select/ng-select';

// Định nghĩa interface cho dữ liệu
interface MuiHuong {
  id: number;
  tenMuiHuong: string;
}

interface NhomHuong {
  id: number;
  tenNhomHuong: string;
}

interface ThuongHieu {
  id: number;
  tenThuongHieu: string;
}

interface DanhMuc {
  id: number;
  tenDanhMuc: string;
}

interface NotHuong {
  id: number;
  tenNotHuong: string;
}

interface PhongCach {
  id: number;
  tenPhongCach: string;
}

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  providers: [NgbActiveModal],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {
  @Output() productAdd = new EventEmitter<any>();
  @ViewChild('muiHuongSelect') muiHuongSelect!: NgSelectComponent;

  productForm: FormGroup;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  danhMucList: DanhMuc[] = [];
  nhomHuongList: NhomHuong[] = [];
  thuongHieuList: ThuongHieu[] = [];
  muiHuongList: MuiHuong[] = [];
  notHuongList: NotHuong[] = [];
  phongCachList: PhongCach[] = [];
  muiHuongSelections: { id: number; prominenceLevel: number }[] = [];
  showProminenceModal: boolean = false;
  tempMuiHuongId: number | null = null;
  tempProminenceLevel: number = 0.5;
  selectedMuiHuongIds: number[] = [];
  loadingMuiHuong: boolean = true; // Biến để kiểm soát trạng thái tải dữ liệu

  constructor(
    private fb: FormBuilder,
    private danhMucService: DanhMucService,
    private nhomHuongService: NhomHuongService,
    private thuongHieuService: ThuongHieuService,
    private sanPhamService: SanPhamService,
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      ten: ['', [Validators.required, Validators.minLength(3)]],
      moTa: ['', [Validators.maxLength(1000)]],
      idThuongHieu: ['', Validators.required],
      idDanhMuc: ['', Validators.required],
      idNhomHuong: ['', Validators.required],
      notHuongDauIds: [[]],
      notHuongGiuaIds: [[]],
      notHuongCuoiIds: [[]],
      phongCachIds: [[]]
    });
  }

  async ngOnInit() {
    this.muiHuongSelections = [];
    try {
      await Promise.all([
        this.getAllDanhMuc(),
        this.getAllThuongHieu(),
        this.getAllNhomHuong(),
        this.getAllMuiHuong(),
        this.getAllNotHuong(),
        this.getAllPhongCach()
      ]);
      this.loadingMuiHuong = false; // Dữ liệu đã tải xong
      console.log('muiHuongList after ngOnInit:', this.muiHuongList);
      if (!this.muiHuongList || this.muiHuongList.length === 0) {
        console.warn('muiHuongList is empty after loading');
      }
      this.cdr.detectChanges(); // Kích hoạt change detection
    } catch (err) {
      console.error('Error in ngOnInit:', err);
      this.loadingMuiHuong = false;
      this.cdr.detectChanges();
    }
  }

  async getAllDanhMuc() {
    try {
      const data = await firstValueFrom(this.danhMucService.getAllDanhMucDanhMuc());
      this.danhMucList = data;
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  }

  async getAllThuongHieu() {
    try {
      const data = await firstValueFrom(this.thuongHieuService.getThuonghieu());
      this.thuongHieuList = data;
      this.productForm.get('idThuongHieu')?.valueChanges.subscribe(val => {
        if (val === '-1') this.handleAddThuongHieu();
      });
    } catch (err) {
      console.error('Lỗi lấy thương hiệu:', err);
    }
  }

  async getAllNhomHuong() {
    try {
      const data = await firstValueFrom(this.nhomHuongService.getnhomHuong());
      this.nhomHuongList = data;
      this.productForm.get('idNhomHuong')?.valueChanges.subscribe(val => {
        if (val === '-1') this.handleAddNhomHuong();
      });
    } catch (err) {
      console.error('Lỗi lấy nhóm hương:', err);
    }
  }

  async getAllMuiHuong() {
    try {
      const data = await firstValueFrom(this.sanPhamService.getMuiHuong());
      this.muiHuongList = data;
      console.log('Danh sách mùi hương:', this.muiHuongList);
      this.cdr.detectChanges(); // Kích hoạt change detection sau khi tải dữ liệu
    } catch (err) {
      console.error('Lỗi lấy mùi hương:', err);
    }
  }

  async getAllNotHuong() {
    try {
      const data = await firstValueFrom(this.sanPhamService.getNotHuong());
      this.notHuongList = data;
    } catch (err) {
      console.error('Lỗi lấy nốt hương:', err);
    }
  }

  async getAllPhongCach() {
    try {
      const data = await firstValueFrom(this.sanPhamService.getPhongCach());
      this.phongCachList = data;
    } catch (err) {
      console.error('Lỗi lấy phong cách:', err);
    }
  }

  async handleAddThuongHieu() {
    const tenThuongHieu = prompt('📝 Nhập tên thương hiệu mới:');
    if (!tenThuongHieu || tenThuongHieu.trim().length < 2) {
      alert('⚠️ Tên thương hiệu không hợp lệ!');
      this.productForm.get('idThuongHieu')?.setValue('');
      return;
    }
    const quocGia = prompt('🌍 Nhập quốc gia của thương hiệu:') || '';
    const moTa = prompt('📄 Nhập mô tả cho thương hiệu (nếu có):') || '';
    const body = { tenThuongHieu: tenThuongHieu.trim(), quocGia: quocGia.trim(), moTa: moTa.trim() };
    try {
      const response = (await firstValueFrom(this.thuongHieuService.addThuongHieu(body))) as { id: number };
      alert('✅ Đã thêm thương hiệu mới!');
      await this.getAllThuongHieu();
      this.productForm.get('idThuongHieu')?.setValue(response.id);
    } catch (err) {
      console.error('❌ Lỗi khi thêm thương hiệu:', err);
      alert('❌ Không thể thêm thương hiệu mới!');
      this.productForm.get('idThuongHieu')?.setValue('');
    }
  }

  async handleAddNhomHuong() {
    const tenNhomHuong = prompt('📝 Nhập tên nhóm hương mới:');
    if (!tenNhomHuong || tenNhomHuong.trim().length < 2) {
      alert('⚠️ Tên nhóm hương không hợp lệ!');
      this.productForm.get('idNhomHuong')?.setValue('');
      return;
    }
    const moTa = prompt('📄 Nhập mô tả cho nhóm hương (nếu có):') || '';
    const body = { tenNhomHuong: tenNhomHuong.trim(), moTa: moTa.trim() };
    try {
      const response = (await firstValueFrom(this.nhomHuongService.createnhomHuong(body))) as { id: number };
      alert('✅ Đã thêm nhóm hương mới!');
      await this.getAllNhomHuong();
      this.productForm.get('idNhomHuong')?.setValue(response.id);
    } catch (err) {
      console.error('❌ Lỗi khi thêm nhóm hương:', err);
      alert('❌ Không thể thêm nhóm hương mới!');
      this.productForm.get('idNhomHuong')?.setValue('');
    }
  }

  onMuiHuongAdd(event: any) {
    const id = event?.id;
    console.log('Thêm mùi hương với ID:', id);

    if (typeof id !== 'number') {
      console.error('ID không hợp lệ:', id);
      return;
    }

    if (!this.muiHuongSelections.some((s) => s.id === id)) {
      this.tempMuiHuongId = id;
      this.tempProminenceLevel = 0.5;
      this.showProminenceModal = true;
      this.cdr.detectChanges();
    }
  }

  onMuiHuongRemove(event: any) {
    const id = event?.id;
    console.log('Xóa mùi hương với ID:', id);

    if (typeof id !== 'number') {
      console.error('ID không hợp lệ:', id);
      return;
    }

    this.muiHuongSelections = this.muiHuongSelections.filter((s) => s.id !== id);
    this.selectedMuiHuongIds = this.selectedMuiHuongIds.filter((sId) => sId !== id);
    console.log('muiHuongSelections sau khi xóa:', this.muiHuongSelections);
    console.log('selectedMuiHuongIds sau khi xóa:', this.selectedMuiHuongIds);
    this.cdr.detectChanges();
  }

  confirmProminence() {
    if (this.tempMuiHuongId === null) return;

    const prominenceLevel = Number(this.tempProminenceLevel);
    console.log('Xác nhận độ nổi hương - ID:', this.tempMuiHuongId, 'Độ nổi hương:', prominenceLevel);

    if (isNaN(prominenceLevel) || prominenceLevel < 0 || prominenceLevel > 1) {
      alert('Độ nổi hương phải từ 0 đến 1!');
      this.selectedMuiHuongIds = this.selectedMuiHuongIds.filter((id) => id !== this.tempMuiHuongId);
      this.closeProminenceModal();
      return;
    }

    this.muiHuongSelections.push({ id: this.tempMuiHuongId, prominenceLevel });
    if (!this.selectedMuiHuongIds.includes(this.tempMuiHuongId)) {
      this.selectedMuiHuongIds.push(this.tempMuiHuongId);
    }

    console.log('muiHuongSelections sau khi thêm:', this.muiHuongSelections);
    console.log('selectedMuiHuongIds sau khi thêm:', this.selectedMuiHuongIds);
    this.closeProminenceModal();
    this.cdr.detectChanges();
  }

  cancelProminenceModal() {
    if (this.tempMuiHuongId !== null) {
      console.log('Hủy độ nổi hương - ID:', this.tempMuiHuongId);
      this.selectedMuiHuongIds = this.selectedMuiHuongIds.filter((id) => id !== this.tempMuiHuongId);
    }
    this.closeProminenceModal();
  }

  closeProminenceModal() {
    this.showProminenceModal = false;
    this.tempMuiHuongId = null;
    this.tempProminenceLevel = 0.5;
    this.cdr.detectChanges();
  }

  getMuiHuongName(id: number): string {
    console.log('Tìm tên mùi hương với ID:', id);
    console.log('muiHuongList hiện tại:', this.muiHuongList);

    if (!this.muiHuongList || this.muiHuongList.length === 0) {
      console.warn('muiHuongList rỗng hoặc chưa tải!');
      return `Không tìm thấy (ID: ${id})`;
    }

    const muiHuong = this.muiHuongList.find((mh) => mh.id === id);
    return muiHuong ? muiHuong.tenMuiHuong : `Không tìm thấy (ID: ${id})`;
  }

  getProminenceLevel(id: number): number {
    const selection = this.muiHuongSelections.find((s) => s.id === id);
    if (!selection) {
      console.warn(`Không tìm thấy độ nổi hương cho ID: ${id}`);
      return 0;
    }
    const prominenceLevel = Number(selection.prominenceLevel);
    return isNaN(prominenceLevel) ? 0 : prominenceLevel;
  }

  hasProminenceLevel(id: number): boolean {
    return this.muiHuongSelections.some(s => s.id === id);
  }

  async addProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValues = this.productForm.value;
    const formData = new FormData();

    formData.append('ten', formValues.ten || '');
    formData.append('moTa', formValues.moTa || '');
    formData.append('idThuongHieu', String(formValues.idThuongHieu));
    formData.append('idDanhMuc', String(formValues.idDanhMuc));
    formData.append('idNhomHuong', String(formValues.idNhomHuong));

    formValues.notHuongDauIds?.forEach((id: number) => formData.append('notHuongDauIds', String(id)));
    formValues.notHuongGiuaIds?.forEach((id: number) => formData.append('notHuongGiuaIds', String(id)));
    formValues.notHuongCuoiIds?.forEach((id: number) => formData.append('notHuongCuoiIds', String(id)));
    formValues.phongCachIds?.forEach((id: number) => formData.append('phongCachIds', String(id)));

    formData.append('muiHuongSelections', JSON.stringify(this.muiHuongSelections));
    this.selectedFiles.forEach((file) => formData.append('images', file));

    this.sanPhamService.addProductOnAdmin(formData).subscribe({
      next: (response) => {
        alert('✅ Thêm sản phẩm thành công!');
        this.productAdd.emit(response);
        this.closeModal();
      },
      error: (err) => {
        console.error('❌ Lỗi khi thêm sản phẩm:', err);
        alert('❌ Thêm sản phẩm thất bại!');
      }
    });
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      });
    }
    event.target.value = '';
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
    this.cdr.detectChanges();
  }

  closeModal() {
    this.activeModal.dismiss('cancel');
    this.cdr.detectChanges();
  }
}
