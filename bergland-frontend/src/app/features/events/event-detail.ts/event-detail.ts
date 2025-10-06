// frontend/src/app/features/events/event-detail.ts/event-detail.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { BelegungService } from '../../../core/services/belegung.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail.html',
  styleUrls: ['./event-detail.css']
})
export class EventDetail implements OnInit {
  event: any = null;
  loading = true;
  errorMessage = '';
  isRegistered = false; // 👈 Ob der aktuelle Benutzer schon angemeldet ist

  private belegungService = inject(BelegungService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Event-ID fehlt!';
      this.loading = false;
      return;
    }

    this.loadEvent(id);
  }

  private loadEvent(id: string): void {
    this.eventService.getById(id).subscribe({
      next: (data) => {
        this.event = data;
        this.loading = false;
  
        // ⏳ Warte einen kurzen Tick, bis Angular Werte aktualisiert hat
        setTimeout(() => this.checkIfRegistered(), 50);
      },
      error: (err) => {
        console.error('Fehler beim Laden des Events:', err);
        this.errorMessage = 'Event konnte nicht geladen werden.';
        this.loading = false;
      }
    });
  }
  

 // in checkIfRegistered()
private checkIfRegistered(): void {
  const userId = this.authService.getUserId();
  if (!userId || !this.event?.id) {
    this.isRegistered = false;
    return;
  }

  this.belegungService.getByUserAndEvent(userId, this.event.id).subscribe({
    next: (res: { registered: boolean }) => {
      this.isRegistered = !!res?.registered;   // 👈 HIER der Fix
      console.log('--- this.isRegistered:', this.isRegistered);
    },
    error: (err) => {
      if (err.status === 404) {
        this.isRegistered = false;
      } else {
        console.warn('Fehler beim Prüfen der Anmeldung:', err);
      }
    }
  });
}

  

  goBack(): void {
    this.router.navigate(['/events']);
  }

  registerForEvent(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const userId = this.authService.getUserId();
    console.log('🟢 Anmeldeversuch:', { eventId: this.event.id, userId });

    this.belegungService.createBelegung(this.event.id).subscribe({
      next: (res) => {
        alert(res.message || 'Erfolgreich angemeldet!');
        this.isRegistered = true; // 👈 Nach Erfolg Button wechseln
      },
      error: (err) => {
        console.error('❌ Fehler bei Anmeldung:', err);
        alert(err.error?.message || 'Fehler bei der Anmeldung.');
      }
    });
  }

  cancelRegistration(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    if (!confirm('Willst du deine Anmeldung wirklich stornieren?')) return;

    this.belegungService.deleteByUserAndEvent(userId, this.event.id).subscribe({
      next: (res) => {
        alert(res.message || 'Anmeldung storniert.');
        this.isRegistered = false;
      },
      error: (err) => {
        console.error('❌ Fehler beim Stornieren:', err);
        alert('Fehler beim Stornieren der Anmeldung.');
      }
    });
  }
}
