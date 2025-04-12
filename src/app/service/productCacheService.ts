import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductCacheService {
  private allProducts: any[] = [];
  private products: any[] = [];

  setAllProducts(allProducts: any[]): void {
    this.allProducts = allProducts;
  }

  getAllProducts(): any[] {
    return this.allProducts;
  }

  setProducts(products: any[]): void {
    this.products = products;
  }

  getProducts(): any[] {
    return this.products;
  }

  clearCache(): void {
    this.allProducts = [];
    this.products = [];
  }
}