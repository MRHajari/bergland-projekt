// frontend/src/app/features/accommodations/accommodation-detail.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccommodationService } from '../../../core/services/accommodation.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-accommodation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accommodation-detail.html',
  styleUrls: ['./accommodation-detail.css'],
})
export class AccommodationDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accommodationService = inject(AccommodationService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  accommodation: any = null;
  loading = false;
  errorMessage: string | null = null;

  booking = {
    checkin: '',
    checkout: '',
    room_type: 'EZ', // Einzelzimmer als Standard
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadAccommodation(id);
  }

  loadAccommodation(id: string): void {
    this.loading = true;
    this.accommodationService.getById(id).subscribe({
      next: (data) => {
        this.accommodation = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Unterkunft:', err);
        this.errorMessage = '❌ Unterkunft konnte nicht geladen werden.';
        this.loading = false;
      },
    });
  }

  bookNow(): void {
    if (!this.authService.isLoggedIn()) {
      alert('Bitte logge dich ein, um zu buchen.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.booking.checkin || !this.booking.checkout) {
      alert('Bitte Check-in und Check-out auswählen.');
      return;
    }

    const person_id = this.authService.getUserId();
    const payload = {
      person_id,
      accommodation_id: this.accommodation.id,
      checkin_date: this.booking.checkin,
      checkout_date: this.booking.checkout,
      room_type: this.booking.room_type,
      status: 'reserviert',
    };

    this.bookingService.create(payload).subscribe({
      next: () => {
        alert('✅ Unterkunft erfolgreich gebucht!');
        this.router.navigate(['/profile']); // oder Buchungsübersicht
      },
      error: (err) => {
        console.error('Fehler bei der Buchung:', err);
        alert('❌ Fehler bei der Buchung.');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/accommodations']);
  }
}
