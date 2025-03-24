import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { RouterLink } from '@angular/router';
import {MatInput} from '@angular/material/input';
import { CartService } from '../../../core/services/cart.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [
    MatButton,
    RouterLink,
    MatFormField,
    MatLabel,
    MatInput,
    CommonModule,
    FormsModule
  ],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss'
})
export class OrderSummaryComponent {
  cartService = inject(CartService);
  location = inject(Location);
  couponCode = '';
  message = '';
  messageColor = ''; 
  applyCoupon() {
    const result = this.cartService.applyCoupon(this.couponCode.trim());
    this.message = result.message;
    this.messageColor = result.success ? 'green' : 'red';
  }
}
