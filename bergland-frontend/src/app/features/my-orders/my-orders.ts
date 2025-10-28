import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { InvoiceService, Invoice } from '../../core/services/invoice.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.html',
  styleUrls: ['./my-orders.css']
})
export class MyOrders implements OnInit {
  private auth = inject(AuthService);
  private invoiceService = inject(InvoiceService);

  invoices = signal<Invoice[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    const personId = this.auth.getPersonId();
    if (!personId) {
      this.error.set('Du musst eingeloggt sein, um deine Bestellungen zu sehen.');
      return;
    }

    this.loading.set(true);
    this.invoiceService.getByPerson(personId).subscribe({
      next: (data) => {
        this.invoices.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Fehler beim Laden der Bestellungen:', err);
        this.error.set('Fehler beim Laden deiner Bestellungen.');
        this.loading.set(false);
      }
    });
  }

  cancelOrder(inv: Invoice) {
    if (inv.ist_bezahlt) {
      alert('Diese Bestellung wurde bereits bezahlt und kann nicht storniert werden.');
      return;
    }
    if (!confirm(`Willst du die Bestellung ${inv.rechnungs_nr} wirklich stornieren?`)) return;

    this.invoiceService.delete(inv.id_rechnung).subscribe({
      next: () => {
        alert(`🗑️ Bestellung ${inv.rechnungs_nr} wurde storniert.`);
        this.loadOrders();
      },
      error: (err) => {
        console.error('❌ Fehler beim Stornieren:', err);
        alert('Fehler beim Stornieren der Bestellung.');
      }
    });
  }
}
