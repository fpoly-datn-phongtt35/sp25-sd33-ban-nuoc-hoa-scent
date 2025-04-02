import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root', // Đảm bảo service này có thể sử dụng ở mọi nơi
})
export class SanPhamService {
  private apiURL = 'http://localhost:8080/rest/san-pham/All'; // URL của API
  private baseUrl = 'http://localhost:8080/rest/san-pham';
  private apiSearch = 'http://localhost:8080/rest/san-pham/search';
  private apiSearchdm = 'http://localhost:8080/rest/san-pham/search-danhmuc';
private apiDanhMuc='http://localhost:8080/rest/danh-muc/getAll'
private apiSearchonAmin='http://localhost:8080/rest/san-pham/search-product-on-admin'
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
  getProductsByAllField(
    category: string,
    scent: string,
    brand: string,
    country: string,
    page: number = 0,
    pageSize: number = 12
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString()) // Truyền tham số trang
      .set('pageSize', pageSize.toString()); // Truyền tham số số lượng sản phẩm mỗi trang

    // Chỉ thêm các tham số khi có giá trị
    if (category) params = params.set('tenDanhMuc', category);
    if (scent) params = params.set('tenNhomHuong', scent);
    if (brand) params = params.set('tenThuongHieu', brand);
    if (country) params = params.set('quocGia', country);

    // Thực hiện gọi API
    console.log('Gọi API với tham số: ', params);
    return this.http.get<any>(this.apiSearchdm, { params });
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

}
