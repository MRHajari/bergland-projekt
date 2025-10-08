import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccommodationService } from '../../../core/services/accommodation.service';

@Component({
  selector: 'app-accommodations-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accommodations-admin.html',
  styleUrls: ['./accommodations-admin.css'],
})
export class AccommodationsAdmin implements OnInit {
  accommodations: any[] = [];
  loading = false;
  errorMessage: string | null = null;

  // 🆕 Neue Unterkunft
  newAccommodation = {
    unterkunft_name: '',
    strasse_hausnr: '',
    plz: '',
    ort: '',
    anz_ez: 0,
    anz_dz: 0,
    anz_mbz: 0,
    anz_betten_mbz: 0,
  };

  editingAccommodation: any = null;

  searchTerm = '';
  page = 1;
  pageSize = 10;

  constructor(private accommodationService: AccommodationService) {}

  ngOnInit(): void {
    this.loadAccommodations();
  }

  loadAccommodations(): void {
    this.loading = true;
    this.accommodationService.getAll().subscribe({
      next: (data) => {
        this.accommodations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Unterkünfte:', err);
        this.errorMessage = '❌ Fehler beim Laden der Unterkünfte.';
        this.loading = false;
      },
    });
  }

  get filteredAccommodations() {
    if (!this.searchTerm.trim()) return this.accommodations;
    const term = this.searchTerm.toLowerCase();
    return this.accommodations.filter(
      (a) =>
        a.unterkunft_name?.toLowerCase().includes(term) ||
        a.ort?.toLowerCase().includes(term) ||
        a.plz?.includes(term)
    );
  }

  get pagedAccommodations() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredAccommodations.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredAccommodations.length / this.pageSize);
  }

  addAccommodation(): void {
    if (!this.newAccommodation.unterkunft_name.trim()) {
      alert('❗ Bitte gib einen Namen ein.');
      return;
    }

    this.accommodationService.create(this.newAccommodation).subscribe({
      next: () => {
        alert(`✅ Unterkunft "${this.newAccommodation.unterkunft_name}" hinzugefügt.`);
        this.newAccommodation = {
          unterkunft_name: '',
          strasse_hausnr: '',
          plz: '',
          ort: '',
          anz_ez: 0,
          anz_dz: 0,
          anz_mbz: 0,
          anz_betten_mbz: 0,
        };
        this.loadAccommodations();
      },
      error: (err) => {
        console.error('Fehler beim Erstellen:', err);
        alert('❌ Fehler beim Erstellen der Unterkunft.');
      },
    });
  }

  editAccommodation(a: any): void {
    this.editingAccommodation = { ...a };
  }

  saveAccommodation(): void {
    if (!this.editingAccommodation) return;
    this.accommodationService
      .update(this.editingAccommodation.id, this.editingAccommodation)
      .subscribe({
        next: () => {
          alert(`💾 Änderungen gespeichert für "${this.editingAccommodation.unterkunft_name}".`);
          this.editingAccommodation = null;
          this.loadAccommodations();
        },
        error: (err) => {
          console.error('Fehler beim Speichern:', err);
          alert('❌ Fehler beim Speichern.');
        },
      });
  }

  deleteAccommodation(id: string, name: string): void {
    if (!confirm(`Willst du "${name}" wirklich löschen?`)) return;
    this.accommodationService.delete(id).subscribe({
      next: () => {
        alert(`🗑️ Unterkunft "${name}" gelöscht.`);
        this.loadAccommodations();
      },
      error: (err) => {
        console.error('Fehler beim Löschen:', err);
        alert('❌ Fehler beim Löschen.');
      },
    });
  }

  cancelEdit(): void {
    this.editingAccommodation = null;
  }
}
