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

  accommodations: AccommodationInterface[] = [];
  events: EventInterface[] = [];
  occupancies: OccupancyInterface[] = [];
  allBookings: BookingInterface[] = [];
  groupedBookings: Record<string, BookingInterface[]> = {};
  page = 1;
  pageSize = 10;
  currentYear = new Date().getFullYear();
  searchTerm = '';


  constructor(
    private location: Location,
    private router: Router
  ) {}

  // =====================================================
  // 🔹 Neue Unterkunft (ERWEITERT)
  // =====================================================
  newAccommodation: Partial<AccommodationInterface> = {
    name: '',
    street: '',
    postal_code: '',
    city: '',
    country: 'Deutschland',
    single_rooms: 0,
    double_rooms: 0,
    quad_rooms: 0,
    quint_rooms: 0,
    sext_rooms: 0,
  };

  selectedAccommodation: AccommodationInterface | null = null;
  editingAccommodation: AccommodationInterface | null = null;

  eventAssignments: {
    event_id: string;
    event_name: string;
    single_beds_total: number;
    double_beds_total: number;
    quad_beds_total: number;
    quint_beds_total: number;
    sext_beds_total: number;
    assigned: boolean;
  }[] = [];

  loading = false;
  errorMessage: string | null = null;

  private accommodationService = inject(AccommodationService);
  private api = inject(ApiService);
  private eventService = inject(EventService);
  private occupancyService = inject(OccupancyService);
  private bookingService = inject(BookingService);

  ngOnInit(): void {
    this.loadAccommodations();
    this.loadEvents();
    this.loadAllBookings();
  }

  loadAccommodations(): void {
    this.loading = true;
    this.accommodationService.getAll().subscribe({
      next: (data) => {
        this.accommodations = data || [];
        this.loading = false;
      },
      error: () => {
        this.errorMessage = '❌ Fehler beim Laden der Unterkünfte.';
        this.loading = false;
      },
    });
  }

  loadEvents(): void {
    this.eventService.getAll().subscribe({
      next: (data) => (this.events = data || []),
    });
  }

  addAccommodation(): void {
    if (!this.newAccommodation.name?.trim()) {
      alert('❗ Bitte gib einen Namen ein.');
      return;
    }

    this.accommodationService.create(this.newAccommodation).subscribe({
      next: () => {
        alert(`✅ Unterkunft "${this.newAccommodation.name}" hinzugefügt.`);
        this.resetNewAccommodation();
        this.loadAccommodations();
      },
      error: () => alert('❌ Fehler beim Erstellen.'),
    });
  }

  private resetNewAccommodation(): void {
    this.newAccommodation = {
      name: '',
      street: '',
      postal_code: '',
      city: '',
      country: 'Deutschland',
      single_rooms: 0,
      double_rooms: 0,
      quad_rooms: 0,
      quint_rooms: 0,
      sext_rooms: 0,
    };
  }
  

  editAccommodation(acc: AccommodationInterface): void {
    this.editingAccommodation = { ...acc };
  }

  saveAccommodation(): void {
    if (!this.editingAccommodation) return;

    this.accommodationService
      .update(this.editingAccommodation.id!, this.editingAccommodation)
      .subscribe({
        next: () => {
          alert(`💾 Änderungen gespeichert.`);
          this.editingAccommodation = null;
          this.loadAccommodations();
        },
      });
  }

  cancelEdit(): void {
    this.editingAccommodation = null;
  }

  deleteAccommodation(id: string, name: string): void {
    if (!confirm(`"${name}" wirklich löschen?`)) return;

    this.accommodationService.delete(id).subscribe({
      next: () => this.loadAccommodations(),
    });
  }

  // =====================================================
  // 🧮 NEUE Statistik (KOMPATIBEL)
  // =====================================================

  getTotalBeds(accName: string): number {
    const acc = this.accommodations.find(a => a.name === accName);
    if (!acc) return 0;

    return (
      (acc.single_rooms || 0) * 1 +
      (acc.double_rooms || 0) * 2 +
      (acc.quad_rooms || 0) * 4 +
      (acc.quint_rooms || 0) * 5 +
      (acc.sext_rooms || 0) * 6
    );
  }

  getBookedBeds(accName: string): number {
    const bookings = this.groupedBookings[accName] || [];
    let total = 0;

    for (const b of bookings) {
      total +=
        (b.single_beds || 0) * 1 +
        (b.double_beds || 0) * 2 +
        (b.quad_beds || 0) * 4 +
        (b.quint_beds || 0) * 5 +
        (b.sext_beds || 0) * 6;
    }

    return total;
  }

  getFreeBeds(accName: string): number {
    return Math.max(this.getTotalBeds(accName) - this.getBookedBeds(accName), 0);
  }

  loadAllBookings(): void {
    this.bookingService.getAll().subscribe({
      next: (data) => {
        this.allBookings = data || [];
        this.groupBookingsByAccommodation();
      },
    });
  }

  private groupBookingsByAccommodation(): void {
    this.groupedBookings = {};
    for (const booking of this.allBookings) {
      const accName = booking.accommodation?.name || 'Unbekannt';
      if (!this.groupedBookings[accName]) this.groupedBookings[accName] = [];
      this.groupedBookings[accName].push(booking);
    }
  }

  get groupedBookingKeys(): string[] {
    return Object.keys(this.groupedBookings);
  }


  get pagedAccommodations(): AccommodationInterface[] {
    const start = (this.page - 1) * this.pageSize;
    return this.accommodations.slice(start, start + this.pageSize);
  }

  // ✅ Gefilterte Unterkünfte (AOT-sicher)
  get filteredAccommodations(): AccommodationInterface[] {
    if (!this.searchTerm.trim()) {
      return this.accommodations;
    }

    const term = this.searchTerm.toLowerCase();
    return this.accommodations.filter(acc =>
      acc.name?.toLowerCase().includes(term) ||
      acc.city?.toLowerCase().includes(term)
    );
  }

  
  goBack(): void {
    window.history.length > 1
      ? this.location.back()
      : this.router.navigate(['/admin']);
  }
}
