import { Component, inject, OnInit } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../shared/models/product';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    MatIcon,
    CommonModule 
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit  {
  private shopService = inject(ShopService);
  private activatedRoute = inject(ActivatedRoute);
  product?: Product;
  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) return;
    
    this.shopService.getProduct(+id).subscribe({
      next: (response) => {
        this.product = response;
      },
      error: (error) => console.log(error)
    });
  }
}


