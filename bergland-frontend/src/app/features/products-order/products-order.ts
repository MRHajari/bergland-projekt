import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../core/services/product.service';
import { AuthService } from '../../core/auth.service';
import { InvoiceService } from '../../core/services/invoice.service';

type ProductWithQty = Product & { menge?: number };

@Component({
  selector: 'app-products-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-order.html',
  styleUrls: ['./products-order.css']
})
export class ProductsOrder implements OnInit {
  private productService = inject(ProductService);
  private auth = inject(AuthService);
  private invoices = inject(InvoiceService);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  products = signal<ProductWithQty[]>([]);
  searchTerm = signal<string>('');

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.productService.getAll().subscribe({
      next: (list) => {
        const today = this.stripTime(new Date());

        const valid = list.filter(p => {
          const von = p.gueltig_von ? this.stripTime(new Date(p.gueltig_von)) : null;
          const bis = p.gueltig_bis ? this.stripTime(new Date(p.gueltig_bis)) : null;
          const afterVon = !von || von <= today;
          const beforeBis = !bis || today <= bis;
          return afterVon && beforeBis;
        });

        // initial menge = 0
        this.products.set(valid.map(p => ({ ...p, menge: 0 })));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Produkte laden fehlgeschlagen:', err);
        this.errorMessage.set('Produkte konnten nicht geladen werden.');
        this.loading.set(false);
      }
    });
  }

  private stripTime(d: Date) {
    d.setHours(0,0,0,0);
    return d;
  }

  filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.products();
    return this.products().filter(p =>
      p.produkt_name.toLowerCase().includes(term) ||
      (p.beschreibung || '').toLowerCase().includes(term)
    );
  });

  total = computed(() =>
    this.products().reduce((sum, p) => sum + (p.menge || 0) * Number(p.preis || 0), 0)
  );

  anySelected = computed(() =>
    this.products().some(p => (p.menge || 0) > 0)
  );

  inc(p: ProductWithQty) { p.menge = (p.menge || 0) + 1; }
  dec(p: ProductWithQty) { p.menge = Math.max(0, (p.menge || 0) - 1); }

  submitOrder() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.anySelected()) {
      this.errorMessage.set('Bitte wähle mindestens ein Produkt (Menge > 0).');
      return;
    }

    const personId = this.auth.getPersonId();
    if (!personId) {
      this.errorMessage.set('Bitte melde dich an, um zu bestellen.');
      return;
    }

    const items = this.products()
      .filter(p => (p.menge || 0) > 0)
      .map(p => ({ id_produkt: p.id_produkt, menge: p.menge || 1 }));

    this.loading.set(true);
    this.invoices.createFromProducts({ id_person: personId, items }).subscribe({
      next: (res) => {
        this.loading.set(false);
        const nr = res?.invoice?.rechnungs_nr ?? '–';
        const total = res?.total ?? this.total();
        this.successMessage.set(`🧾 Rechnung ${nr} erfolgreich erstellt. Gesamt: ${Number(total).toFixed(2)} €`);
        // Reset Mengen
        this.products.update(list => list.map(p => ({ ...p, menge: 0 })));
      },
      error: (err) => {
        this.loading.set(false);
        console.error('❌ Bestellung fehlgeschlagen:', err);
        this.errorMessage.set(err?.error?.message || 'Bestellung fehlgeschlagen.');
      }
    });
  }

  updateQty(p: ProductWithQty, menge: number) {
    if (menge < 0) menge = 0;
  
    this.products.update(list =>
      list.map(item =>
        item.id_produkt === p.id_produkt ? { ...item, menge } : item
      )
    );
  }
  
}
