import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Invoice {
  id_rechnung: string;
  rechnungs_nr: string;
  id_person: string;
  betrag_gesamt: number;
  ist_bezahlt: boolean;
  bezahlt_am?: string | null;
  datum: string;
  products?: Product[]; // optional, falls du Produkte mitladen willst
}

export interface Product {
  id_produkt: string;
  produkt_name: string;
  beschreibung?: string;
  preis: number;
  mwst_satz: number;
  gueltig_von?: string | null;
  gueltig_bis?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/invoices`;

  /** 🧾 Alle Rechnungen abrufen */
  getAll(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.baseUrl);
  }

  /** 🔍 Einzelne Rechnung abrufen */
  getById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.baseUrl}/${id}`);
  }

  /** ➕ Neue Rechnung erstellen */
  create(payload: Partial<Invoice>): Observable<Invoice> {
    return this.http.post<Invoice>(this.baseUrl, payload);
  }

  /** ✏️ Rechnung aktualisieren */
  update(id: string, payload: Partial<Invoice>): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.baseUrl}/${id}`, payload);
  }

  /** 🗑️ Rechnung löschen */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** 🧾 Rechnung aus Produktbestellung erstellen */
  createFromProducts(payload: {
    id_person: string;
    items: { id_produkt: string; menge: number }[];
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/from-products`, payload);
  }

  /** 💡 Produkt zu Rechnung hinzufügen */
  addProduct(invoiceId: string, productId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${invoiceId}/products/${productId}`, {});
  }

  /** 💡 Produkt von Rechnung entfernen */
  removeProduct(invoiceId: string, productId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${invoiceId}/products/${productId}`);
  }

  /** 👤 Alle Rechnungen eines Benutzers abrufen */
getByPerson(personId: string): Observable<Invoice[]> {
  return this.http.get<Invoice[]>(`${this.baseUrl}/by-person/${personId}`);
}

/** ❌ Bestellung stornieren */
cancelInvoice(id: string): Observable<any> {
  return this.http.delete(`${this.baseUrl}/${id}`);
}

}
