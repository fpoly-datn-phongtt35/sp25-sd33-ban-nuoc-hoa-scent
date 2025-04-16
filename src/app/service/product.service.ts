import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root', // Đảm bảo service này có thể sử dụng ở mọi nơi
})
export class SanPhamService {
  searchcccccascacProducts(searchKeyword: string) {
    throw new Error('Method not implemented.');
  }
  private bassseUrl = 'http://localhost:8080/rest';
  private apiURL = 'http://localhost:8080/rest/san-pham/All'; // URL của API
  private baseUrl = 'http://localhost:8080/rest/san-pham';
  private apiSearch = 'http://localhost:8080/rest/san-pham/search';
private apiDanhMuc='http://localhost:8080/rest/danh-muc/getAll';
private apiSearchonAmin='http://localhost:8080/rest/san-pham/search-product-on-admin';
private apiURLbb = 'http://localhost:8080/rest/san-pham/search-combined'; // API mới

  constructor(private http: HttpClient) {
    console.log('SanPhamService đã được khởi tạo.');
  }

  // Phương thức để lấy danh sách sản phẩm
  getSanPhamDetails(page: number = 0, size: number = 12): Observable<any> {
    console.log(`Requesting API: ${this.apiURL}?page=${page}&size=${size}`);
    return this.http.get<any>(`${this.apiURL}?page=${page}&size=${size}`);
  }
  getSanPhamDetailonAdmin(query: string,page: number = 0, size: number = 12): Observable<any> {
    console.log(`Requesting API: ${this.apiSearchonAmin}?keyword=${query}&page=${page}&size=${size}`);
    return this.http.get<any>(`${this.apiSearchonAmin}?keyword=${query}&page=${page}&size=${size}`);
  }

  getProductVolumes(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/volums/${productId}`);
  }
  public searchProducts(query: string, page: number, pageSize: number=12): Observable<any> {
    let params = new HttpParams()
      .set('searchQuery', query)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<any>(this.apiSearch, { params });
  }
  searchSanPhamByPrice(minPrice: number, maxPrice: number, page: number, pageSize: number=12): Observable<any> {
    let params = new HttpParams()
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString())
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<any>(`${this.baseUrl}/search-price`, { params });
  }

  getCategories(): Observable<any> {
    return this.http.get<any>(this.apiDanhMuc);
  }
  searchFilterSanPham(queryParams: any): Observable<any> {
    let params = new HttpParams();

    // Chỉ thêm tham số nếu giá trị không phải null, undefined, hoặc chuỗi rỗng
    if (queryParams.searchQuery != null && queryParams.searchQuery !== '') {
      params = params.set('searchQuery', queryParams.searchQuery);
    }
    if (queryParams.minPrice != null && queryParams.minPrice !== '') {
      params = params.set('minPrice', queryParams.minPrice.toString());
    }
    if (queryParams.maxPrice != null && queryParams.maxPrice !== '') {
      params = params.set('maxPrice', queryParams.maxPrice.toString());
    }
    if (queryParams.tenDanhMuc != null && queryParams.tenDanhMuc !== '') {
      params = params.set('tenDanhMuc', queryParams.tenDanhMuc);
    }
    if (queryParams.tenNhomHuong != null && queryParams.tenNhomHuong !== '') {
      params = params.set('tenNhomHuong', queryParams.tenNhomHuong);
    }
    if (queryParams.tenThuongHieu != null && queryParams.tenThuongHieu !== '') {
      params = params.set('tenThuongHieu', queryParams.tenThuongHieu);
    }
    if (queryParams.quocGia != null && queryParams.quocGia !== '') {
      params = params.set('quocGia', queryParams.quocGia);
    }
    if (queryParams.sort != null && queryParams.sort !== '') {
      params = params.set('sort', queryParams.sort); // Thêm tham số sort
    }

    // page và size luôn được gửi, với giá trị mặc định nếu không có
    params = params.set('page', queryParams.page?.toString() || '0');
    params = params.set('size', queryParams.size?.toString() || '12');

    return this.http.get<any>(this.apiURLbb, { params });
  }

addProductOnAdmin(formData: FormData): Observable<any> {
  const url = `${this.baseUrl}/add`;
  return this.http.post<any>(url, formData);
}
updateSanPham(formData: FormData) {
  return this.http.put<any>('http://localhost:8080/rest/san-pham/update', formData);
}
getSanPhamById(id: number) {
  return this.http.get<any>(`http://localhost:8080/rest/san-pham/findById?id=${id}`);
}

getImagesByProductId(id: number) {
  return this.http.get<any[]>(`http://localhost:8080/rest/san-pham/findAllHinhAnhById?id=${id}`);
}
// Lấy danh sách mùi hương
getMuiHuong(): Observable<any[]> {
  return this.http.get<any[]>(`${this.bassseUrl}/mui-huong/getAll`);
}

// Lấy danh sách nốt hương
getNotHuong(): Observable<any[]> {
  return this.http.get<any[]>(`${this.bassseUrl}/not-huong/getAll`);
}

// Lấy danh sách phong cách
getPhongCach(): Observable<any[]> {
  return this.http.get<any[]>(`${this.bassseUrl}/phong-cach/getAll`);
}
// Thêm các phương thức để gọi API thêm mới
addNotHuong(body: any): Observable<any> {
  return this.http.post<any>(`${this.bassseUrl}/not-huong/add`, body);
}

addMuiHuong(body: any): Observable<any> {
  return this.http.post<any>(`${this.bassseUrl}/mui-huong/add`, body);
}

addPhongCach(body: any): Observable<any> {
  return this.http.post<any>(`${this.bassseUrl}/phong-cach/add`, body);
}
updateSanPhamTrangThai(id: number, trangThai: number): Observable<any> {
  return this.http.put(`${this.baseUrl}/updateTrangThai/${id}?trangThai=${trangThai}`, null);
}
getMultipleProductStatuses(idSpcts: number[]): Observable<{ [key: number]: number }> {
  let params = new HttpParams();
  params = params.set('idSpcts', idSpcts.join(','));

  return this.http.get<{ [key: number]: number }>(`${this.baseUrl}/statuses`, { params }).pipe(
    catchError((error) => {
      console.error('Lỗi khi lấy trạng thái của Spct:', error);
      return throwError(() => new Error('Không thể lấy trạng thái của Spct'));
    })
  );
}

}
