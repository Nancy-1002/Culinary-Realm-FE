import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartService } from './cart.service';
import { Cart } from '../../shared/models/cart';
import { firstValueFrom, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccountService } from './account.service';
import { User } from '../../shared/models/user';
import { SnackbarService } from './snackbar.service';
import { Router } from '@angular/router';
import { CardDetails } from '../../shared/models/order';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  card?: {
    network?: string;
    last4?: string;
    name?: string;
  };
  card_id?: string;
  card_type?: string;
  last4?: string;
  name_on_card?: string;
  auth_code?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes?: {
    address: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
}

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {
  private baseUrl = environment.apiUrl;
  private cartService = inject(CartService);
  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);

  private _paymentInfo = signal<RazorpayResponse | null>(null);
  private _userInfo = signal<User | null>(null);

  constructor() {
    this.loadUserInfo();
  }

  private async loadUserInfo(): Promise<void> {
    try {
      const user = await firstValueFrom(this.getUserInfo());
      this._userInfo.set(user);
    } catch (error) {
      console.error('Failed to load user info', error);
    }
  }

  storePaymentInfo(paymentResponse: RazorpayResponse): void {
    this._paymentInfo.set(paymentResponse);
  }
  getCardDetails(paymentId: string) {
    return this.http.get<CardDetails>(this.baseUrl + 'payments/card-details/'+ paymentId);
  }
  
  getPaymentInfo(): RazorpayResponse | null {
    console.log("getPaymentInfo called");
    console.log(this._paymentInfo());
    return this._paymentInfo();
  }

  createOrUpdatePaymentIntent(): Observable<Cart> {
    const cart = this.cartService.cart();
    if (!cart) throw new Error('Problem with cart');

    return this.http.post<Cart>(`${this.baseUrl}payments/${cart.id}`, {}).pipe(
      map(cart => {
        this.cartService.setCart(cart);
        return cart;
      })
    );
  }

  getUserInfo(): Observable<User> {
    return this.accountService.getUserInfo();
  }

  async initializeRazorpayPayment(): Promise<RazorpayResponse> {
    try {
      const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());

      if (!cart || !cart.clientSecret) {
        throw new Error('Failed to get payment intent from the server');
      }

      const amount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100;
      const user = this._userInfo() || await firstValueFrom(this.getUserInfo());

      // This handler will be used in the Razorpay options and the instance
      const paymentHandler = (response: RazorpayResponse) => {
        console.log('Payment Successful!', response);
        this.storePaymentInfo(response);
        this.handleSuccessfulPayment(cart.id, response);
      };

      const options: RazorpayOptions = {
        key: environment.razorpayPublicKey,
        amount: amount,
        currency: 'INR',
        name: 'Culinary Realm',
        description: 'Order Payment',
        order_id: cart.clientSecret,
        handler: paymentHandler,
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}` : 'Customer',
          email: user?.email || 'customer@example.com',
          contact: '9999999999'
        },
        notes: {
          address: user?.address ? JSON.stringify(user.address) : ''
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => {
            this.snackbar.error('Payment cancelled by user.');
          }
        }
      };

      return new Promise<RazorpayResponse>((resolve, reject) => {
        try {
          const razorpayInstance = new Razorpay({
            ...options,
            handler: (response: RazorpayResponse) => {
              this.storePaymentInfo(response);
              this.handleSuccessfulPayment(cart.id, response);
              resolve(response); // resolves for frontend
            }
          });
          razorpayInstance.open();
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error('Payment initialization failed:', error);
      this.snackbar.error('Payment process could not be started.');
      throw error;
    }
  }

  private async handleSuccessfulPayment(cartId: string, response: RazorpayResponse): Promise<void> {
    try {
      this.snackbar.success('Payment Successful!');
  
      await firstValueFrom(this.http.post(`${this.baseUrl}payments/verify`, {
        cartId: cartId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      }));
  
      // Only confirm verification here
      this.snackbar.success('Payment verified!');
    } catch (error: any) {
      console.error('Verification failed:', error);
      this.snackbar.error('Payment verification failed: ' + error.message);
    }
  }
  
}
