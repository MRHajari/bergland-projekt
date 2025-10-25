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

  /** ✅ mehrere Buchungen gleichzeitig möglich */
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
      error: (err) => {
        console.error('❌ Fehler beim Laden der Buchungen:', err);
        this.errorMessage = '❌ Buchungen konnten nicht geladen werden.';
        this.loading = false;
      },
    });
  }

  private async loadAccommodations(eventId: string): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const data = await firstValueFrom(this.accommodationService.getByEvent(eventId));
      this.accommodations = (data || []).map(acc => ({
        ...acc,
        available_single: acc.available_single ?? acc.single_rooms ?? 0,
        available_double: acc.available_double ?? acc.double_rooms ?? 0,
        available_multi:  acc.available_multi  ?? acc.multi_bed_rooms ?? 0,
        request_single: 0,
        request_double: 0,
        request_multi:  0,
      }));
      this.loading = false;
    } catch (err) {
      console.error('❌ Fehler beim Laden der Unterkünfte:', err);
      this.errorMessage = '❌ Unterkünfte konnten nicht geladen werden.';
      this.loading = false;
    }
  }

  private async loadExistingBookings(registrationId: string): Promise<void> {
    try {
      const bookings = await firstValueFrom(
        this.bookingService.getAllByRegistration(registrationId)
      );
      this.existingBookings = bookings || [];

      // bereits gebuchte Betten übernehmen
      for (const booking of this.existingBookings) {
        const acc = this.accommodations.find(a => a.id === booking.accommodation_id);
        if (acc) {
          acc.request_single = booking.single_beds ?? 0;
          acc.request_double = booking.double_beds ?? 0;
          acc.request_multi  = booking.multi_beds ?? 0;
        }
      }
    } catch (err: any) {
      if (err.status === 404) {
        this.existingBookings = [];
      } else {
        console.error('❌ Fehler beim Laden der Buchungen:', err);
      }
    }
  }

  async saveBooking(acc: AccommodationInterface): Promise<void> {
    if (!this.registrationId) {
      alert('❌ Registrierung fehlt – Buchung nicht möglich.');
      return;
    }
  
    const payload: BookingInterface = {
      event_registration_id: this.registrationId,
      accommodation_id: acc.id!,
      single_beds: acc.request_single || 0,
      double_beds: acc.request_double || 0,
      multi_beds: acc.request_multi || 0,
    };
  
    try {
      const existing = this.getBooking(acc.id!);
  
      if (existing) {
        // ✏️ Update bestehender Buchung
        await firstValueFrom(this.bookingService.update(existing.id!, payload));
        alert('✅ Änderungen erfolgreich gespeichert!');
      } else {
        // ➕ Neue Buchung
        await firstValueFrom(this.bookingService.create(payload));
        alert(`✅ Unterkunft "${acc.name}" wurde erfolgreich gebucht.`);
      }
  
      // 🔄 Jetzt beide Listen neu laden
      if (this.eventId) {
        await this.loadAccommodations(this.eventId);
        await this.loadExistingBookings(this.registrationId!);
      }
  
    } catch (err: any) {
      console.error('❌ Fehler bei der Buchung:', err);
      if (err.status === 400) {
        alert('⚠️ Nicht genügend freie Betten verfügbar.');
      } else if (err.status === 409) {
        alert('⚠️ Es existiert bereits eine Buchung für diese Unterkunft.');
      } else {
        alert('❌ Buchung konnte nicht abgeschlossen werden.');
      }
    }
  }
  

  async deleteBooking(acc: AccommodationInterface): Promise<void> {
    const booking = this.getBooking(acc.id);
    if (!booking?.id) return;
  
    if (!confirm(`⚠️ Willst du die Buchung für "${acc.name}" wirklich löschen?`)) return;
  
    try {
      await firstValueFrom(this.bookingService.delete(booking.id));
      alert(`✅ Buchung für "${acc.name}" wurde gelöscht.`);
  
      // 1️⃣ Buchung lokal entfernen
      this.existingBookings = this.existingBookings.filter(b => b.id !== booking.id);
  
      // 2️⃣ Unterkunft zurücksetzen
      acc.request_single = 0;
      acc.request_double = 0;
      acc.request_multi = 0;
  
      // 3️⃣ 🔄 Verfügbare Zimmer neu laden
      if (this.eventId) {
        await this.loadAccommodations(this.eventId);
        await this.loadExistingBookings(this.registrationId!);
      }
  
    } catch (err) {
      console.error('❌ Fehler beim Löschen der Buchung:', err);
      alert('❌ Fehler beim Löschen der Buchung.');
    }
  }
  
  /** ✅ wird im Template verwendet */
 /** darf auch undefined reinbekommen, gibt dann undefined zurück */
getBooking(accId?: string): BookingInterface | undefined {
  if (!accId) return undefined;
  return this.existingBookings.find(b => b.accommodation_id === accId);
}


  goToEvents(): void {
    this.router.navigate(['/events']);
  }
}
