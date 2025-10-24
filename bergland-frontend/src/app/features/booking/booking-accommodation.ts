import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { BookingService, BookingInterface } from '../../core/services/booking.service';
import { AccommodationService, AccommodationInterface } from '../../core/services/accommodation.service';
import { firstValueFrom } from 'rxjs';

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
  existingBooking: BookingInterface | null = null; // ✅ neue Variable

  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private accommodationService = inject(AccommodationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

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
      await this.loadAccommodations(this.eventId);
      await this.loadExistingBooking(this.registrationId); // ✅ bestehende Buchung laden
    } else {
      this.loadAllBookings();
    }
  }

  // ======================================================
  // 📦 Alle Buchungen anzeigen (Admin/MyBookings-Ansicht)
  // ======================================================
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

  // ======================================================
  // 🏨 Unterkünfte für Event laden
  // ======================================================
  private async loadAccommodations(eventId: string): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const data = await firstValueFrom(this.accommodationService.getByEvent(eventId));
      console.log('✅ Unterkünfte geladen:', data);
      this.accommodations = (data || []).map(acc => ({
        ...acc,
        available_single: acc.available_single ?? acc.single_rooms ?? 0,
        available_double: acc.available_double ?? acc.double_rooms ?? 0,
        available_multi:  acc.available_multi  ?? acc.multi_bed_rooms ?? 0,
        request_single: 0,
        request_double: 0,
        request_multi:  0,
      }));
      console.log('🏨 Verfügbare Unterkünfte:', this.accommodations);
      this.loading = false;
    } catch (err) {
      console.error('❌ Fehler beim Laden der Unterkünfte:', err);
      this.errorMessage = '❌ Unterkünfte konnten nicht geladen werden.';
      this.loading = false;
    }
  }

  // ======================================================
  // 🔎 Bestehende Buchung laden
  // ======================================================
  private async loadExistingBooking(registrationId: string): Promise<void> {
    try {
      console.log(' ++++ booking - registrationId:', registrationId);
      const booking = await firstValueFrom(this.bookingService.getByRegistration(registrationId));
      console.log(' -----booking:', booking);
  
      if (!booking) {
        console.log('ℹ️ Keine bestehende Buchung gefunden.');
        return;
      }
  
      this.existingBooking = booking;
  
      const acc = this.accommodations.find(a => a.id === booking.accommodation_id);
      if (acc) {
        acc.request_single = booking.single_beds ?? 0;
        acc.request_double = booking.double_beds ?? 0;
        acc.request_multi  = booking.multi_beds ?? 0;
      }
  
    } catch (err: any) {
      if (err.status === 404) {
        console.log('ℹ️ Keine bestehende Buchung vorhanden (noch nichts gebucht).');
        this.existingBooking = null;
        return; // kein echtes Problem → still bleiben
      }
  
      console.error('❌ Fehler beim Laden der bestehenden Buchung:', err);
    }
  }
  
  

  // ======================================================
  // 💾 Neue Buchung oder Update
  // ======================================================
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
      if (this.existingBooking && this.existingBooking.accommodation_id === acc.id) {
        // ✏️ Update der bestehenden Buchung
        await firstValueFrom(this.bookingService.update(this.existingBooking.id!, payload));
        alert('✅ Änderungen erfolgreich gespeichert!');
      } else if (this.existingBooking && this.existingBooking.accommodation_id !== acc.id) {
        // 🔁 Alte Buchung löschen, neue Unterkunft buchen
        await firstValueFrom(this.bookingService.delete(this.existingBooking.id!));
        await firstValueFrom(this.bookingService.create(payload));
        alert(`✅ Unterkunft wurde geändert auf "${acc.name}".`);
      } else {
        // ➕ Neue Buchung
        await firstValueFrom(this.bookingService.create(payload));
        alert(`✅ Unterkunft "${acc.name}" wurde erfolgreich gebucht.`);
      }

      await this.loadExistingBooking(this.registrationId); // UI aktualisieren
    } catch (err: any) {
      console.error('❌ Fehler bei der Buchung:', err);
      if (err.status === 400) {
        alert('⚠️ Nicht genügend freie Betten verfügbar.');
      } else if (err.status === 409) {
        alert('⚠️ Es existiert bereits eine Buchung.');
      } else {
        alert('❌ Buchung konnte nicht abgeschlossen werden.');
      }
    }
  }

  // ======================================================
  // ❌ Buchung löschen
  // ======================================================
  async deleteBooking(): Promise<void> {
    if (!this.existingBooking?.id) return;
    if (!confirm('⚠️ Willst du deine Buchung wirklich löschen?')) return;

    try {
      await firstValueFrom(this.bookingService.delete(this.existingBooking.id));
      alert('✅ Deine Buchung wurde erfolgreich gelöscht.');
      this.existingBooking = null;
      await this.loadAccommodations(this.eventId!);
    } catch (err) {
      console.error('❌ Fehler beim Löschen der Buchung:', err);
      alert('❌ Fehler beim Löschen der Buchung.');
    }
  }

  // ======================================================
  // 🔙 Navigation
  // ======================================================
  goToEvents(): void {
    this.router.navigate(['/events']);
  }
}
