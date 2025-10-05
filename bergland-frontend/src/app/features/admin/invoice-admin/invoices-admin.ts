import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../core/services/invoice.service';

@Component({
  selector: 'app-invoices-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices-admin.html',
  styleUrls: ['./invoices-admin.css']
})
export class InvoicesAdmin implements OnInit {
  invoices: any[] = [];
  searchTerm = '';

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.invoiceService.getAll().subscribe({
      next: (data) => (this.invoices = data),
      error: (err) => console.error('Fehler beim Laden der Rechnungen:', err)
    });
  }

  markAsPaid(invoice: any): void {
    if (invoice.is_paid) return; // schon bezahlt

    this.invoiceService.update(invoice.id, { is_paid: true }).subscribe({
      next: () => {
        invoice.is_paid = true; // UI sofort aktualisieren
        console.log(`✅ Rechnung ${invoice.invoice_number} als bezahlt markiert.`);
      },
      error: (err) => console.error('Fehler beim Aktualisieren:', err)
    });
  }

  get filteredInvoices() {
    if (!this.searchTerm.trim()) return this.invoices;
    const term = this.searchTerm.toLowerCase();
    return this.invoices.filter(
      (i) =>
        (i.invoice_number && i.invoice_number.toLowerCase().includes(term)) ||
        (i.person?.first_name && i.person.first_name.toLowerCase().includes(term)) ||
        (i.person?.last_name && i.person.last_name.toLowerCase().includes(term))
    );
  }
}
