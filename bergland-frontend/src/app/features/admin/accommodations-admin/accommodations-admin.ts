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

  newAccommodation = { name: '', location: '', capacity: 0 };
  editingAccommodation: any = null;
  searchTerm = '';

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

  // 🔍 Filter
  get filteredAccommodations() {
    if (!this.searchTerm.trim()) return this.accommodations;
    const term = this.searchTerm.toLowerCase();
    return this.accommodations.filter((a) =>
      (a.name && a.name.toLowerCase().includes(term)) ||
      (a.city && a.city.toLowerCase().includes(term)) ||
      (a.country && a.country.toLowerCase().includes(term))
    );
  }
  

  addAccommodation(): void {
    const payload = {
      name: this.newAccommodation.name,
      city: this.newAccommodation.location,   // oder city
      total_beds: this.newAccommodation.capacity, // falls du das mappen willst
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
  
  

  editAccommodation(item: any): void {
    this.editingAccommodation = { ...item };
  }

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
