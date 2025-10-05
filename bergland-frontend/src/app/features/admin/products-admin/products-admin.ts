import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-admin.html',
  styleUrls: ['./products-admin.css']
})
export class ProductsAdmin implements OnInit {
  products: any[] = [];
  editingProduct: any = null;
  newProduct = { name: '', price: 0 };
  searchTerm: string = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => (this.products = data),
      error: (err) => console.error('Fehler beim Laden der Produkte:', err)
    });
  }

  addProduct(): void {
    if (!this.newProduct.name || this.newProduct.price <= 0) return;

    this.productService.create(this.newProduct).subscribe({
      next: () => {
        this.newProduct = { name: '', price: 0 };
        this.loadProducts();
      },
      error: (err) => console.error('Fehler beim Erstellen:', err)
    });
  }

  editProduct(product: any): void {
    this.editingProduct = { ...product };
  }

  saveProduct(): void {
    if (!this.editingProduct) return;

    this.productService.update(this.editingProduct.id, this.editingProduct).subscribe({
      next: () => {
        this.editingProduct = null;
        this.loadProducts();
      },
      error: (err) => console.error('Fehler beim Speichern:', err)
    });
  }

  deleteProduct(id: string): void {
    if (!confirm('Willst du dieses Produkt wirklich löschen?')) return;

    this.productService.delete(id).subscribe({
      next: () => this.loadProducts(),
      error: (err) => console.error('Fehler beim Löschen:', err)
    });
  }

  cancelEdit(): void {
    this.editingProduct = null;
  }

  // 🔍 Filterfunktion
  get filteredProducts() {
    if (!this.searchTerm.trim()) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter((p) =>
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.price && p.price.toString().includes(term))
    );
  }
}
