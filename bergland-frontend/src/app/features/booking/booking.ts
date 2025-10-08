import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking.html',
  styleUrls: ['./booking.css']
})
export class Booking implements OnInit {
  bookings: any[] = [];
  loading = true;
  errorMessage = '';

  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'Bitte logge dich ein, um deine Buchungen zu sehen.';
      this.loading = false;
      return;
    }
    
    this.loadBookings(userId);
  }

  private loadBookings(userId: string): void {
    this.bookingService.getByUser(userId).subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Buchungen:', err);
        this.errorMessage = '❌ Buchungen konnten nicht geladen werden.';
        this.loading = false;
      }
    });
  }

  goToEvents(): void {
    this.router.navigate(['/events']);
  }
}
