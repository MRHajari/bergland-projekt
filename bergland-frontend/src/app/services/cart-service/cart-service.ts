import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartKey = 'cart';

  getCart(): any[] {
    const stored = localStorage.getItem(this.cartKey);
    return stored ? JSON.parse(stored) : [];
  }

  addToCart(product: any) {
    const cart = this.getCart();
    cart.push(product);
    localStorage.setItem(this.cartKey, JSON.stringify(cart));
  }

  removeFromCart(index: number) {
    const cart = this.getCart();
    cart.splice(index, 1);
    localStorage.setItem(this.cartKey, JSON.stringify(cart));
  }

  clearCart() {
    localStorage.removeItem(this.cartKey);
  }
}
