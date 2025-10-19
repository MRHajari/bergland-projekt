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

      // 1️⃣ Personen des eingeloggten Users laden
      const persons = await firstValueFrom(this.personService.getAll(userId));
      if (!persons || persons.length === 0) {
        this.errorMessage = '⚠️ Keine Personen gefunden.';
        this.loading = false;
        return;
      }

      // 2️⃣ Alle Registrierungen dieser Personen abrufen
      const allRegsNested = await Promise.all(
        persons.map((p) => firstValueFrom(this.registrationService.getByPerson(p.id!)))
      );
      const flatRegs = allRegsNested.flat() as EventRegistrationInterface[];

      if (flatRegs.length === 0) {
        this.loading = false;
        return;
      }

      // 3️⃣ Alle zugehörigen Events und Staffeln laden
      const eventIds = [...new Set(flatRegs.map((r) => r.event_id))];
      const events = await Promise.all(
        eventIds.map((id) => firstValueFrom(this.eventService.getById(id)))
      );
      const allSquadrons = (
        await Promise.all(
          eventIds.map((id) =>
            firstValueFrom(this.squadronService.getByEvent(id))
          )
        )
      ).flat();

      // 4️⃣ Gruppiere Registrierungen pro Event (eine Zeile pro Event)
      this.registrations = eventIds.map((eventId) => {
        const eventRegs = flatRegs.filter((r) => r.event_id === eventId);
        const evt = events.find((e) => e.id === eventId);
        const squads = allSquadrons.filter((s) => s.event_id === eventId);

        const ref = eventRegs[0]; // repräsentative Registrierung

        return {
          eventId,
          eventName: evt?.name || 'Unbekanntes Event',
          eventStart: evt?.start_date || '',
          eventEnd: evt?.end_date || '',
          participantCount: eventRegs.length,
          squadronCount: squads.length,
          status: ref.status || 'in_auswahl',
          wishes: ref.wishes || null,
          catering_type: ref.catering_type || null,
          license_plate: ref.license_plate || null,
          start_number: ref.start_number || null,
          phone_number: ref.phone_number || null,
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
    if (!eventId) {
      alert('❌ Ungültige Event-ID.');
      return;
    }

    if (
      !confirm(
        '⚠️ Willst du alle deine Anmeldungen für dieses Event wirklich stornieren?'
      )
    )
      return;

    try {
      const userId = this.authService.getUserId();
      const persons = await firstValueFrom(this.personService.getAll(userId!));
      const validPersonIds = persons
        .map((p) => p.id)
        .filter((id): id is string => !!id);

      // 🔁 Alle Registrierungen für dieses Event löschen
      for (const pid of validPersonIds) {
        await firstValueFrom(
          this.registrationService.deleteByEventAndPerson(eventId, pid)
        );
      }

      // UI aktualisieren
      this.registrations = this.registrations.filter(
        (r) => r.eventId !== eventId
      );
      alert('✅ Deine Anmeldung für dieses Event wurde storniert.');
    } catch (err) {
      console.error('❌ Fehler beim Stornieren:', err);
      alert('❌ Fehler beim Stornieren der Anmeldung.');
    }
  }
}
