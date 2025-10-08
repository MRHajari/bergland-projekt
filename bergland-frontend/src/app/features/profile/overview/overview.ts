import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventRegistrationService } from '../../../core/services/event-registration.service';
import { BookingService } from '../../../core/services/booking.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { AuthService } from '../../../core/auth.service';
import { firstValueFrom } from 'rxjs';



@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class Overview implements OnInit {

  // 🟢 State Variablen
  userId: string | null = null;
  registrations: any[] = [];
  bookings: any[] = [];
  orders: any[] = [];
  loading = true;

  // 🟢 Services via inject()
  private authService = inject(AuthService);
  private eventRegistrationService = inject(EventRegistrationService);
  private bookingService = inject(BookingService);
  private invoiceService = inject(InvoiceService);

  ngOnInit() {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      console.warn('⚠️ Kein Benutzer eingeloggt!');
      return;
    }
    this.loadAll();
  }

  private async loadAll() {
    if (!this.userId) return;
  
    try {
      const [regs, books, invs, ] = await Promise.all([
        firstValueFrom(this.eventRegistrationService.getByUser(this.userId)),
        firstValueFrom(this.bookingService.getByUser(this.userId)),
        firstValueFrom(this.invoiceService.getByUser(this.userId)),
      ]);
  
      this.registrations = regs || [];
      this.bookings = books || [];
      this.orders = invs || [];
    } catch (err) {
      console.error('❌ Fehler beim Laden der Übersicht:', err);
    } finally {
      this.loading = false;
    }
  }
  
  
}
