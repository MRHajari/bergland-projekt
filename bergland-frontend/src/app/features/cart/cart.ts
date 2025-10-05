import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart-service/cart-service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart implements OnInit {
  items: any[] = [];
  total = 0;
  statusMessage = '';

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();

    // Prüfen, ob Stripe Redirect-Status im URL ist
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status === 'success') {
      this.statusMessage = '✅ Payment successful! Thank you.';
      this.cartService.clearCart();
    } else if (status === 'cancel') {
      this.statusMessage = '❌ Payment canceled. Please try again.';
    }
  }

  loadCart() {
    this.items = this.cartService.getCart();
    this.calculateTotal();
  }

  remove(index: number) {
    this.cartService.removeFromCart(index);
    this.loadCart();
  }

  clear() {
    this.cartService.clearCart();
    this.loadCart();
  }

  calculateTotal() {
    this.total = this.items.reduce((sum, item) => sum + (item.price || 0), 0);
  }

  checkout() {
    fetch('http://localhost:3000/api/payment-integration/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: this.items,
        userId: localStorage.getItem('userId') || null
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          window.location.href = data.url; // Weiterleitung zu Stripe Checkout
        } else {
          alert('Failed to create checkout session.');
        }
      })
      .catch(() => alert('Checkout failed. Please try again.'));
  }
}
