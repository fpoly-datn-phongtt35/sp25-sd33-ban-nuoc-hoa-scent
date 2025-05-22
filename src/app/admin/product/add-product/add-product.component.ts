import { Component, EventEmitter, Output, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SanPhamService } from '../../../service/product.service';
import { ThuongHieuService } from '../../../service/thuonghieu.service';
import { DanhMucService } from '../../../service/danhmuc.service';
import { NhomHuongService } from '../../../service/nhomhuong.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule, NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NongDoService } from '../../../service/nongdo.service';

// Shared model interfaces
export interface MuiHuong { id: number; tenMuiHuong: string; }
export interface NhomHuong { id: number; tenNhomHuong: string; }
export interface DanhMuc { id: number; tenDanhMuc: string; }
export interface NongDo { id: number; tenNongDo: string; }
export interface NotHuong { id: number; tenNotHuong: string; }
export interface PhongCach { id: number; tenPhongCach: string; }
export interface ThuongHieu { id: number; tenThuongHieu: string; quocGia: string; moTa: string; }

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
  prominenceForm: FormGroup;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  danhMucList: DanhMuc[] = [];
  nhomHuongList: NhomHuong[] = [];
  thuongHieuList: ThuongHieu[] = [];
  muiHuongList: MuiHuong[] = [];
  nongDoList: NongDo[] = [];
  notHuongList: NotHuong[] = [];
  phongCachList: PhongCach[] = [];
  muiHuongSelections: { id: number; prominenceLevel: number }[] = [];
  showProminenceModal: boolean = false;
  tempMuiHuongId: number | null = null;
  loadingMuiHuong: boolean = true;
  isSubmitting: boolean = false;

  private searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private danhMucService: DanhMucService,
    private nhomHuongService: NhomHuongService,
    private thuongHieuService: ThuongHieuService,
    private sanPhamService: SanPhamService,
    private nongDoService: NongDoService,
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.productForm = this.fb.group({
      ten: ['', [Validators.required, Validators.minLength(3)]],
moTa: ['', [
    Validators.required, // Ensures the field cannot be empty
    Validators.minLength(10),
    Validators.maxLength(1000),
    Validators.pattern(/^[a-zA-Z0-9\sÀ-ỹ.,!?()-]*$/),
  ]],
      idThuongHieu: ['', Validators.required],
      idDanhMuc: ['', Validators.required],
      idNhomHuong: ['', Validators.required],
      idNongDo: ['', Validators.required],
      notHuongDauIds: [[], Validators.required],
      notHuongGiuaIds: [[], Validators.required],
      notHuongCuoiIds: [[], Validators.required],
      phongCachIds: [[], Validators.required],
      muiHuongIds: [[]]
    });

    this.prominenceForm = this.fb.group({
      prominenceLevel: [0.5, [Validators.required, Validators.min(0), Validators.max(1)]]
    });

    this.searchSubject.pipe(debounceTime(300)).subscribe((term: string) => {
      this.cdr.detectChanges();
    });
  }

  customSearchFn(term: string, item: any): boolean {
    if (!term || !item) return false;
    const searchTerm = this.removeVietnameseTones(term.toLowerCase());
    const itemName = this.removeVietnameseTones(
      (item.tenThuongHieu || item.tenNhomHuong || item.tenDanhMuc || item.tenNongDo || item.tenMuiHuong || item.tenNotHuong || item.tenPhongCach || '').toLowerCase()
    );
    if (item.id === -1) return true;
    this.searchSubject.next(term);
    return itemName.includes(searchTerm);
  }

  removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
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
        this.getAllPhongCach(),
        this.getAllNongDo()
      ]);
      this.loadingMuiHuong = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error in ngOnInit:', err);
      this.toastr.error('Không thể tải dữ liệu. Vui lòng thử lại sau.', 'Lỗi');
      this.loadingMuiHuong = false;
      this.cdr.detectChanges();
    }
  }

  async getAllDanhMuc() {
    try {
      const data = await firstValueFrom(this.danhMucService.getAllDanhMucDanhMuc());
      this.danhMucList = data || [];
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
      this.toastr.error('Không thể tải danh mục.', 'Lỗi');
    }
  }

  async getAllThuongHieu() {
    try {
      const data = await firstValueFrom(this.thuongHieuService.getThuonghieu());
      this.thuongHieuList = data || [];
      this.thuongHieuList.push({ id: -1, tenThuongHieu: 'Thêm thương hiệu mới...', quocGia: '', moTa: '' });
      this.productForm.get('idThuongHieu')?.valueChanges.subscribe(val => {
        if (val === -1) this.handleAddThuongHieu();
      });
    } catch (err) {
      console.error('Lỗi lấy thương hiệu:', err);
      this.toastr.error('Không thể tải danh sách thương hiệu.', 'Lỗi');
    }
  }

  async getAllNhomHuong() {
    try {
      const data = await firstValueFrom(this.nhomHuongService.getNhomHuong());
      this.nhomHuongList = data || [];
      this.nhomHuongList.push({ id: -1, tenNhomHuong: 'Thêm nhóm hương mới...' });
      this.productForm.get('idNhomHuong')?.valueChanges.subscribe(val => {
        if (val === -1) this.handleAddNhomHuong();
      });
    } catch (err) {
      console.error('Lỗi lấy nhóm hương:', err);
      this.toastr.error('Không thể tải danh sách nhóm hương.', 'Lỗi');
    }
  }

  async getAllNongDo() {
    try {
      const data = await firstValueFrom(this.nongDoService.getNongDo());
      this.nongDoList = data || [];
    } catch (err) {
      console.error('Lỗi lấy nồng độ:', err);
      this.toastr.error('Không thể tải danh sách nồng độ.', 'Lỗi');
    }
  }

  async getAllMuiHuong() {
    try {
      const data = await firstValueFrom(this.sanPhamService.getMuiHuong());
      this.muiHuongList = (data || []).filter(item => typeof item.id === 'number' && item.id > 0);
      this.muiHuongList.push({ id: -1, tenMuiHuong: 'Thêm mùi hương mới...' });
      this.loadingMuiHuong = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Lỗi lấy mùi hương:', err);
      this.toastr.error('Không thể tải danh sách mùi hương.', 'Lỗi');
      this.loadingMuiHuong = false;
      this.cdr.detectChanges();
    }
  }

  async getAllNotHuong() {
    try {
      const data = await firstValueFrom(this.sanPhamService.getNotHuong());
      this.notHuongList = (data || []).filter(item => typeof item.id === 'number' && item.id > 0);
      this.notHuongList.push({ id: -1, tenNotHuong: 'Thêm nốt hương mới...' });
    } catch (err) {
      console.error('Lỗi lấy nốt hương:', err);
      this.toastr.error('Không thể tải danh sách nốt hương.', 'Lỗi');
    }
  }

  async getAllPhongCach() {
    try {
      const data = await firstValueFrom(this.sanPhamService.getPhongCach());
      this.phongCachList = (data || []).filter(item => typeof item.id === 'number' && item.id > 0);
      this.phongCachList.push({ id: -1, tenPhongCach: 'Thêm phong cách mới...' });
    } catch (err) {
      console.error('Lỗi lấy phong cách:', err);
      this.toastr.error('Không thể tải danh sách phong cách.', 'Lỗi');
    }
  }

  async handleAddThuongHieu() {
    const tenThuongHieu = prompt('📝 Nhập tên thương hiệu mới:');
    if (!tenThuongHieu || tenThuongHieu.trim().length < 2) {
      this.toastr.warning('Tên thương hiệu không hợp lệ!', 'Cảnh báo');
      this.productForm.get('idThuongHieu')?.setValue('');
      return;
    }
    const quocGia = prompt('🌍 Nhập quốc gia của thương hiệu:') || '';
    const moTa = prompt('📄 Nhập mô tả cho thương hiệu (nếu có):') || '';
    const body = { tenThuongHieu: tenThuongHieu.trim(), quocGia: quocGia.trim(), moTa: moTa.trim() };
    try {
      const response = await firstValueFrom(this.thuongHieuService.addThuongHieu(body));
      this.toastr.success('Đã thêm thương hiệu mới!', 'Thành công');
      await this.getAllThuongHieu();
      this.productForm.get('idThuongHieu')?.setValue(response.id);
    } catch (err) {
      console.error('Lỗi khi thêm thương hiệu:', err);
      this.toastr.error('Không thể thêm thương hiệu mới!', 'Lỗi');
      this.productForm.get('idThuongHieu')?.setValue('');
    }
  }

  async handleAddNhomHuong() {
    const tenNhomHuong = prompt('📝 Nhập tên nhóm hương mới:');
    if (!tenNhomHuong || tenNhomHuong.trim().length < 2) {
      this.toastr.warning('Tên nhóm hương không hợp lệ!', 'Cảnh báo');
      this.productForm.get('idNhomHuong')?.setValue('');
      return;
    }
    const moTa = prompt('📄 Nhập mô tả cho nhóm hương (nếu có):') || '';
    const body = { tenNhomHuong: tenNhomHuong.trim(), moTa: moTa.trim() };
    try {
      const response = await firstValueFrom(this.nhomHuongService.createNhomHuong(body));
      this.toastr.success('Đã thêm nhóm hương mới!', 'Thành công');
      await this.getAllNhomHuong();
      this.productForm.get('idNhomHuong')?.setValue(response.id);
    } catch (err) {
      console.error('Lỗi khi thêm nhóm hương:', err);
      this.toastr.error('Không thể thêm nhóm hương mới!', 'Lỗi');
      this.productForm.get('idNhomHuong')?.setValue('');
    }
  }

  async handleAddNotHuong(controlName: string) {
    const tenNotHuong = prompt('📝 Nhập tên nốt hương mới:');
    if (!tenNotHuong || tenNotHuong.trim().length < 2) {
      this.toastr.warning('Tên nốt hương không hợp lệ!', 'Cảnh báo');
      this.removeNotHuongSelection(controlName, -1);
      return;
    }
    const moTa = prompt('📄 Nhập mô tả cho nốt hương (nếu có):') || '';
    const body = { tenNotHuong: tenNotHuong.trim(), moTa: moTa.trim() };
    try {
      const response = await firstValueFrom(this.sanPhamService.addNotHuong(body));
      this.toastr.success('Đã thêm nốt hương mới!', 'Thành công');
      await this.getAllNotHuong();
      const currentIds = this.productForm.get(controlName)?.value || [];
      if (!currentIds.includes(response.id)) {
        this.productForm.get(controlName)?.setValue([...currentIds, response.id]);
      }
    } catch (err) {
      console.error('Lỗi khi thêm nốt hương:', err);
      this.toastr.error('Không thể thêm nốt hương mới!', 'Lỗi');
      this.removeNotHuongSelection(controlName, -1);
    }
  }

  async handleAddMuiHuong() {
    const tenMuiHuong = prompt('📝 Nhập tên mùi hương mới:');
    if (!tenMuiHuong || tenMuiHuong.trim().length < 2) {
      this.toastr.warning('Tên mùi hương không hợp lệ!', 'Cảnh báo');
      this.productForm.get('muiHuongIds')?.setValue(
        (this.productForm.get('muiHuongIds')?.value || []).filter((id: number) => id !== -1)
      );
      return;
    }
    const moTa = prompt('📄 Nhập mô tả cho mùi hương (nếu có):') || '';
    const body = { tenMuiHuong: tenMuiHuong.trim(), moTa: moTa.trim() };
    try {
      const response = await firstValueFrom(this.sanPhamService.addMuiHuong(body));
      this.toastr.success('Đã thêm mùi hương mới!', 'Thành công');
      await this.getAllMuiHuong();
      const currentMuiHuongIds = this.productForm.get('muiHuongIds')?.value || [];
      if (!currentMuiHuongIds.includes(response.id)) {
        this.productForm.get('muiHuongIds')?.setValue([...currentMuiHuongIds, response.id]);
        this.onMuiHuongAdd(response.id);
      }
    } catch (err) {
      console.error('Lỗi khi thêm mùi hương:', err);
      this.toastr.error('Không thể thêm mùi hương mới!', 'Lỗi');
      this.productForm.get('muiHuongIds')?.setValue(
        (this.productForm.get('muiHuongIds')?.value || []).filter((id: number) => id !== -1)
      );
    }
  }

  async handleAddPhongCach() {
    const tenPhongCach = prompt('📝 Nhập tên phong cách mới:');
    if (!tenPhongCach || tenPhongCach.trim().length < 2) {
      this.toastr.warning('Tên phong cách không hợp lệ!', 'Cảnh báo');
      this.productForm.get('phongCachIds')?.setValue(
        (this.productForm.get('phongCachIds')?.value || []).filter((id: number) => id !== -1)
      );
      return;
    }
    const moTa = prompt('📄 Nhập mô tả cho phong cách (nếu có):') || '';
    const body = { tenPhongCach: tenPhongCach.trim(), moTa: moTa.trim() };
    try {
      const response = await firstValueFrom(this.sanPhamService.addPhongCach(body));
      this.toastr.success('Đã thêm phong cách mới!', 'Thành công');
      await this.getAllPhongCach();
      const currentPhongCachIds = this.productForm.get('phongCachIds')?.value || [];
      if (!currentPhongCachIds.includes(response.id)) {
        this.productForm.get('phongCachIds')?.setValue([...currentPhongCachIds, response.id]);
      }
    } catch (err) {
      console.error('Lỗi khi thêm phong cách:', err);
      this.toastr.error('Không thể thêm phong cách mới!', 'Lỗi');
      this.productForm.get('phongCachIds')?.setValue(
        (this.productForm.get('phongCachIds')?.value || []).filter((id: number) => id !== -1)
      );
    }
  }

  onNotHuongChange(controlName: string, event: any) {
    const selectedIds = this.productForm.get(controlName)?.value || [];
    if (selectedIds.includes(-1)) {
      this.handleAddNotHuong(controlName);
    }
  }

  onMuiHuongChange(event: any) {
    const selectedIds = this.productForm.get('muiHuongIds')?.value || [];
    if (selectedIds.includes(-1)) {
      this.handleAddMuiHuong();
    }
  }

  onPhongCachChange(event: any) {
    const selectedIds = this.productForm.get('phongCachIds')?.value || [];
    if (selectedIds.includes(-1)) {
      this.handleAddPhongCach();
    }
  }

  private removeNotHuongSelection(controlName: string, idToRemove: number) {
    const currentIds = this.productForm.get(controlName)?.value || [];
    this.productForm.get(controlName)?.setValue(currentIds.filter((id: number) => id !== idToRemove));
  }

  onMuiHuongAdd(event: any) {
    let id: number;
    if (typeof event === 'object' && event !== null && 'id' in event) {
      id = Number(event.id);
    } else {
      id = Number(event);
    }

    if (isNaN(id) || id <= 0) {
      console.error('Invalid ID:', id);
      this.productForm.get('muiHuongIds')?.setValue(
        (this.productForm.get('muiHuongIds')?.value || []).filter((sId: number) => sId !== id)
      );
      return;
    }

    if (!this.muiHuongSelections.some((s) => s.id === id)) {
      this.tempMuiHuongId = id;
      this.prominenceForm.get('prominenceLevel')?.setValue(0.5);
      this.showProminenceModal = true;
      document.body.classList.add('modal-open');
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
      this.cdr.detectChanges();
    }
  }

  onMuiHuongRemove(event: any) {
    let id: number;
    if (typeof event === 'object' && event !== null && 'id' in event) {
      id = Number(event.id);
    } else {
      id = Number(event);
    }

    if (isNaN(id) || id <= 0) {
      console.error('Invalid ID:', id);
      return;
    }

    this.muiHuongSelections = this.muiHuongSelections.filter((s) => s.id !== id);
    this.productForm.get('muiHuongIds')?.setValue(
      (this.productForm.get('muiHuongIds')?.value || []).filter((sId: number) => sId !== id)
    );
    this.cdr.detectChanges();
  }

  confirmProminence() {
    if (this.tempMuiHuongId === null) return;

    const prominenceLevel = this.prominenceForm.get('prominenceLevel')?.value;
    if (isNaN(prominenceLevel) || prominenceLevel < 0 || prominenceLevel > 1) {
      this.toastr.warning('Độ nổi hương phải từ 0 đến 1!', 'Cảnh báo');
      return;
    }

    this.muiHuongSelections = this.muiHuongSelections.filter((s) => s.id !== this.tempMuiHuongId);
    this.muiHuongSelections.push({ id: this.tempMuiHuongId, prominenceLevel });

    const currentMuiHuongIds = this.productForm.get('muiHuongIds')?.value || [];
    if (!currentMuiHuongIds.includes(this.tempMuiHuongId)) {
      this.productForm.get('muiHuongIds')?.setValue([...currentMuiHuongIds, this.tempMuiHuongId]);
    }

    this.closeProminenceModal();
    this.cdr.detectChanges();
  }

cancelProminenceModal() {
    if (this.tempMuiHuongId !== null) {
      this.productForm.get('muiHuongIds')?.setValue(
        (this.productForm.get('muiHuongIds')?.value || []).filter((id: number) => id !== this.tempMuiHuongId)
      );
    }
    this.prominenceForm.get('prominenceLevel')?.setValue(0.5);
    this.closeProminenceModal();
  }
  closeProminenceModal() {
    this.showProminenceModal = false;
    this.tempMuiHuongId = null;

    const backdrops = document.querySelectorAll('.modal-backdrop');
    if (backdrops.length > 1) {
      backdrops[backdrops.length - 1].remove();
    }

    const openModals = document.querySelectorAll('.modal.show:not(.prominence-modal)');
    if (openModals.length === 0) {
      document.body.classList.remove('modal-open');
      const remainingBackdrops = document.querySelectorAll('.modal-backdrop');
      remainingBackdrops.forEach(backdrop => backdrop.remove());
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '';
    }

    this.cdr.detectChanges();
  }

  getMuiHuongName(item: any): string {
    const id = typeof item === 'number' ? item : item.id;
    const muiHuong = this.muiHuongList.find((mh) => mh.id === id);
    return muiHuong ? muiHuong.tenMuiHuong : `Không tìm thấy (ID: ${id})`;
  }

  getProminenceLevel(item: any): number {
    const id = typeof item === 'number' ? item : item.id;
    const selection = this.muiHuongSelections.find((s) => s.id === id);
    return selection ? Number(selection.prominenceLevel) : 0;
  }

  hasProminenceLevel(item: any): boolean {
    const id = typeof item === 'number' ? item : item.id;
    return this.muiHuongSelections.some((s) => s.id === id);
  }

 async addProduct() {
  if (this.productForm.invalid) {
    const moTaControl = this.productForm.get('moTa');
    if (moTaControl?.errors) {
      if (moTaControl.errors['required'] || moTaControl.errors['meaningless']) {
        this.toastr.warning('Mô tả sản phẩm không được để trống!', 'Cảnh báo');
      } else if (moTaControl.errors['minlength']) {
        this.toastr.warning('Mô tả sản phẩm phải có ít nhất 10 ký tự!', 'Cảnh báo');
      } else if (moTaControl.errors['maxlength']) {
        this.toastr.warning('Mô tả sản phẩm không được vượt quá 1000 ký tự!', 'Cảnh báo');
      } else if (moTaControl.errors['pattern']) {
        this.toastr.warning('Mô tả sản phẩm chứa ký tự không hợp lệ!', 'Cảnh báo');
      } else if (moTaControl.errors['meaningless']) {
        this.toastr.warning('Mô tả sản phẩm không đủ ý nghĩa hoặc chứa quá nhiều ký tự lặp lại!', 'Cảnh báo');
      }
      return;
    }
    this.productForm.markAllAsTouched();
    this.toastr.warning('Vui lòng điền đầy đủ thông tin hợp lệ!', 'Cảnh báo');
    return;
  }

  if (this.muiHuongSelections.length === 0) {
    this.toastr.warning('Vui lòng chọn ít nhất một mùi hương và nhập độ nổi hương!', 'Cảnh báo');
    return;
  }

  if (this.selectedFiles.length === 0) {
    this.toastr.warning('Vui lòng chọn ít nhất một hình ảnh!', 'Cảnh báo');
    return;
  }

  const formValues = this.productForm.value;
  const idThuongHieu = Number(formValues.idThuongHieu);
  const idDanhMuc = Number(formValues.idDanhMuc);
  const idNhomHuong = Number(formValues.idNhomHuong);
  const idNongDo = Number(formValues.idNongDo);

  // Validate selections
  if (!this.thuongHieuList.some((th) => th.id === idThuongHieu)) {
    this.toastr.warning('Thương hiệu không hợp lệ!', 'Cảnh báo');
    return;
  }
  if (!this.danhMucList.some((dm) => dm.id === idDanhMuc)) {
    this.toastr.warning('Danh mục không hợp lệ!', 'Cảnh báo');
    return;
  }
  if (!this.nhomHuongList.some((nh) => nh.id === idNhomHuong)) {
    this.toastr.warning('Nhóm hương không hợp lệ!', 'Cảnh báo');
    return;
  }
  if (!this.nongDoList.some((nd) => nd.id === idNongDo)) {
    this.toastr.warning('Nồng độ không hợp lệ!', 'Cảnh báo');
    return;
  }

  const validateNotHuong = (ids: number[], type: string) => {
    if (!ids || ids.length === 0) {
      this.toastr.warning(`Vui lòng chọn ít nhất một nốt ${type}!`, 'Cảnh báo');
      return false;
    }
    return ids.every((id: number) => this.notHuongList.some((nh) => nh.id === id));
  };

  if (!validateNotHuong(formValues.notHuongDauIds, 'hương đầu')) return;
  if (!validateNotHuong(formValues.notHuongGiuaIds, 'hương giữa')) return;
  if (!validateNotHuong(formValues.notHuongCuoiIds, 'hương cuối')) return;

  if (!formValues.phongCachIds || formValues.phongCachIds.length === 0) {
    this.toastr.warning('Vui lòng chọn ít nhất một phong cách!', 'Cảnh báo');
    return;
  }

  const invalidPhongCach = formValues.phongCachIds.some(
    (id: number) => !this.phongCachList.some((pc) => pc.id === id)
  );
  if (invalidPhongCach) {
    this.toastr.warning('Một số phong cách không hợp lệ!', 'Cảnh báo');
    return;
  }

  const invalidMuiHuong = this.muiHuongSelections.some(
    (selection) => !this.muiHuongList.some((mh) => mh.id === selection.id)
  );
  if (invalidMuiHuong) {
    this.toastr.warning('Một số mùi hương không hợp lệ!', 'Cảnh báo');
    return;
  }

  this.isSubmitting = true;
  const formData = new FormData();

  formData.append('ten', formValues.ten || '');
  formData.append('moTa', formValues.moTa || '');
  formData.append('idThuongHieu', String(idThuongHieu));
  formData.append('idDanhMuc', String(idDanhMuc));
  formData.append('idNhomHuong', String(idNhomHuong));
  formData.append('idNongDo', String(idNongDo));

  formValues.notHuongDauIds.forEach((id: number) => formData.append('notHuongDauIds', String(id)));
  formValues.notHuongGiuaIds.forEach((id: number) => formData.append('notHuongGiuaIds', String(id)));
  formValues.notHuongCuoiIds.forEach((id: number) => formData.append('notHuongCuoiIds', String(id)));
  formValues.phongCachIds.forEach((id: number) => formData.append('phongCachIds', String(id)));

  const muiHuongSelectionsForBackend = this.muiHuongSelections.map(selection => ({
    id: selection.id,
    prominenceLevel: selection.prominenceLevel
  }));
  formData.append('muiHuongSelections', JSON.stringify(muiHuongSelectionsForBackend));

  this.selectedFiles.forEach((file) => formData.append('images', file));

  try {
    const response = await firstValueFrom(this.sanPhamService.addProductOnAdmin(formData));
    // Construct complete product object
    const completeProduct = {
      idSanPham: response.idSanPham,
      tenSanPham: formValues.ten,
      moTa: formValues.moTa || '',
      tenThuongHieu: this.thuongHieuList.find(th => th.id === idThuongHieu)?.tenThuongHieu || 'Không xác định',
      tenDanhMuc: this.danhMucList.find(dm => dm.id === idDanhMuc)?.tenDanhMuc || 'Không xác định',
      tenNhomHuong: this.nhomHuongList.find(nh => nh.id === idNhomHuong)?.tenNhomHuong || 'Không xác định',
      tenNongDo: this.nongDoList.find(nd => nd.id === idNongDo)?.tenNongDo || 'Không xác định',
      huongDau: formValues.notHuongDauIds.map((id: number) => ({
        id,
        tenNotHuong: this.notHuongList.find(nh => nh.id === id)?.tenNotHuong || 'Không xác định'
      })),
      huongGiua: formValues.notHuongGiuaIds.map((id: number) => ({
        id,
        tenNotHuong: this.notHuongList.find(nh => nh.id === id)?.tenNotHuong || 'Không xác định'
      })),
      huongCuoi: formValues.notHuongCuoiIds.map((id: number) => ({
        id,
        tenNotHuong: this.notHuongList.find(nh => nh.id === id)?.tenNotHuong || 'Không xác định'
      })),
      phongCach: formValues.phongCachIds.map((id: number) => ({
        id,
        tenPhongCach: this.phongCachList.find(pc => pc.id === id)?.tenPhongCach || 'Không xác định'
      })),
      muiHuongSelections: this.muiHuongSelections.map(selection => ({
        id: selection.id,
        tenMuiHuong: this.muiHuongList.find(mh => mh.id === selection.id)?.tenMuiHuong || 'Không xác định',
        prominenceLevel: selection.prominenceLevel
      })),
      huongDauString: formValues.notHuongDauIds
        .map((id: number) => this.notHuongList.find(nh => nh.id === id)?.tenNotHuong || 'Không xác định')
        .join(', '),
      huongGiuaString: formValues.notHuongGiuaIds
        .map((id: number) => this.notHuongList.find(nh => nh.id === id)?.tenNotHuong || 'Không xác định')
        .join(', '),
      huongCuoiString: formValues.notHuongCuoiIds
        .map((id: number) => this.notHuongList.find(nh => nh.id === id)?.tenNotHuong || 'Không xác định')
        .join(', '),
      phongCachString: formValues.phongCachIds
        .map((id: number) => this.phongCachList.find(pc => pc.id === id)?.tenPhongCach || 'Không xác định')
        .join(', '),
      tongSoLuong: 0, // Initially 0 as no SPCT yet
      trangThai: 1, // Assume active
      imageURL: response.imageURL || this.previewUrls[0] || '', // Use backend URL or first preview
      isNew: true // Flag for new product
    };
    this.toastr.success('Thêm sản phẩm thành công!', 'Thành công');
    this.productAdd.emit(completeProduct);
    this.closeModal();
  } catch (err: any) {
    console.error('Lỗi khi thêm sản phẩm:', err);
    let errorMessage = 'Thêm sản phẩm thất bại!';
    if (err.status === 400) {
      errorMessage += ' Dữ liệu không hợp lệ.';
    } else if (err.status === 500) {
      errorMessage += ' Lỗi server.';
    }
    if (err.error?.message) {
      errorMessage += ` Chi tiết: ${err.error.message}`;
    }
    this.toastr.error(errorMessage, 'Lỗi');
  } finally {
    this.isSubmitting = false;
    this.cdr.detectChanges();
  }
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
    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
    }
    // Robust modal cleanup
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
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '';
      this.cdr.detectChanges();
    }, 100);
  }

  // Removed finalizeModalClose as closeModal handles cleanup
}
