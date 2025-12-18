import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

interface Invoice {
  id_rechnung: string;
  rechnungs_nr: string;
  datum: string;
  betrag_gesamt: number;
  ist_bezahlt: boolean;
  bezahlt_am?: string | null;
  kunde?: {
    first_name: string;
    last_name: string;
  };
}

@Component({
  selector: 'app-invoices-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices-admin.html',
  styleUrls: ['./invoices-admin.css'],
})
export class InvoicesAdmin implements OnInit {
  private http = inject(HttpClient);

  constructor(
    private location: Location,
    private router: Router
  ) {}

  // === Signals ===
  invoices = signal<Invoice[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  searchTerm = signal<string>('');

  // === Filter ===
  currentTab: 'offen' | 'bezahlt' = 'offen';
  selectedMonth: string = '';
  selectedYear: string = new Date().getFullYear().toString();

  async ngOnInit() {
    await this.loadInvoices();
  }

  async loadInvoices() {
    try {
      this.loading.set(true);
      let url = `/api/invoices?status=${this.currentTab}`;
      if (this.currentTab === 'bezahlt' && this.selectedMonth && this.selectedYear) {
        url += `&month=${this.selectedMonth}&year=${this.selectedYear}`;
      }
      const data = await this.http.get<Invoice[]>(url).toPromise();
      this.invoices.set(data || []);
    } catch (err) {
      console.error('❌ Fehler beim Laden der Rechnungen:', err);
      this.errorMessage.set('Fehler beim Laden der Rechnungen.');
    } finally {
      this.loading.set(false);
    }
  }

  async markAsPaid(invoice: Invoice) {
    if (!confirm(`Rechnung ${invoice.rechnungs_nr} als bezahlt markieren?`)) return;
    try {
      await this.http.patch(`/api/invoices/${invoice.id_rechnung}/pay`, {}).toPromise();
      await this.loadInvoices();
    } catch {
      alert('Fehler beim Markieren als bezahlt.');
    }
  }

  async deleteInvoice(invoice: Invoice) {
    if (!confirm(`Rechnung ${invoice.rechnungs_nr} wirklich löschen?`)) return;
    try {
      await this.http.delete(`/api/invoices/${invoice.id_rechnung}`).toPromise();
      await this.loadInvoices();
    } catch {
      alert('Fehler beim Löschen der Rechnung.');
    }
  }

  printInvoice(invoice: Invoice) {
    window.open(`/api/invoices/${invoice.id_rechnung}/pdf`, '_blank');
  }

  async switchTab(tab: 'offen' | 'bezahlt') {
    this.currentTab = tab;
    await this.loadInvoices();
  }

  async applyArchiveFilter() {
    await this.loadInvoices();
  }

  getMonthList() {
    return [
      { value: '1', label: 'Januar' },
      { value: '2', label: 'Februar' },
      { value: '3', label: 'März' },
      { value: '4', label: 'April' },
      { value: '5', label: 'Mai' },
      { value: '6', label: 'Juni' },
      { value: '7', label: 'Juli' },
      { value: '8', label: 'August' },
      { value: '9', label: 'September' },
      { value: '10', label: 'Oktober' },
      { value: '11', label: 'November' },
      { value: '12', label: 'Dezember' },
    ];
  }

  // ✅ Live-Suchfilter
  filteredInvoices = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.invoices();

    return this.invoices().filter((inv) => {
      const invoiceDate = new Date(inv.datum).toLocaleDateString('de-DE');
      return (
        inv.rechnungs_nr?.toLowerCase().includes(term) ||
        inv.kunde?.first_name?.toLowerCase().includes(term) ||
        inv.kunde?.last_name?.toLowerCase().includes(term) ||
        invoiceDate.includes(term)
      );
    });
  });

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/admin']); // Fallback-Route
    }
  }
}
