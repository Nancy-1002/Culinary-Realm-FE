import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Pagination } from '../../shared/models/pagination';
import { ShopParams } from '../../shared/models/shopParams';
import { Product } from '../../shared/models/product';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  baseUrl = 'https://localhost:7170/api/';
  private http = inject(HttpClient);

  getProducts(shopParams: ShopParams){
    let params = new HttpParams();

    if(shopParams.sort) {
      params = params.append('sort', shopParams.sort);
    }

    if(shopParams.search) {
      params = params.append('search',shopParams.search);
    }
    params = params.append('pageSize',shopParams.pageSize);
    params = params.append('pageIndex',shopParams.pageNumber);

    return this.http.get<Pagination<Product>>(this.baseUrl + 'products', {params});
  }

  getProduct(id: number){
    return this.http.get<Product>(this.baseUrl + 'products/' + id);
  }


}


