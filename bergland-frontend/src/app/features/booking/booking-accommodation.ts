import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { BookingService, BookingInterface } from '../../core/services/booking.service';
import { AccommodationService, AccommodationInterface } from '../../core/services/accommodation.service';
import { firstValueFrom } from 'rxjs';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-accommodation.html',
  styleUrls: ['./booking-accommodation.css'],
})
export class BookingAccommodation implements OnInit {

  bookings: BookingInterface[] = [];
  accommodations: AccommodationInterface[] = [];

  loading = true;
  errorMessage = '';
  eventId: string | null = null;
  registrationId: string | null = null;
  event: any = null;

  existingBookings: BookingInterface[] = [];

  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private accommodationService = inject(AccommodationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);

  async ngOnInit(): Promise<void> {
    this.eventId = this.route.snapshot.queryParamMap.get('eventId');
    this.registrationId = this.route.snapshot.queryParamMap.get('registrationId');
    const userId = this.authService.getUserId();

    if (!userId) {
      this.errorMessage = 'Bitte logge dich ein, um deine Buchungen zu sehen.';
      this.loading = false;
      return;
    }

    if (this.eventId && this.registrationId) {
      this.event = await firstValueFrom(this.eventService.getEventById(this.eventId));
      await this.loadAccommodations(this.eventId);
      await this.loadExistingBookings(this.registrationId);
    } else {
      this.loadAllBookings();
    }
  }

  private loadAllBookings(): void {
    this.bookingService.getAll().subscribe({
      next: (data) => {
        this.bookings = data || [];
        this.loading = false;
      },
      error: () => {
        this.errorMessage = '❌ Buchungen konnten nicht geladen werden.';
        this.loading = false;
      },
    });
  }

  private async loadAccommodations(eventId: string): Promise<void> {
    this.loading = true;

    const data = await firstValueFrom(this.accommodationService.getByEvent(eventId));
    this.accommodations = (data || []).map(acc => ({
      ...acc,

      // Legacy
      available_single: acc.available_single ?? acc.single_rooms ?? 0,
      available_double: acc.available_double ?? acc.double_rooms ?? 0,
      available_quad: acc.available_quad ?? acc.quad_rooms ?? 0,
      available_quint: acc.available_quint ?? acc.quint_rooms ?? 0,
      available_sext: acc.available_sext ?? acc.sext_rooms ?? 0,

      request_single: 0,
      request_double: 0,
      request_multi: 0,

      // ✅ NEU
      request_quad: 0,
      request_quint: 0,
      request_sext: 0,
    }));

    this.loading = false;
  }

  private async loadExistingBookings(registrationId: string): Promise<void> {
    const bookings = await firstValueFrom(
      this.bookingService.getAllByRegistration(registrationId)
    );
    this.existingBookings = bookings || [];

    for (const booking of this.existingBookings) {
      const acc = this.accommodations.find(a => a.id === booking.accommodation_id);
      if (acc) {
        acc.request_single = booking.single_beds ?? 0;
        acc.request_double = booking.double_beds ?? 0;
        acc.request_multi  = booking.multi_beds ?? 0;

        // ✅ NEU
        acc.request_quad  = booking.quad_beds ?? 0;
        acc.request_quint = booking.quint_beds ?? 0;
        acc.request_sext  = booking.sext_beds ?? 0;
      }
    }
  }

  async saveBooking(acc: AccommodationInterface): Promise<void> {
    if (!this.registrationId) return;

    const payload: BookingInterface = {
      event_registration_id: this.registrationId,
      accommodation_id: acc.id!,

      single_beds: acc.request_single || 0,
      double_beds: acc.request_double || 0,
      multi_beds: acc.request_multi || 0,

      // ✅ NEU
      quad_beds: acc.request_quad || 0,
      quint_beds: acc.request_quint || 0,
      sext_beds: acc.request_sext || 0,
    };

    const existing = this.getBooking(acc.id!);

    if (existing) {
      await firstValueFrom(this.bookingService.update(existing.id!, payload));
      alert('✅ Änderungen gespeichert!');
    } else {
      await firstValueFrom(this.bookingService.create(payload));
      alert(`✅ Unterkunft "${acc.name}" gebucht.`);
    }

    if (this.eventId) {
      await this.loadAccommodations(this.eventId);
      await this.loadExistingBookings(this.registrationId!);
    }
  }

  async deleteBooking(acc: AccommodationInterface): Promise<void> {
    const booking = this.getBooking(acc.id);
    if (!booking?.id) return;

    if (!confirm(`Buchung für "${acc.name}" löschen?`)) return;

    await firstValueFrom(this.bookingService.delete(booking.id));

    acc.request_single = 0;
    acc.request_double = 0;
    acc.request_multi = 0;
    acc.request_quad = 0;
    acc.request_quint = 0;
    acc.request_sext = 0;

    if (this.eventId) {
      await this.loadAccommodations(this.eventId);
      await this.loadExistingBookings(this.registrationId!);
    }
  }

  getBooking(accId?: string): BookingInterface | undefined {
    if (!accId) return undefined;
    return this.existingBookings.find(b => b.accommodation_id === accId);
  }

  goToEvents(): void {
    this.router.navigate(['/events']);
  }
}
