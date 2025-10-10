import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { EventService } from '../../../core/services/event.service';
import { EventRegistrationService, EventRegistrationInterface } from '../../../core/services/event-registration.service';
import { PersonService, Person } from '../../../core/services/person.service';
import { SquadronService } from '../../../core/services/squadron.service';
import { AuthService } from '../../../core/auth.service';

type AddedPerson = Person & { inSquadron?: boolean };

@Component({
  selector: 'app-event-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-registration.html',
  styleUrls: ['./event-registration.css'],
})
export class EventRegistration implements OnInit {
  event: any = null;
  squadrons: any[] = [];
  existingPersons: Person[] = [];
  addedPersons: AddedPerson[] = [];

  loading = true;
  errorMessage = '';
  isRegistered = false;
  createdRegistrationIds: string[] = [];

  showNewSquadronForm = false;

  // Forms
  registrationForm!: FormGroup;
  personForm!: FormGroup;
  squadronForm!: FormGroup;

  // Services
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

    this.initForms();

    // 1️⃣ Event + Staffeln laden
    this.eventService.getById(eventId).subscribe({
      next: (evt) => {
        this.event = evt;
        this.squadrons = evt?.squadrons || [];
        this.loadPersons();
      },
      error: () => {
        this.errorMessage = '❌ Event konnte nicht geladen werden.';
        this.loading = false;
      },
    });
  }

  private loadPersons() {
    const ownerId =
      (this.authService as any)?.currentUserValue?.person_id ||
      (this.authService as any)?.getPersonId?.() ||
      null;

    if (!ownerId) {
      this.loading = false;
      return;
    }

    this.personService.getAll(ownerId).subscribe({
      next: (res) => {
        this.existingPersons = res || [];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  private initForms(): void {
    this.registrationForm = this.fb.group({
      teilnahme_art: ['einzeln', Validators.required],
      squadron_id: [null],
      kfz_kennzeichen: [''],
      startnummer: [''],
      verpflegung_art: [''],
      wuensche: [''],
      geschlecht: ['m'],
      verein: [''],
      status: ['in_auswahl'],
      staffel_aufnahme: [''],
      haftungsausschluss: [false, Validators.requiredTrue],
    });

    this.personForm = this.fb.group({
      person_id: [''],
      first_name: [''],
      last_name: [''],
      birth_date: [''],
      email: [''],
    });

    this.squadronForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
  }

  // ✅ Bestehende Person auswählen
  onSelectExistingPerson(e: any): void {
    const id = e.target.value;
    if (!id) return;
    const person = this.existingPersons.find((p) => p.id === id);
    if (!person) return;

    this.addedPersons.push({ ...person, inSquadron: false });
    this.existingPersons = this.existingPersons.filter((p) => p.id !== id);
    this.personForm.reset();
  }

  // ✅ Neue Person anlegen
  async addPerson(): Promise<void> {
    const v = this.personForm.value;
    if (!v.first_name || !v.last_name) {
      alert('Bitte Vor- und Nachname eingeben.');
      return;
    }

    try {
      const ownerId =
        (this.authService as any)?.currentUserValue?.person_id ||
        (this.authService as any)?.getPersonId?.() ||
        null;

      const newPerson: Person = {
        first_name: v.first_name.trim(),
        last_name: v.last_name.trim(),
        birth_date: v.birth_date || undefined,
        email: v.email || undefined,
        owner_id: ownerId,
      };

      const created = await firstValueFrom(this.personService.create(newPerson));
      this.addedPersons.push({ ...created, inSquadron: false });
      this.personForm.reset();
    } catch (err) {
      alert('❌ Fehler beim Hinzufügen der Person.');
      console.error(err);
    }
  }

  toggleNewSquadronForm() {
    this.showNewSquadronForm = !this.showNewSquadronForm;
  }

  // ✅ Staffel erstellen
  async createSquadron(): Promise<void> {
    if (!this.squadronForm.valid || !this.event?.id)
      return alert('Bitte Staffelname angeben.');

    try {
      const payload = {
        name: this.squadronForm.value.name.trim(),
        description: this.squadronForm.value.description,
        event_id: this.event.id,
      };

      const created = await firstValueFrom(this.squadronService.create(payload));
      this.squadrons.push(created);
      alert(`✅ Staffel "${created.name}" wurde erstellt.`);
      this.squadronForm.reset();
      this.showNewSquadronForm = false;
    } catch (err) {
      console.error(err);
      alert('❌ Fehler beim Erstellen der Staffel.');
    }
  }

  // ✅ Registrierung absenden
  async registerAll(): Promise<void> {
    if (!this.event?.id) return alert('Event fehlt.');
    if (this.addedPersons.length === 0) return alert('Bitte mindestens eine Person hinzufügen.');
    if (this.registrationForm.invalid) return alert('Bitte Haftung akzeptieren.');

    try {
      for (const p of this.addedPersons) {
        const payload: EventRegistrationInterface = {
          event_id: this.event.id,
          person_id: p.id!,
          squadron_id:
            this.registrationForm.value.teilnahme_art === 'staffel'
              ? this.registrationForm.value.squadron_id
              : null,
          participation_type: this.registrationForm.value.teilnahme_art,
          liability_accept: this.registrationForm.value.haftungsausschluss,
          status: this.registrationForm.value.status,
          kfz_kennzeichen: this.registrationForm.value.kfz_kennzeichen,
          startnummer: this.registrationForm.value.startnummer,
          verpflegung_art: this.registrationForm.value.verpflegung_art,
          wuensche: this.registrationForm.value.wuensche,
          geschlecht: this.registrationForm.value.geschlecht,
          verein: this.registrationForm.value.verein,
          staffel_aufnahme: this.registrationForm.value.staffel_aufnahme,
        };

        const created = await firstValueFrom(this.registrationService.create(payload));
        if (created?.id) this.createdRegistrationIds.push(created.id);
      }

      this.isRegistered = this.createdRegistrationIds.length > 0;
      alert('✅ Erfolgreich angemeldet!');
    } catch (err) {
      console.error(err);
      alert('❌ Fehler bei der Anmeldung.');
    }
  }

  goToAccommodation() {
    if (!this.isRegistered) return alert('⚠️ Bitte melde dich zuerst an.');
    this.router.navigate(['/accommodations'], { queryParams: { eventId: this.event.id } });
  }

  goToMyRegistrations() {
    this.router.navigate(['/my-registrations']);
  }
}
