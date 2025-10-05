import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccommodationService } from '../../../core/services/accommodation.service';

@Component({
  selector: 'app-accommodations-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accommodations-admin.html',
  styleUrls: ['./accommodations-admin.css']
})
export class AccommodationsAdmin implements OnInit {
  accommodations: any[] = [];
  loading = false;
  errorMessage: string | null = null;

  // 🆕 Neue Unterkunft
  newAccommodation = { name: '', location: '', capacity: 0 };

  // ✏️ Bearbeitung
  editingAccommodation: any = null;

  // 🔍 Suche & Pagination
  searchTerm = '';
  page = 1;
  pageSize = 10;

  constructor(private accommodationService: AccommodationService) {}

  ngOnInit(): void {
    this.loadAccommodations();
  }

  loadAccommodations(): void {
    this.loading = true;
    this.errorMessage = null;

    this.accommodationService.getAll().subscribe({
      next: (data) => {
        this.accommodations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Unterkünfte:', err);
        this.errorMessage = '❌ Fehler beim Laden der Unterkünfte.';
        this.loading = false;
      }
    });
  }

  // 🔍 Gefilterte Liste
  get filteredAccommodations() {
    if (!this.searchTerm.trim()) return this.accommodations;
    const term = this.searchTerm.toLowerCase();
    return this.accommodations.filter((a) =>
      (a.name && a.name.toLowerCase().includes(term)) ||
      (a.city && a.city.toLowerCase().includes(term)) ||
      (a.country && a.country.toLowerCase().includes(term))
    );
  }

  // 📄 Pagination
  get pagedAccommodations() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredAccommodations.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredAccommodations.length / this.pageSize);
  }

  // ➕ Neue Unterkunft hinzufügen
  addAccommodation(): void {
    if (!this.newAccommodation.name.trim()) {
      alert('❗ Bitte gib einen Namen ein.');
      return;
    }

    const payload = {
      name: this.newAccommodation.name,
      city: this.newAccommodation.location,
      total_beds: this.newAccommodation.capacity,
    };

    this.accommodationService.create(payload).subscribe({
      next: () => {
        alert(`✅ Unterkunft "${this.newAccommodation.name}" hinzugefügt.`);
        this.newAccommodation = { name: '', location: '', capacity: 0 };
        this.loadAccommodations();
      },
      error: (err) => {
        console.error('Fehler beim Erstellen:', err);
        alert('❌ Fehler beim Erstellen der Unterkunft.');
      }
    });
  }

  // ✏️ Unterkunft bearbeiten
  editAccommodation(item: any): void {
    this.editingAccommodation = { ...item };
  }

  // 💾 Änderungen speichern
  saveAccommodation(): void {
    if (!this.editingAccommodation) return;

    this.accommodationService
      .update(this.editingAccommodation.id, this.editingAccommodation)
      .subscribe({
        next: () => {
          alert(`💾 Änderungen gespeichert für "${this.editingAccommodation.name}".`);
          this.editingAccommodation = null;
          this.loadAccommodations();
        },
        error: (err) => {
          console.error('Fehler beim Speichern:', err);
          alert('❌ Fehler beim Speichern der Unterkunft.');
        }
      });
  }

  // 🗑️ Unterkunft löschen
  deleteAccommodation(id: string, name: string): void {
    if (!confirm(`Willst du die Unterkunft "${name}" wirklich löschen?`)) return;

    this.accommodationService.delete(id).subscribe({
      next: () => {
        alert(`🗑️ Unterkunft "${name}" gelöscht.`);
        this.loadAccommodations();
      },
      error: (err) => {
        console.error('Fehler beim Löschen:', err);
        alert('❌ Fehler beim Löschen der Unterkunft.');
      }
    });
  }

  cancelEdit(): void {
    this.editingAccommodation = null;
  }
}
