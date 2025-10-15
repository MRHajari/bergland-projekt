import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccommodationService, AccommodationInterface } from '../../../core/services/accommodation.service';
import { ApiService } from '../../../core/api.service';
import { EventService, EventInterface } from '../../../core/services/event.service';
import { OccupancyService, OccupancyInterface } from '../../../core/services/occupancy.service';

@Component({
  selector: 'app-accommodations-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accommodations-admin.html',
  styleUrls: ['./accommodations-admin.css'],
})
export class AccommodationsAdmin implements OnInit {
  // =====================================================
  // 🔹 Datenquellen
  // =====================================================
  accommodations: AccommodationInterface[] = [];
  events: EventInterface[] = [];
  occupancies: OccupancyInterface[] = [];

  // =====================================================
  // 🔹 Neue Unterkunft
  // =====================================================
  newAccommodation: Partial<AccommodationInterface> = {
    name: '',
    street: '',
    postal_code: '',
    city: '',
    country: 'Deutschland',
    single_rooms: 0,
    double_rooms: 0,
    multi_bed_rooms: 0,
  };

  // =====================================================
  // 🔹 Auswahl + Zuordnung
  // =====================================================
  selectedAccommodation: AccommodationInterface | null = null;
  editingAccommodation: AccommodationInterface | null = null;
  eventAssignments: {
    event_id: string;
    event_name: string;
    single_beds_total: number;
    double_beds_total: number;
    multi_beds_total: number;
    assigned: boolean;
  }[] = [];

  // =====================================================
  // 🔹 Zustände
  // =====================================================
  loading = false;
  errorMessage: string | null = null;

  // =====================================================
  // 🔹 Services
  // =====================================================
  private accommodationService = inject(AccommodationService);
  private api = inject(ApiService);
  private eventService = inject(EventService);
  private occupancyService = inject(OccupancyService);

  // =====================================================
  // 🚀 Lifecycle
  // =====================================================
  ngOnInit(): void {
    this.loadAccommodations();
    this.loadEvents();
  }

  // =====================================================
  // 🏠 Unterkünfte laden
  // =====================================================
  loadAccommodations(): void {
    this.loading = true;
    this.accommodationService.getAll().subscribe({
      next: (data) => {
        this.accommodations = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Unterkünfte:', err);
        this.errorMessage = '❌ Fehler beim Laden der Unterkünfte.';
        this.loading = false;
      },
    });
  }

  // =====================================================
  // 🎯 Events laden
  // =====================================================
  loadEvents(): void {
    this.eventService.getAll().subscribe({
      next: (data) => {
        this.events = data || [];
      },
      error: (err) => {
        console.error('Fehler beim Laden der Events:', err);
      },
    });
  }

  // =====================================================
  // ➕ Neue Unterkunft hinzufügen
  // =====================================================
  addAccommodation(): void {
    if (!this.newAccommodation.name?.trim()) {
      alert('❗ Bitte gib einen Namen ein.');
      return;
    }

    this.accommodationService.create(this.newAccommodation).subscribe({
      next: () => {
        alert(`✅ Unterkunft "${this.newAccommodation.name}" hinzugefügt.`);
        this.newAccommodation = {
          name: '',
          street: '',
          postal_code: '',
          city: '',
          country: 'Deutschland',
          single_rooms: 0,
          double_rooms: 0,
          multi_bed_rooms: 0,
        };
        this.loadAccommodations();
      },
      error: (err) => {
        console.error('Fehler beim Erstellen:', err);
        alert('❌ Fehler beim Erstellen der Unterkunft.');
      },
    });
  }

  // =====================================================
  // 🧱 Unterkunft bearbeiten
  // =====================================================
  editAccommodation(acc: AccommodationInterface): void {
    this.editingAccommodation = { ...acc }; // Kopie, um direkt zu bearbeiten
  }

  saveAccommodation(): void {
    if (!this.editingAccommodation) return;
  
    this.accommodationService
      .update(this.editingAccommodation.id!, this.editingAccommodation)
      .subscribe({
        next: () => {
          alert(`💾 Änderungen gespeichert für "${this.editingAccommodation!.name}".`);
          this.editingAccommodation = null;
          this.loadAccommodations();
        },
        error: (err) => {
          console.error('Fehler beim Speichern:', err);
          alert('❌ Fehler beim Speichern der Unterkunft.');
        },
      });
  }
  

  cancelEdit(): void {
    this.editingAccommodation = null;
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

  // =====================================================
  // 🏨 Unterkunft auswählen (zum Verknüpfen mit Events)
  // =====================================================
  selectAccommodation(acc: AccommodationInterface): void {
    this.selectedAccommodation = acc;
    this.loadOccupancies(acc.id!);
  }

  // =====================================================
  // 🧮 Belegungen laden + Events zuordnen
  // =====================================================
  private loadOccupancies(accommodationId: string): void {
    this.occupancyService.getByAccommodation(accommodationId).subscribe({
      next: (data) => {
        this.occupancies = data || [];

        // Alle Events durchlaufen → prüfen, ob schon zugeordnet
        this.eventAssignments = this.events.map((e: EventInterface) => {
          const match = this.occupancies.find((o) => o.event_id === e.id);
          return {
            event_id: e.id ?? '',
            event_name: e.name,
            single_beds_total: match?.single_beds_total ?? 0,
            double_beds_total: match?.double_beds_total ?? 0,
            multi_beds_total: match?.multi_beds_total ?? 0,
            assigned: !!match,
          };
        });
      },
      error: (err) => {
        console.error('Fehler beim Laden der Belegungen:', err);
      },
    });
  }

  // =====================================================
  // 💾 Zuordnungen speichern
  // =====================================================
  saveEventAssignments(): void {
    if (!this.selectedAccommodation) return;

    const payload = this.eventAssignments
      .filter((e) => e.assigned)
      .map((e) => ({
        event_id: e.event_id,
        single_beds_total: e.single_beds_total,
        double_beds_total: e.double_beds_total,
        multi_beds_total: e.multi_beds_total,
      }));

    this.api
      .post('occupancies/updateAssignments', {
        accommodation_id: this.selectedAccommodation.id,
        assignments: payload,
      })
      .subscribe({
        next: () => {
          alert('💾 Zuordnungen erfolgreich gespeichert.');
          this.selectedAccommodation = null;
          this.loadAccommodations();
        },
        error: (err) => {
          console.error('Fehler beim Speichern der Zuordnungen:', err);
          alert('❌ Fehler beim Speichern.');
        },
      });
  }

  // =====================================================
  // ❌ Auswahl abbrechen
  // =====================================================
  cancelSelection(): void {
    this.selectedAccommodation = null;
  }

  // =====================================================
  // 📋 Hilfs-Getter für Filter & Pagination (Template-Support)
  // =====================================================
  searchTerm: string = '';
  page = 1;
  pageSize = 10;

  get filteredAccommodations(): AccommodationInterface[] {
    if (!this.accommodations || this.accommodations.length === 0) return [];
    if (!this.searchTerm.trim()) return this.accommodations;
    const term = this.searchTerm.toLowerCase();
    return this.accommodations.filter(
      (a) =>
        a.name?.toLowerCase().includes(term) ||
        a.city?.toLowerCase().includes(term) ||
        a.postal_code?.includes(term)
    );
  }

  get pagedAccommodations(): AccommodationInterface[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredAccommodations.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAccommodations.length / this.pageSize);
  }
}
