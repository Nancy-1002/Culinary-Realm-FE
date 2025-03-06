import { Component, inject, OnInit } from '@angular/core';
import { ProductItemsComponent } from './product-items/product-items.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Pagination } from '../../shared/models/pagination';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Product } from '../../shared/models/product';
import { ShopService } from '../../core/services/shop.service';
import { ShopParams } from '../../shared/models/shopParams';
@Component({
  selector: 'app-shop',
  imports: [
    ProductItemsComponent,
    MatButton,
    MatIcon,
    MatMenu,
    MatSelectionList,
    MatListOption,
    MatMenuTrigger,
    MatPaginator,
    FormsModule
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {
  private shopService = inject(ShopService);

  products?: Pagination<Product>;
  searchQuery: string = ''; 
  private searchSubject = new Subject<string>(); 
  selectedSort: string = 'name';
  sortOptions = [
    { name: 'Alphabetical', value: 'name' },
    { name: 'Price (Low to High)', value: 'priceAsc' },
    { name: 'Price (High to Low)', value: 'priceDesc' },
  ];

  shopParams = new ShopParams();
  pageSizeOptions = [4, 8, 12, 16, 20];

  ngOnInit(): void {
    this.initializeQuarters();
    this.searchSubject.pipe(
      debounceTime(300), 
      distinctUntilChanged() 
    ).subscribe(searchTerm => {
      this.shopParams.search = searchTerm; 
      this.shopParams.pageNumber = 1;
      this.getProducts();
    });
  }

  initializeQuarters() {
    this.getProducts();
  }

  getProducts() {
    this.shopService.getProducts(this.shopParams).subscribe({
      next: response => this.products = response,
      error: error => console.log(error)
    });
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
    this.searchSubject.next(value); // Emit the new value
  }
  onSortChange(event: MatSelectionListChange) {
      const selectedOption = event.options[0];
      if (selectedOption) {
        this.shopParams.sort = selectedOption.value;
        this.shopParams.pageNumber = 1;
        this.getProducts();
      }
    }
  

  handlePageEvent(event: PageEvent) {
    this.shopParams.pageNumber = event.pageIndex + 1;
    this.shopParams.pageSize = event.pageSize;
    this.getProducts();
  }
}



