import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { EventService } from '../../../core/services/event.service';
import { EventRegistrationService, EventRegistrationInterface } from '../../../core/services/event-registration.service';
import { PersonService, Person } from '../../../core/services/person.service';
import { SquadronService } from '../../../core/services/squadron.service';
import { AuthService } from '../../../core/auth.service';


@Component({
  selector: 'app-event-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-registration.html',
  styleUrls: ['./event-registration.css']
})
export class EventRegistration implements OnInit {

  // --- UI/State ---
  event: any = null;
  squadrons: any[] = [];
  existingPersons: Person[] = [];
  participants: Array<{ index: number; form: FormGroup }> = [];

  loading = true;
  errorMessage = '';
  isRegistered = false;             // mind. 1 Registrierung in dieser Session
  createdRegistrationIds: string[] = [];

  // --- DI ---
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private registrationService = inject(EventRegistrationService);
  private personService = inject(PersonService);
  private squadronService = inject(SquadronService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (!eventId) {
      this.errorMessage = 'Event-ID fehlt!';
      this.loading = false;
      return;
    }

    // 1) Event laden (inkl. Relationen)
    this.eventService.getById(eventId).subscribe({
      next: (evt) => {
        this.event = evt;
        // Staffeln aus Event (falls mitgeladen)
        this.squadrons = Array.isArray(evt?.squadrons) ? evt.squadrons : [];

        // 2) Eigene Personen laden (owner_id = aktuelle Person des Users)
        const ownerId =
          (this.authService as any)?.currentUserValue?.person_id ||
          (this.authService as any)?.getPersonId?.() ||
          null;

        if (ownerId) {
          this.personService.getAll(ownerId).subscribe({
            next: (persons) => {
              this.existingPersons = persons || [];
              this.loading = false;
            },
            error: () => {
              // notfalls ohne vorhandene Personen weitermachen
              this.loading = false;
            }
          });
        } else {
          // kein Owner bekannt → trotzdem UI zeigen
          this.loading = false;
        }

        // 3) Mindestens einen Teilnehmer vorbereiten
        this.addPerson();
      },
      error: () => {
        this.errorMessage = '❌ Event konnte nicht geladen werden.';
        this.loading = false;
      }
    });

    // Falls du Staffeln lieber separat laden willst (Backup):
    // this.squadronService.getByEvent(eventId).subscribe({
    //   next: (sq) => this.squadrons = sq || [],
    //   error: () => {}
    // });
  }

  // ---------- Teilnehmer-Form erstellen ----------
  private buildParticipantForm(): FormGroup {
    return this.fb.group({
      person_id: [''],                 // wenn leer -> neue Person wird angelegt
      first_name: [''],
      last_name: [''],
      birth_date: [''],
      email: [''],

      participation_type: ['einzeln', Validators.required],  // 'einzeln' | 'staffel'
      squadron_id: [null],                                    // Staffel optional
    });
  }

  // ---------- Teilnehmer verwalten ----------
  addPerson(): void {
    const index = this.participants.length;
    const form = this.buildParticipantForm();
    this.participants.push({ index, form });
  }

  removePerson(idx: number): void {
    this.participants = this.participants.filter(p => p.index !== idx)
      .map((p, i) => ({ ...p, index: i })); // reindex
  }

  updatePerson(idx: number, value: any): void {
    const row = this.participants.find(p => p.index === idx);
    if (row) row.form.patchValue(value);
  }

  // ---------- Registrierung aller Teilnehmer ----------
  async registerAll(): Promise<void> {
    if (!this.event?.id) {
      alert('Event fehlt.');
      return;
    }

    // einfache Validierung pro Teilnehmer:
    for (const p of this.participants) {
      const val = p.form.value;
      const hasExisting = !!val.person_id;
      const hasNewMinimal = !!val.first_name && !!val.last_name; // Email optional
      if (!hasExisting && !hasNewMinimal) {
        alert(`Bitte Daten für Teilnehmer ${p.index + 1} angeben (entweder Person wählen oder Vor-/Nachname eingeben).`);
        return;
      }
      if (val.participation_type === 'staffel' && !val.squadron_id) {
        alert(`Bitte Staffel für Teilnehmer ${p.index + 1} auswählen oder Teilnahmeart auf "Einzeln" stellen.`);
        return;
      }
    }

    try {
      const ownerId =
        (this.authService as any)?.currentUserValue?.person_id ||
        (this.authService as any)?.getPersonId?.() ||
        null;

      for (const p of this.participants) {
        const v = p.form.value as {
          person_id?: string;
          first_name?: string;
          last_name?: string;
          birth_date?: string;
          email?: string;
          participation_type: 'einzeln' | 'staffel';
          squadron_id?: string | null;
        };

        let personId = v.person_id;

        // 1) ggf. neue Person anlegen
        if (!personId) {
          const newPerson: Person = {
            first_name: v.first_name!.trim(),
            last_name: v.last_name!.trim(),
            birth_date: v.birth_date || undefined,
            email: v.email || undefined,
            owner_id: ownerId || null,
          };
          const created = await firstValueFrom(this.personService.create(newPerson));
          personId = created.id!;
          // Liste auffrischen (UX): neue Person den vorhandenen hinzufügen
          this.existingPersons.push(created);
        }

        // 2) Registrierung anlegen
        const payload: EventRegistrationInterface = {
          event_id: this.event.id,
          person_id: personId!,
          squadron_id: v.participation_type === 'staffel' ? (v.squadron_id || null) : null,
          participation_type: v.participation_type,
          liability_accept: true, // Pflichtfeld im Backend
          status: 'in_auswahl',
        };

        const createdReg = await firstValueFrom(this.registrationService.create(payload));
        if (createdReg?.id) {
          this.createdRegistrationIds.push(createdReg.id);
        }
      }

      this.isRegistered = this.createdRegistrationIds.length > 0;
      alert('✅ Erfolgreich angemeldet!');
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || 'Fehler bei der Anmeldung.';
      alert(`❌ ${msg}`);
      console.error('❌ Fehler bei registerAll():', err);
    }
  }

  // ---------- Unterkunft buchen (mit Prüfung) ----------
  goToAccommodation(): void {
    if (!this.isRegistered || this.createdRegistrationIds.length === 0) {
      // Popup-Hinweis
      alert('⚠️ Du bist für dieses Event noch nicht angemeldet. Bitte melde dich zuerst an, bevor du eine Unterkunft buchst.');
      return;
    }

    // Zu deiner Buchungsseite gehen (Route ggf. anpassen)
    // Variante 1: Query-Param mit eventId
    this.router.navigate(['/accommodations'], { queryParams: { eventId: this.event.id } });

    // Variante 2 (falls du eine dedizierte Seite hast):
    // this.router.navigate(['/accommodation-booking', this.event.id]);
  }

  // ---------- Meine Anmeldungen ----------
  goToMyRegistrations(): void {
    this.router.navigate(['/my-registrations']);
  }

  // ---------- Zurück (falls benötigt) ----------
  goBack(): void {
    this.router.navigate(['/events']);
  }
}
