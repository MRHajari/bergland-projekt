import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { EventRegistrationService, EventRegistrationInterface } from '../../core/services/event-registration.service';
import { EventService } from '../../core/services/event.service';
import { PersonService } from '../../core/services/person.service';
import { SquadronService } from '../../core/services/squadron.service';
import { AuthService } from '../../core/auth.service';

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
    start_number?: string | null;
    phone_number?: string | null;
  }[] = [];

  loading = true;
  errorMessage = '';

  private registrationService = inject(EventRegistrationService);
  private eventService = inject(EventService);
  private personService = inject(PersonService);
  private squadronService = inject(SquadronService);
  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    try {
      const userId = this.authService.getUserId();
      if (!userId) throw new Error('Kein Benutzer eingeloggt.');
  
      // 🔹 Registrierungen direkt per User laden
      const regs = await firstValueFrom(this.registrationService.getByUser(userId));
  
      console.log('Registrierungen des Benutzers:', regs);

      if (!regs || regs.length === 0) {
        this.loading = false;
        return;
      }
  
      // 🔹 Events holen
      const eventIds = [...new Set(regs.map((r) => r.event_id))];
      const events = await Promise.all(eventIds.map((id) => firstValueFrom(this.eventService.getById(id))));
  
      // 🔹 Registrierungen zusammenfassen
      this.registrations = regs.map((r) => {
        const evt = events.find((e) => e.id === r.event_id);
        const participants = r.participants?.length || 0;
  
        return {
          eventId: r.event_id,
          eventName: evt?.name || 'Unbekanntes Event',
          eventStart: evt?.start_date || '',
          eventEnd: evt?.end_date || '',
          participantCount: participants,
          squadronCount: r.participants?.filter((p) => p.squadron_id)?.length || 0,
          status: r.status || 'in_auswahl',
          wishes: r.wishes || null,
          catering_type: r.catering_type || null,
          license_plate: r.license_plate || null,
          start_number: r.start_number || null,
          phone_number: r.phone_number || null,
        };
      });
  
      this.loading = false;
    } catch (err) {
      console.error(err);
      this.errorMessage = '❌ Fehler beim Laden deiner Anmeldungen.';
      this.loading = false;
    }
  }
  

  // ======================================================
  // 🔹 Bearbeiten (geht zur Event-Registrierungsseite)
  // ======================================================
  goToEvent(eventId: string | null) {
    if (!eventId) {
      alert('❌ Ungültige Event-ID.');
      return;
    }
    this.router.navigate(['/event-registration', eventId]);
  }

  // ======================================================
  // 🔹 Stornieren (löscht ALLE Registrierungen des Users für das Event)
  // ======================================================
  async cancelRegistration(eventId: string | null) {
    if (!eventId) return alert('❌ Ungültige Event-ID.');
    if (!confirm('⚠️ Willst du deine Anmeldung wirklich stornieren?')) return;
  
    try {
      const userId = this.authService.getUserId();
      const regs = await firstValueFrom(this.registrationService.getByUser(userId!));
      const reg = regs.find((r) => r.event_id === eventId);
      if (!reg?.id) return alert('⚠️ Keine Registrierung gefunden.');
  
      await firstValueFrom(this.registrationService.delete(reg.id));
  
      this.registrations = this.registrations.filter((r) => r.eventId !== eventId);
      alert('✅ Deine Anmeldung wurde storniert.');
    } catch (err) {
      console.error('❌ Fehler beim Stornieren:', err);
      alert('❌ Fehler beim Stornieren der Anmeldung.');
    }
  }
  

}
