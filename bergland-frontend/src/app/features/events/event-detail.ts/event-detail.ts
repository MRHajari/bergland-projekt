import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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

  constructor(
    private belegungService: BelegungService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Event-ID fehlt!';
      this.loading = false;
      return;
    }

    this.eventService.getById(id).subscribe({
      next: (data) => {
        this.event = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden des Events:', err);
        this.errorMessage = 'Event konnte nicht geladen werden.';
        this.loading = false;
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
      next: (res) => alert(res.message || 'Erfolgreich angemeldet!'),
      error: (err) => {
        console.error('❌ Fehler bei Anmeldung:', err);
        alert(err.error?.message || 'Fehler bei der Anmeldung.');
      }
    });
  }
  
}
