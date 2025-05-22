import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TraHangService } from '../service/TraHangService';
import { TokenService } from '../service/token.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-tra-hang-user',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,HeaderComponent,FooterComponent
  ],
  templateUrl: './tra-hang-user.component.html',
  styleUrls: ['./tra-hang-user.component.scss']
})
export class TraHangUserComponent implements OnInit, OnDestroy {
  @Input() idTaiKhoan: number | null = null;
  yeuCauList: any[] = [];
  lichSuList: any[] = [];
  selectedYeuCau: number | null = null;
  showHistory: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  private routeSubscription: Subscription | undefined;

  // Biến cho phân trang
  currentPage: number = 1;
  pageSize: number = 10; // 10 yêu cầu mỗi trang
  totalPages: number = 1;
  paginatedYeuCauList: any[] = []; // Danh sách yêu cầu hiển thị trên trang hiện tại

  constructor(
    private traHangService: TraHangService, 
    private tokenService: TokenService,
    private route: ActivatedRoute
  ) {
    this.idTaiKhoan = this.tokenService.getUserId();
  }

  ngOnInit(): void {
    if (!this.idTaiKhoan) {
      this.error = 'Không thể lấy ID tài khoản từ token. Vui lòng đăng nhập lại.';
      return;
    }
    this.loadYeuCauList();
    
    this.routeSubscription = this.route.params.subscribe(params => {
      const idYeuCau = +params['id'];
      if (idYeuCau) {
        this.selectedYeuCau = idYeuCau;
        this.showHistory = true;
        this.loadLichSu(idYeuCau);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadYeuCauList(): void {
    this.loading = true;
    this.traHangService.getYeuCauByTaiKhoan(this.idTaiKhoan!).subscribe({
      next: (data) => {
        // Sắp xếp theo ID giảm dần
        this.yeuCauList = data.sort((a: any, b: any) => b.id - a.id);
        this.loading = false;
        console.log('Danh sách yêu cầu (sắp xếp giảm dần):', this.yeuCauList);

        // Tính toán phân trang
        this.totalPages = Math.ceil(this.yeuCauList.length / this.pageSize);
        this.updatePaginatedList();
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách yêu cầu trả hàng';
        this.loading = false;
      }
    });
  }

  loadLichSu(idYeuCau: number): void {
    if (this.selectedYeuCau === idYeuCau && this.lichSuList.length > 0) {
      return;
    }

    this.lichSuList = [];
    this.selectedYeuCau = idYeuCau;
    this.showHistory = true;
    this.loading = true;

    this.traHangService.getLichSuByYeuCauTraHang(idYeuCau).subscribe({
      next: (data) => {
        this.lichSuList = data;
        this.loading = false;
        console.log('Danh sách lịch sử:', data);
      },
      error: (err) => {
        this.error = 'Không thể tải lịch sử trả hàng';
        this.lichSuList = [];
        this.loading = false;
      }
    });
  }

  // Cập nhật danh sách phân trang
  updatePaginatedList(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedYeuCauList = this.yeuCauList.slice(startIndex, endIndex);
  }

  // Chuyển đến trang trước
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedList();
    }
  }

  // Chuyển đến trang sau
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedList();
    }
  }

  // Chuyển đến trang cụ thể
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedList();
    }
  }
}