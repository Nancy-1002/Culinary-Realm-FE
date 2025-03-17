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
    MatError,
    ReactiveFormsModule
],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  razorpayService = inject(RazorpayService);
  private snackbar = inject(SnackbarService);
  private accountService = inject(AccountService);
  cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);
  checkoutForm: FormGroup;
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
  constructor(private fb: FormBuilder) {
    this.checkoutForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]], // Ensures exactly 16 digits
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]], // Format: MM/YY
      securityCode: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]], // 3 or 4 digits
      billingSameAsShipping: [true]
    });
  }
  get cardNumberError() {
    const cardCtrl = this.checkoutForm.get('cardNumber');
    if (cardCtrl?.hasError('required')) {
      return 'Card number is required';
    } else if (cardCtrl?.hasError('pattern')) {
      return 'Card number must be exactly 16 digits';
    }
    return null;
  }


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

  async getAddressFromRazorpay(): Promise<Address | null> {
    try {
      const userInfo = await firstValueFrom(this.razorpayService.getUserInfo());
      return userInfo?.address ? { ...userInfo.address } : null;
    } catch (error: any) {
      this.snackbar.error(error.message);
      return null;
    }
  }

  onSaveAddressCheckboxChange(event: MatCheckboxChange) {
    this.saveAddress = event.checked;
  }

  processPayment() {
    if (!this.address.line1 || !this.address.city || !this.address.zipCode) {
      alert("Please fill in all required address fields");
      return;
    }
    this.razorpayService.initializeRazorpayPayment();
  }
}
