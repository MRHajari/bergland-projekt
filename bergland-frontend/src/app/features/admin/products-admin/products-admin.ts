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
  searchTerm = '';
  loading = false;
  errorMessage: string | null = null;

  // 🔹 Pagination
  page = 1;
  pageSize = 10;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = null;

    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Produkte:', err);
        this.errorMessage = '❌ Fehler beim Laden der Produkte.';
        this.loading = false;
      }
    });
  }

  addProduct(): void {
    if (!this.newProduct.name.trim() || this.newProduct.price <= 0) {
      alert('Bitte gib einen gültigen Produktnamen und Preis ein.');
      return;
    }

    this.productService.create(this.newProduct).subscribe({
      next: () => {
        alert(`✅ Produkt "${this.newProduct.name}" hinzugefügt.`);
        this.newProduct = { name: '', price: 0 };
        this.loadProducts();
      },
      error: (err) => {
        console.error('Fehler beim Erstellen:', err);
        alert('❌ Fehler beim Erstellen des Produkts.');
      }
    });
  }

  editProduct(product: any): void {
    this.editingProduct = { ...product };
  }

  saveProduct(): void {
    if (!this.editingProduct) return;

    this.productService.update(this.editingProduct.id, this.editingProduct).subscribe({
      next: () => {
        alert(`💾 Änderungen gespeichert für "${this.editingProduct.name}".`);
        this.editingProduct = null;
        this.loadProducts();
      },
      error: (err) => {
        console.error('Fehler beim Speichern:', err);
        alert('❌ Fehler beim Speichern des Produkts.');
      }
    });
  }

  deleteProduct(id: string, name: string): void {
    if (!confirm(`Willst du das Produkt "${name}" wirklich löschen?`)) return;

    this.productService.delete(id).subscribe({
      next: () => {
        alert(`🗑️ Produkt "${name}" gelöscht.`);
        this.loadProducts();
      },
      error: (err) => {
        console.error('Fehler beim Löschen:', err);
        alert('❌ Fehler beim Löschen des Produkts.');
      }
    });
  }

  cancelEdit(): void {
    this.editingProduct = null;
  }

  // 🔍 Filterfunktion
  get filteredProducts() {
    if (!this.searchTerm.trim()) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.price && p.price.toString().includes(term))
    );
  }

  // 📄 Pagination
  get pagedProducts() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredProducts.length / this.pageSize);
  }
}
