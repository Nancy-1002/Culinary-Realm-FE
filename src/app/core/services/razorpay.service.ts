import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartService } from './cart.service';
import { Cart } from '../../shared/models/cart';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccountService } from './account.service';
import { User } from '../../shared/models/user';
import { SnackbarService } from './snackbar.service';
import { Router } from '@angular/router';

declare var Razorpay: any;  

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {
  baseUrl = environment.apiUrl;
  private cartService = inject(CartService);
  private http = inject(HttpClient);
  private user: User | null = null;
  private accountService = inject(AccountService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);
  
  async createPaymentIntent() {
    return new Promise((resolve, reject) => {
      const options = {
        key: environment.razorpayPublicKey,
        amount: 50000, // 50000 paise = ₹500
        currency: 'INR',
        name: 'Culinary Realm',
        description: 'Order Payment',
        handler: (response: any) => {
          console.log('Payment Successful!', response);
          resolve(response);
        },
        prefill: {
          name: this.user?.firstName + ' ' + this.user?.lastName,
          email: this.user?.email || 'customer@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    });
  }

  async confirmPayment() {
    try {
      const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());
  
      if (!cart || !cart.clientSecret) {
        this.snackbar.error("Payment initialization failed. Please try again.");
        return;
      }
  
      const options = {
        key: environment.razorpayPublicKey,
        amount: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100,
        currency: 'INR',
        name: 'Culinary Realm',
        description: 'Order Payment',
        order_id: cart.clientSecret, // Use clientSecret as order ID
        prefill: {
          name: this.user?.firstName + ' ' + this.user?.lastName,
          email: this.user?.email || 'customer@example.com',
          contact: '9999999999',
        },
        notes: {
          address: this.user?.address || '',
        },
        theme: {
          color: '#3399cc',
        },
        handler: async (response: any) => {
          console.log('Payment Successful:', response);
          this.snackbar.success('Payment Successful!');
          this.router.navigate(['/chefsquarters']);
          try {
            await firstValueFrom(this.http.post<Cart>(`${this.baseUrl}payments/${cart.id}`, {}));
            this.snackbar.success('Order confirmed!');
          } catch (error: any) {
            this.snackbar.error('Payment verification failed: ' + error.message);
          }
        },
        modal: {
          ondismiss: () => {
            this.snackbar.error('Payment cancelled by user.');
          }
        }
      };
  
      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
  
    } catch (error) {
      console.error('Payment initialization failed:', error);
      this.snackbar.error('Payment process could not be started.');
    }
  }
  
  
  async initializeRazorpayPayment() {
    try {
      const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());
      if (!cart || !cart.clientSecret) {
        throw new Error('Failed to get payment intent from the server');
      }

      return new Promise((resolve, reject) => {
        const options = {
          key: environment.razorpayPublicKey,
          amount: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100, 
          currency: 'INR',
          name: 'Culinary Realm',
          description: 'Order Payment',
          order_id: cart.clientSecret,
          handler: (response: any) => {
            console.log('Payment Successful!', response);
            resolve(response);
          },
          prefill: {
            name: this.user?.firstName + ' ' + this.user?.lastName,
            email: this.user?.email || 'customer@example.com',
            contact: '9999999999',
          },
          notes: {
            address: this.user?.address
          },
          theme: {
            color: '#3399cc',
          },
        };

        const razorpayInstance = new Razorpay(options);
        razorpayInstance.open();
      });

    } catch (error) {
      console.error('Payment initialization failed:', error);
      throw error;
    }
  }

  createOrUpdatePaymentIntent() {
    const cart = this.cartService.cart();
    if (!cart) throw new Error('Problem with cart');
    return this.http.post<Cart>(`${this.baseUrl}payments/${cart.id}`, {}).pipe(
      map(cart => {
        this.cartService.setCart(cart);
        return cart;
      })
    );
  }

  getUserInfo(){
    return this.accountService.getUserInfo().pipe(
      map(user => {
        return user;
      })
    );
  }
}
