import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccommodationService, AccommodationInterface } from '../../../core/services/accommodation.service';
import { ApiService } from '../../../core/api.service';
import { EventService, EventInterface } from '../../../core/services/event.service';
import { OccupancyService, OccupancyInterface } from '../../../core/services/occupancy.service';
import { BookingService, BookingInterface } from '../../../core/services/booking.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

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
  allBookings: BookingInterface[] = [];
  groupedBookings: Record<string, BookingInterface[]> = {};


  constructor(
    private location: Location,
    private router: Router
  ) {}

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
  private bookingService = inject(BookingService);

  // =====================================================
  // 🚀 Lifecycle
  // =====================================================
  ngOnInit(): void {
    this.loadAccommodations();
    this.loadEvents();
    this.loadAllBookings();
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
      next: (data) => (this.events = data || []),
      error: (err) => console.error('Fehler beim Laden der Events:', err),
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
    this.editingAccommodation = { ...acc };
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
  // 💾 Zuordnungen speichern (Occupancy)
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
  // 🔍 Such- & Paginierungs-Helper
  // =====================================================
  searchTerm = '';
  page = 1;
  pageSize = 10;

  get filteredAccommodations(): AccommodationInterface[] {
    if (!this.accommodations?.length) return [];
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

  // =====================================================
  // 📋 Buchungen laden + gruppieren
  // =====================================================
  loadAllBookings(): void {
    this.bookingService.getAll().subscribe({
      next: (data) => {
        this.allBookings = data || [];
        this.groupBookingsByAccommodation();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Fehler beim Laden der Buchungen:', err);
        this.errorMessage = '❌ Buchungen konnten nicht geladen werden.';
        this.loading = false;
      },
    });
  }

  private groupBookingsByAccommodation(): void {
    this.groupedBookings = {};
    for (const booking of this.allBookings) {
      const accName = booking.accommodation?.name || 'Unbekannte Unterkunft';
      if (!this.groupedBookings[accName]) this.groupedBookings[accName] = [];
      this.groupedBookings[accName].push(booking);
    }
  }

  // ✅ Sicherer Getter für Template
  get groupedBookingKeys(): string[] {
    return this.groupedBookings ? Object.keys(this.groupedBookings) : [];
  }

  // =====================================================
// 🧮 Statistik-Funktionen pro Unterkunft
// =====================================================

getTotalBeds(accName: string): number {
  const acc = this.accommodations.find(a => a.name === accName);
  if (!acc) return 0;
  return (acc.single_rooms || 0) + (acc.double_rooms || 0) * 2 + (acc.multi_bed_rooms || 0) * 3;
}

getBookedBeds(accName: string): number {
  const bookings = this.groupedBookings[accName] || [];
  let total = 0;
  for (const b of bookings) {
    total += (b.single_beds || 0) + (b.double_beds || 0) * 2 + (b.multi_beds || 0) * 3;
  }
  return total;
}

getFreeBeds(accName: string): number {
  const total = this.getTotalBeds(accName);
  const booked = this.getBookedBeds(accName);
  return Math.max(total - booked, 0);
}

goBack(): void {
  if (window.history.length > 1) {
    this.location.back();
  } else {
    this.router.navigate(['/admin']); // Fallback-Route
  }
}

}
