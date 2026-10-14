import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../core/services/product.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-admin.html',
  styleUrls: ['../admin-shared.css']
})
export class ProductsAdmin implements OnInit {
  products: Product[] = [];
  editingProduct: Product | null = null;
  showCreateForm = false;

  newProduct: Partial<Product> = {
    produkt_name: '',
    beschreibung: '',
    preis: 0,
    mwst_satz: 19,
    gueltig_von: '',
    gueltig_bis: ''
  };

  searchTerm = '';
  loading = false;
  errorMessage: string | null = null;

  // 🔹 Pagination
  page = 1;
  pageSize = 10;

  constructor(private productService: ProductService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // ============================================
  // 🔄 Produkte laden
  // ============================================
  loadProducts(): void {
    this.loading = true;
    this.errorMessage = null;

    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
        console.log('✅ Produkte geladen:', data);
      },
      error: (err) => {
        console.error('❌ Fehler beim Laden der Produkte:', err);
        this.errorMessage = '❌ Fehler beim Laden der Produkte.';
        this.loading = false;
      }
    });
  }

  // ============================================
  // ➕ Neues Produkt hinzufügen
  // ============================================
  addProduct(): void {
    if (!this.newProduct.produkt_name?.trim() || (this.newProduct.preis ?? 0) <= 0) {
      alert('Bitte gib einen gültigen Produktnamen und Preis ein.');
      return;
    }

    this.productService.create(this.newProduct).subscribe({
      next: () => {
        alert(`✅ Produkt "${this.newProduct.produkt_name}" hinzugefügt.`);
        this.newProduct = {
          produkt_name: '',
          beschreibung: '',
          preis: 0,
          mwst_satz: 19,
          gueltig_von: '',
          gueltig_bis: ''
        };
        this.showCreateForm = false;
        this.loadProducts();
      },
      error: (err) => {
        console.error('❌ Fehler beim Erstellen:', err);
        alert('❌ Fehler beim Erstellen des Produkts.');
      }
    });
  }

  // ============================================
  // ✏️ Produkt bearbeiten
  // ============================================
  editProduct(product: Product): void {
    this.editingProduct = { ...product };
  }

  saveProduct(): void {
    if (!this.editingProduct) return;

    this.productService
      .update(this.editingProduct.id_produkt, this.editingProduct)
      .subscribe({
        next: () => {
          alert(`💾 Änderungen gespeichert für "${this.editingProduct!.produkt_name}".`);
          this.editingProduct = null;
          this.loadProducts();
        },
        error: (err) => {
          console.error('❌ Fehler beim Speichern:', err);
          alert('❌ Fehler beim Speichern des Produkts.');
        }
      });
  }

  // ============================================
  // 🗑️ Produkt löschen
  // ============================================
  deleteProduct(id: string, name: string): void {
    if (!confirm(`Willst du das Produkt "${name}" wirklich löschen?`)) return;

    this.productService.delete(id).subscribe({
      next: () => {
        alert(`🗑️ Produkt "${name}" gelöscht.`);
        this.loadProducts();
      },
      error: (err) => {
        console.error('❌ Fehler beim Löschen:', err);
        alert('❌ Fehler beim Löschen des Produkts.');
      }
    });
  }

  cancelEdit(): void {
    this.editingProduct = null;
  }

  // ============================================
  // 🔍 Filterfunktion
  // ============================================
  get filteredProducts() {
    if (!this.searchTerm.trim()) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(
      (p) =>
        p.produkt_name.toLowerCase().includes(term) ||
        p.preis.toString().includes(term)
    );
  }

  // ============================================
  // 📄 Pagination
  // ============================================
  get pagedProducts() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/admin']); // Fallback-Route
    }
  }
}
