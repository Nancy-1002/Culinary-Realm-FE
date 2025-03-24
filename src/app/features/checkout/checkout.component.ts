import { Component, inject, OnInit, signal } from '@angular/core';
import { OrderSummaryComponent } from "../../shared/components/order-summary/order-summary.component";
import { MatStepperModule } from '@angular/material/stepper';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { RazorpayService } from '../../core/services/razorpay.service';
import { Address } from '../../shared/models/user';
import { SnackbarService } from '../../core/services/snackbar.service';
import { CommonModule } from '@angular/common';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { firstValueFrom } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { ChangeDetectorRef } from '@angular/core';
import { DeliveryComponent } from "./delivery/delivery.component";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { CardDetails, OrderToCreate, ShippingAddress } from '../../shared/models/order';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    OrderSummaryComponent,
    MatStepperModule,
    RouterLink,
    MatButton,
    CommonModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    FormsModule,
    MatCheckboxModule,
    DeliveryComponent,
    ReactiveFormsModule
],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  razorpayService = inject(RazorpayService);
  private snackbar = inject(SnackbarService);
  private accountService = inject(AccountService);
  private orderService = inject(OrderService);
  cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);
  saveAddress = false;
  fullName: string = '';
  address: Address = {
    line1: '',
    line2: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  };
  

  countries: string[] = ['United States', 'India', 'Canada', 'Australia', 'United Kingdom', 'Germany', 'France', 'China', 'Japan'];
  


  ngOnInit() {
    this.loadUserDetails();
  }

  private async loadUserDetails() {
    try {
      const user = await firstValueFrom(this.razorpayService.getUserInfo());
      if (user) {
        this.fullName = `${user.firstName} ${user.lastName}`;
        if (user.address) {
          this.address = { ...user.address };
          this.cdr.detectChanges(); // Ensures UI update
        }
      }
    } catch (error: any) {
      this.snackbar.error(error.message);
    }
  }

  async onStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === 1 && this.saveAddress) {
      try {
        await firstValueFrom(this.accountService.updateAddress(this.address));
        this.loadUserDetails(); // Reload user data after updating address
      } catch (error: any) {
        this.snackbar.error('Failed to save address: ' + error.message);
      }
    }
  }
   

  private async createOrderModel(cardDetails: CardDetails): Promise<OrderToCreate> {
    const cart = this.cartService.cart();
    const shippingAddress = await this.getAddressFromRazorpay() as ShippingAddress;
    
    // Get complete payment response from Razorpay service
    const paymentResponse = this.razorpayService.getPaymentInfo();
    
    if (!paymentResponse) {
      throw new Error('No payment information available');
    }
    if(!cart?.id || !cart.deliveryMethodId || !cardDetails || !shippingAddress){
      throw new Error("Problem creating order")
    }
    // Return the complete order model
    const order: OrderToCreate = {
      cartId: cart.id,
      paymentSummary: {
        last4: 1111,
        brand: cardDetails.cardType,
        expMonth: 12,
        year: 2025
      },
      deliveryMethodId: cart.deliveryMethodId,
      shippingAddress
    }
    return order;
  }

  async getAddressFromRazorpay(): Promise<Address | ShippingAddress | null> {
    try {
      const userInfo = await firstValueFrom(this.razorpayService.getUserInfo());

      if (userInfo?.address) {
        const fullName = `${userInfo.firstName} ${userInfo.lastName}`;
        return { ...userInfo.address, name: fullName };
      }

      return null;
    } catch (error: any) {
      this.snackbar.error(error.message);
      return null;
    }
  }

  onSaveAddressCheckboxChange(event: MatCheckboxChange) {
    this.saveAddress = event.checked;
  }

  async processPayment() {
    if (!this.address.line1 || !this.address.city || !this.address.zipCode) {
      this.snackbar.error("Please fill in all required address fields");
      return;
    }
  
    try {
      const paymentResponse = await this.razorpayService.initializeRazorpayPayment();
      console.log("Payment response in processPayment:", paymentResponse);
      
      // Now immediately confirm order after successful payment
      await this.confirmPayment(); 
    } catch (err) {
      this.snackbar.error("Failed to initiate payment.");
    }
  }
  
  
  async confirmPayment() {
    try {
      const frontendPaymentResponse = this.razorpayService.getPaymentInfo();
  
      if (!frontendPaymentResponse || !frontendPaymentResponse.razorpay_payment_id) {
        this.snackbar.error('Payment not successful. Please try again.');
        return;
      }
  
      // Fetch card details from backend using payment ID
      const backendCardDetails = await firstValueFrom(
        this.razorpayService.getCardDetails(frontendPaymentResponse.razorpay_payment_id)
      );
  
      if (!backendCardDetails) {
        this.snackbar.error('Unable to retrieve card details from backend.');
        return;
      }
  
      // Create order model with backend card details
      const orderModel = await this.createOrderModel(backendCardDetails);
      console.log('Order model:', orderModel);
  
      const orderResult = await firstValueFrom(this.orderService.createOrder(orderModel));
      console.log('Order result:', orderResult);
  
      if (orderResult) {
        this.cartService.deleteCart();
        orderResult.status = 'success';
        this.cartService.selectedDelivery.set(null);
        this.snackbar.success('Order placed successfully!');
      } else {
        throw new Error('Order creation failed');
      }
    } catch (error: any) {
      this.snackbar.error('Failed to confirm payment: ' + error.message);
    }
  }
  
  
}