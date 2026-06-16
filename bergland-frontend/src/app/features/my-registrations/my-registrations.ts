import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventRegistrationService } from '../../core/services/event-registration.service';
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/auth.service';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-my-registrations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-registrations.html',
  styleUrls: ['./my-registrations.css'],
})
export class MyRegistrations implements OnInit {
  registrations: {
    eventId: string;
    eventName: string;
    eventStart: string;
    eventEnd?: string;
    participantCount: number;
    squadronCount: number;
    status: string;
    wishes?: string | null;
    catering_type?: string | null;
    license_plate?: string | null;
    start_number?: number | null;
    phone_number?: string | null;
  }[] = [];

  loading = true;
  errorMessage = '';

  private registrationService = inject(EventRegistrationService);
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const personId = this.authService.getPersonId();
    if (!personId) {
      this.errorMessage = '❌ Keine Person eingeloggt.';
      this.loading = false;
      return;
    }
  
    console.log('👤 Person-ID:', personId);
  
    this.registrationService.getByPerson(personId).subscribe({
      next: async (regs) => {
        console.log('📋 Registrierungen geladen:', regs);
  
        if (!regs || regs.length === 0) {
          this.loading = false;
          return;
        }
  
        // 🔹 Event-IDs extrahieren
        const eventIds = [...new Set(regs.map((r) => r.event_id))];
  
        const events = await Promise.all(
          eventIds.map((id) => firstValueFrom(this.eventService.getById(id)))
        );
        
  
        this.registrations = regs.map((r) => {
          const evt = events.find((e) => e?.id === r.event_id);
          const participants = r.participants || [];
  
          return {
            eventId: r.event_id,
            eventName: evt?.name || 'Unbekanntes Event',
            eventStart: evt?.start_date || '',
            eventEnd: evt?.end_date || '',
            participantCount: participants.length || 0,
            squadronCount: participants.filter((p) => !!p.squadron_id).length || 0,
            status: r.status || 'In Bearbeitung',
            wishes: r.wishes || null,
            catering_type: r.catering_type || null,
            license_plate: r.license_plate || null,
            start_number: participants[0]?.start_number ?? null,
            phone_number: r.phone_number || null,
          };
        });
  
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Fehler beim Laden:', err);
        this.errorMessage = '❌ Fehler beim Laden deiner Anmeldungen.';
        this.loading = false;
      },
    });
  }
  

  // ======================================================
  // 🔹 Bearbeiten
  // ======================================================
  goToEvent(eventId: string | null) {
    if (!eventId) {
      alert('❌ Ungültige Event-ID.');
      return;
    }
    this.router.navigate(['/event-registration', eventId]);
  }

  // ======================================================
  // 🔹 Stornieren
  // ======================================================
  cancelRegistration(eventId: string | null): void {
    if (!eventId) {
      alert('❌ Ungültige Event-ID.');
      return;
    }
  
    if (!confirm('⚠️ Willst du deine Anmeldung wirklich stornieren?')) return;
  
    const personId = this.authService.getPersonId();
    if (!personId) return;
  
    this.registrationService.getByPerson(personId).subscribe({
      next: (regs) => {
        const reg = regs.find((r) => r.event_id === eventId);
        if (!reg?.id) {
          alert('⚠️ Keine Registrierung gefunden.');
          return;
        }
  
        this.registrationService.delete(reg.id).subscribe({
          next: () => {
            this.registrations = this.registrations.filter(
              (r) => r.eventId !== eventId
            );
            alert('✅ Deine Anmeldung wurde storniert.');
          },
          error: (err) => {
            console.error('❌ Fehler beim Stornieren:', err);
            alert('❌ Fehler beim Stornieren der Anmeldung.');
          },
        });
      },
      error: (err) => {
        console.error('❌ Fehler beim Laden der Registrierungen:', err);
        alert('❌ Fehler beim Laden der Registrierungen.');
      },
    });
  }
  
}
