import { Component,EventEmitter,Output,ChangeDetectorRef,OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddCustomerComponent } from '../add-customer/add-customer.component';
import {EditCustomerComponent} from '../edit-customer/edit-customer.component'
import { CustomerService } from '../../service/customer.service';
// import * as XLSX from 'xlsx'; // ✅ Thêm thư viện xuất Excel
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  providers: [NgbActiveModal]
})
export class CustomerComponent implements OnInit {
  customers: any[] = [];
  filteredCustomers: any[] = [];
  searchQuery: string = '';
  page: number = 0; // Trang hiện tại
  size: number = 5; // Số bản ghi mỗi trang
  totalPages: number = 20; // Tổng số trang

  constructor(private customerService: CustomerService,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  // ✅ Tải danh sách khách hàng có phân trang
  loadCustomers() {
    console.log('📌 Gọi API với:', this.page, this.size);

    this.customerService.getCustomers(this.page, this.size).subscribe({
      next: (response) => {
        console.log('✅ API response:', response);
        this.customers = response.content || [];
        this.filteredCustomers = response.content || [];
        this.totalPages = response.page?.totalPages || 1;// Nếu `totalPages` bị null, đặt mặc định là 1
      },
      error: (error) => {
        console.error('❌ Lỗi khi lấy dữ liệu khách hàng:', error);
      }
    });
  }



  // 🔍 Tìm kiếm khách hàng
  searchCustomer() {
    this.page = 0; // Reset về trang đầu
    this.loadCustomers();
  }

  // 🔄 Phân trang
  goToPage(p: number) {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
      this.page = p;
      this.loadCustomers();
    }
  }


  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadCustomers();
    }
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadCustomers();
    }
  }

  // 🔢 Cập nhật cách lấy danh sách số trang hiển thị
  getPaginationRange(): number[] {
    let range: number[] = [];
    let start = Math.max(0, this.page - 2);
    let end = Math.min(this.totalPages, this.page + 3);

    for (let i = start; i < end; i++) {
      range.push(i);
    }

    console.log('📌 Pagination range:', range); // Debug
    return range;
  }


  openAddCustomerModal() {
    const modalRef = this.modalService.open(AddCustomerComponent, { backdrop: 'static', keyboard: false });

    // Nhận dữ liệu khách hàng mới từ modal
    modalRef.componentInstance.customerAdded.subscribe((newCustomer: any) => {
      console.log('🎉 Khách hàng mới:', newCustomer);
      this.customers.unshift(newCustomer); // ✅ Thêm vào đầu danh sách
    });
  }

  // 📝 Mở modal chỉnh sửa khách hàng
  openUpdateCustomerModal(customer: any) {
    console.log('✏️ Đang mở modal chỉnh sửa khách hàng:', customer);

    // ✅ Mở modal chỉnh sửa khách hàng
    const modalRef = this.modalService.open(EditCustomerComponent, { backdrop: 'static', keyboard: false });

    // ✅ Truyền dữ liệu khách hàng vào modal
    modalRef.componentInstance.customerData = customer;

    // ✅ Nhận dữ liệu sau khi cập nhật
    modalRef.componentInstance.customerUpdated.subscribe((updatedCustomer: any) => {
        console.log('✅ Khách hàng đã được cập nhật:', updatedCustomer);
        this.loadCustomers(); // ✅ Load lại danh sách khách hàng
        modalRef.close();
    });
}

// Bỏ xóa Khách hàng
//   // ❌ Xóa khách hàng
//   deleteCustomer(id: number) {
//     if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
//         this.customerService.deleteCustomer(id).subscribe({
//             next: () => {
//                 console.log('✅ Xóa khách hàng thành công!');
//                 alert('🗑 Xóa khách hàng thành công!');
//                 this.loadCustomers(); // ✅ Load lại danh sách
//             },
//             error: (error) => {
//                 console.error('❌ Lỗi khi xóa khách hàng:', error);
//                 alert('❌ Không thể xóa khách hàng. Vui lòng thử lại!');
//             }
//         });
//     }
// }
openInvoice(id:number){
  alert('📤 Cái này chưa làm nhá!');
}

  // 📤 Xuất Excel
  exportToExcel() {
    // const worksheet = XLSX.utils.json_to_sheet(this.customers);
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách khách hàng');

    // XLSX.writeFile(workbook, 'danh_sach_khach_hang.xlsx');
    // alert('📤 Xuất Excel thành công!');
    alert('📤 Cái này chưa làm nhá!');
  }
}
