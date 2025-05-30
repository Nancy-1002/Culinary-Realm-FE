import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Cart, CartItem } from '../../shared/models/cart';
import { Product } from '../../shared/models/product';
import { map, Observable, switchMap, tap } from 'rxjs';
import { IngredientProduct } from '../../shared/models/ingredientProduct';
import { ShopService } from './shop.service';
import { DeliveryMethod } from '../../shared/models/delivery';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  baseUrl= environment.apiUrl;
  private http = inject(HttpClient);
  cart = signal<Cart | null>(null);
  shopService = inject(ShopService);
  private coupons = [
    { code: 'WELCOME10', discountAmount: 10, minimumOrderAmount: 100, isActive: true },
    { code: 'DISCOUNT20', discountAmount: 20, minimumOrderAmount: 200, isActive: true },
    { code: 'FREESHIP', discountAmount: 50, minimumOrderAmount: 500, isActive: true },
    { code: 'SPECIAL50', discountAmount: 50, minimumOrderAmount: 300, isActive: true },
    { code: 'INVALID', discountAmount: 0, minimumOrderAmount: 0, isActive: false }
  ];

  coupon = signal<{ code: string, discountAmount: number } | null>(null);


  itemCount = computed(()=>{
    return this.cart()?.items.reduce((sum,item) => sum + item.quantity,0);
  });

  selectedDelivery = signal<DeliveryMethod | null>(null);

  totals = computed(() => {
    const cart = this.cart();
    const delivery = this.selectedDelivery();
    const appliedCoupon = this.coupon();
  
    if (!cart) return null;
  
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = delivery ? delivery.price : 0;
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  
    return {
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount
    };
  });
  
  applyCoupon(code: string): { success: boolean, message: string } {
    const cart = this.cart();
    if (!cart) return { success: false, message: 'Cart is empty' };
  
    const coupon = this.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  
    if (!coupon) return { success: false, message: 'Invalid coupon code' };
    if (!coupon.isActive) return { success: false, message: 'This coupon is no longer active' };
    const orderAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (orderAmount < coupon.minimumOrderAmount) {
      return {
        success: false,
        message: `Minimum order amount of ${coupon.minimumOrderAmount} Rs/- required`
      };
    }
  
    // Apply the coupon
    this.coupon.set({ code: coupon.code, discountAmount: coupon.discountAmount });
    return { success: true, message: 'Coupon applied successfully!' };
  }
  clearCoupon() {
    this.coupon.set(null);
  }
  

  getCart(id: string){
    return this.http.get<Cart>(this.baseUrl + 'cart?id=' + id).pipe(
      map(cart=> {
        this.cart.set(cart);
        return cart;
      })
    )
  }

  setCart(cart: Cart ){
    return this.http.post<Cart>(this.baseUrl + 'cart', cart).subscribe({
      next: (cart) => this.cart.set(cart) 
    })
  }

  addItemToCart(item: CartItem | Product, quantity =1){
    const cart = this.cart() ?? this.createCart();
    if(this.isProduct(item)){
      item = this.mapProductToCartItem(item);
    }
    cart.items = this.addOrUpdateItems(cart.items,item, quantity);
    this.setCart(cart);
  }

  // In your cart service
getIngredientProduct(ingId: number): Observable<number> {
  return this.http.get<IngredientProduct>(this.baseUrl + "IngredientProduct/" + ingId)
    .pipe(
      switchMap(ingredientProduct => 
        this.shopService.getProduct(ingredientProduct.productId).pipe(
          tap(product => {
            this.addItemToCart(product);
          }),
          map(product => product.id) // Return the product ID
        )
      )
    );
}
getIngredientProductId(ingId: number): Observable<number> {
  return this.http.get<IngredientProduct>(this.baseUrl + "IngredientProduct/" + ingId)
    .pipe(
      map(ingredientProduct => ingredientProduct.productId)
    );
}

  removeItemFromCart(productId: number, quantity=1){
    const cart = this.cart();
    if(!cart) return;
    const index = cart.items.findIndex(x => x.productId === productId);
    if(index !== -1){
      if(cart.items[index].quantity > quantity){
        cart.items[index].quantity -= quantity;
      } else{
        cart.items.splice(index,1);
      }
      if(cart.items.length === 0){
        this.deleteCart();
      }
      else{
        this.setCart(cart);
      }
    }
  }
  deleteCart() {
    return this.http.delete(this.baseUrl + 'cart?id=' + this.cart()?.id).subscribe({
      next: () => {
        localStorage.removeItem('cart_id');
        this.cart.set(null);
      } 
    })
  }
  addOrUpdateItems(items: CartItem[],item: CartItem, quantity: number): CartItem[] {
    const index = items.findIndex(x=> x.productId === item.productId);
    if(index===-1){
      item.quantity = quantity;
      items.push(item);
    }
    else{
      items[index].quantity += quantity;
    }
    return items;
  }
  private mapProductToCartItem(item: Product): CartItem {
    return {
      productId: item.id,
      productName: item.name,
      price: item.price,
      quantity:0,
      pictureUrl: item.imgUrl,
      brand: item.brand
    }
  }

  private isProduct(item: CartItem | Product): item is Product{
    return (item as Product).id!== undefined;
  }

  private createCart(): Cart {
    const cart = new Cart();
    localStorage.setItem('cart_id', cart.id);
    return cart;
  }
}
