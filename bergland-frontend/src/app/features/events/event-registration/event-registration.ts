import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { EventService } from '../../../core/services/event.service';
import {
  EventRegistrationService,
  EventRegistrationInterface,
  EventRegistrationGroupPayload,
} from '../../../core/services/event-registration.service';
import { PersonService, Person } from '../../../core/services/person.service';
import { SquadronService } from '../../../core/services/squadron.service';
import { AuthService } from '../../../core/auth.service';
import { BookingService, BookingInterface } from '../../../core/services/booking.service';

type CateringType = 'vegan' | 'vegetarisch' | null;

type EventParticipantUI = Person & {
  inSquadron?: boolean;
  squadronName?: string | null;

  // ✅ pro Teilnehmer
  catering_type?: CateringType | null;
  start_number?: number;
};

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
  addedPersons: EventParticipantUI[] = [];

  bookedAccommodations: BookingInterface[] = [];

  // ✅ wird für removePerson() gebraucht (Backend vs lokal)
  existingRegs: EventRegistrationInterface[] = [];
  existingRegistration: EventRegistrationInterface | null = null;

  loading = true;
  errorMessage = '';
  isRegistered = false;

  showNewSquadronForm = false;
  loggedPersonId: string | null = null;

  // ✅ UI-State: "Selbst" wurde ausgewählt, aber noch nicht hinzugefügt
  selfPending = false;

  registrationForm!: FormGroup;
  personForm!: FormGroup;
  squadronForm!: FormGroup;

  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private registrationService = inject(EventRegistrationService);
  private personService = inject(PersonService);
  private squadronService = inject(SquadronService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    this.loggedPersonId = this.authService.getPersonId();

    if (!eventId) {
      this.errorMessage = 'Event-ID fehlt!';
      this.loading = false;
      return;
    }

    this.initForms();

    this.eventService.getById(eventId).subscribe({
      next: (evt) => {
        this.event = evt;
        this.squadrons = evt?.squadrons || [];
        this.loadPersons();
        this.loadExistingRegistration(eventId);
      },
      error: () => {
        this.errorMessage = '❌ Event konnte nicht geladen werden.';
        this.loading = false;
      },
    });
  }

  get isSelfAlreadyAdded(): boolean {
    return this.addedPersons.some((p) => p.id === this.loggedPersonId);
  }

  // ======================================================
  // 🔹 Personen des eingeloggten Users laden
  // ======================================================
  private loadPersons() {
    // ✅ owner_id in deiner Person-Tabelle ist user.id → also getUserId()
    const ownerId =
      this.authService.getUserId?.() ||
      (this.authService as any)?.currentUserValue?.id ||
      (this.authService as any)?.currentUserValue?.user_id ||
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

  // ======================================================
  // 🔹 Bestehende Gruppen-Registrierung für dieses Event laden
  // ======================================================
  private async loadExistingRegistration(eventId: string) {
    try {
      const userId = this.authService.getUserId();
      const myPersonId = this.authService.getPersonId();

      if (!userId || !myPersonId) {
        console.warn('⚠️ Kein eingeloggter Benutzer oder keine Person-ID gefunden.');
        this.loading = false;
        return;
      }

      // 1️⃣ Personen des Users laden
      const persons = await firstValueFrom(this.personService.getAll(userId));
      this.existingPersons = persons || [];

      // 2️⃣ Alle Gruppen-Registrierungen fürs Event laden
      const allRegs = await firstValueFrom(
        this.registrationService.getGroupByEvent(eventId)
      );

      // ✅ WICHTIG: damit removePerson() Backend-Datensätze findet
      this.existingRegs = allRegs || [];

      // 3️⃣ Meine Registrierung finden
      this.existingRegistration =
        (this.existingRegs || []).find(
          (r: any) =>
            r.registered_by_person?.id === myPersonId ||
            r.registered_by_person_id === myPersonId
        ) || null;

      // 4️⃣ Keine Registrierung → UI bleibt offen
      if (!this.existingRegistration) {
        this.isRegistered = false;
        this.loading = false;
        return;
      }

      // 5️⃣ Teilnehmer mappen (inkl. catering + start_number)
      if (this.existingRegistration?.participants?.length) {
        const squadronMap: Record<string, string> = {};
        for (const s of this.squadrons) squadronMap[s.id] = s.name;

        this.addedPersons = this.existingRegistration.participants
          .filter((p: any) => !!p.person)
          .map((p: any) => ({
            ...(p.person as Person),
            inSquadron: !!p.squadron_id,
            squadronName: p.squadron_id
              ? squadronMap[p.squadron_id] || 'Unbekannte Staffel'
              : null,
            catering_type: (p.catering_type ?? null) as CateringType,
            start_number: Number(p.start_number),
          } as EventParticipantUI));

        console.log('🧪 addedPersons after load:', this.addedPersons);


        const addedIds = new Set(this.addedPersons.map((p) => p.id));
        this.existingPersons = this.existingPersons.filter((p) => !addedIds.has(p.id!));
      }

      // 6️⃣ Formular füllen (NUR Kopf-Felder!)
      const r = this.existingRegistration;
      this.registrationForm.patchValue({
        phone_number: r.phone_number || '',
        license_plate: r.license_plate || '',
        wishes: r.wishes || '',
        club: r.club || '',
        status: r.status || 'In Bearbeitung',
        liability_accept: true,
      });

      // 7️⃣ Status + Buchungen laden
      this.isRegistered = true;
      this.loading = false;

      await this.loadBookingsForRegistration();
    } catch (err) {
      console.error('❌ Fehler beim Laden bestehender Registrierung:', err);
      this.loading = false;
    }
  }

  // ======================================================
  // 🔹 Formulare initialisieren
  // ======================================================
  private initForms(): void {
    this.registrationForm = this.fb.group({
      teilnahme_art: ['einzeln', Validators.required],
      squadron_id: [null],

      license_plate: [''],
      phone_number: [''],
      wishes: [''],
      club: [''],

      // ✅ Backend-Enum!
      status: ['In Bearbeitung'],

      liability_accept: [false, Validators.requiredTrue],
    });

    // ✅ Person + Participant Eingabe (Gender pro Person, Catering pro Teilnehmer)
    this.personForm = this.fb.group({
      person_id: [''],

      first_name: [''],
      last_name: [''],
      birth_date: [''],

      gender: ['m'], // ✅ pro Person

      email: [''],
      phone: [''],

      street: [''],
      postal_code: [''],
      city: [''],
      country: ['Deutschland'],

      catering_type: [null as CateringType], // ✅ pro Teilnehmer
    });

    this.squadronForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
  }

  // ======================================================
  // 🔹 Bestehende Person auswählen → Formular füllen (NICHT sofort hinzufügen)
  // ======================================================
  async onSelectExistingPerson(e: any): Promise<void> {
    const id = e.target.value;
    if (!id) {
      this.selfPending = false;
      this.resetPersonFormDefaults();
      return;
    }

    const person = this.existingPersons.find((p) => p.id === id);
    if (!person) return;

    this.selfPending = false;
    this.personForm.patchValue({
      person_id: person.id || '',
      first_name: person.first_name || '',
      last_name: person.last_name || '',
      birth_date: person.birth_date || '',
      gender: person.gender || 'm',
      email: person.email || '',
      phone: person.phone || '',
      street: person.street || '',
      postal_code: person.postal_code || '',
      city: person.city || '',
      country: person.country || 'Deutschland',
      catering_type: null,
    });
  }

  // ======================================================
  // 🔹 "Mich selbst" auswählen → Formular füllen (danach über Add hinzufügen)
  // ======================================================
  toggleSelfRegistration(e: any) {
    const checked = e.target.checked;
    const personId = this.authService.getPersonId();

    if (!personId) {
      alert('❌ Dein Benutzer ist keiner Person zugeordnet.');
      return;
    }

    // Wenn bereits hinzugefügt → Entfernen über removePerson()
    if (!checked && this.isSelfAlreadyAdded) {
      this.removePerson(personId);
      return;
    }

    // Wenn pending → abbrechen
    if (!checked && this.selfPending) {
      this.selfPending = false;
      this.resetPersonFormDefaults();
      return;
    }

    if (checked && !this.isSelfAlreadyAdded) {
      this.selfPending = true;

      this.personService.getById(personId).subscribe({
        next: (p) => {
          if (!p) {
            alert('❌ Personendaten konnten nicht geladen werden.');
            return;
          }

          this.personForm.patchValue({
            person_id: p.id || '',
            first_name: p.first_name || '',
            last_name: p.last_name || '',
            birth_date: p.birth_date || '',
            gender: p.gender || 'm',
            email: p.email || '',
            phone: p.phone || '',
            street: p.street || '',
            postal_code: p.postal_code || '',
            city: p.city || '',
            country: p.country || 'Deutschland',
            catering_type: null,
          });
        },
        error: (err) => {
          console.error('❌ Fehler beim Laden der eigenen Person:', err);
          alert('Fehler beim Laden deiner Person.');
        },
      });
    }
  }

  // ======================================================
  // 🔹 Neue Person hinzufügen oder ausgewählte Person übernehmen
  // ======================================================
  async addPerson(): Promise<void> {
  const v = this.personForm.value;

  if (!v.first_name || !v.last_name) {
    alert('Bitte Vor- und Nachname eingeben.');
    return;
  }

  const participationType = this.registrationForm.value.teilnahme_art;
  const squadronId =
    participationType === 'staffel'
      ? this.registrationForm.value.squadron_id
      : null;

  if (participationType === 'staffel' && !squadronId) {
    alert('Bitte zuerst eine Staffel auswählen.');
    return;
  }

  const squadronName = squadronId
    ? this.squadrons.find((s) => s.id === squadronId)?.name || 'Unbekannte Staffel'
    : null;

  const ownerId = this.authService.getUserId();
  if (!ownerId) {
    alert('⚠️ Kein eingeloggter Benutzer gefunden.');
    return;
  }

  const first = v.first_name.trim();
  const last = v.last_name.trim();
  const selectedPersonId = (v.person_id || '').trim();

  let person: Person | null = null;

  try {
    // ======================================================
    // 🔹 FALL A: Bestehende Person (NUR wenn person_id gesetzt!)
    // ======================================================
    if (selectedPersonId) {
      person =
        this.existingPersons.find((p) => p.id === selectedPersonId) ||
        (await firstValueFrom(this.personService.getById(selectedPersonId)));

      if (!person?.id) {
        alert('❌ Ausgewählte Person konnte nicht geladen werden.');
        return;
      }

      const updatePayload: Partial<Person> = {
        first_name: first,
        last_name: last,
        birth_date: v.birth_date || undefined,
        gender: v.gender || 'm',
        email: v.email || undefined,
        phone: v.phone || undefined,
        street: v.street || undefined,
        postal_code: v.postal_code || undefined,
        city: v.city || undefined,
        country: v.country || 'Deutschland',
      };

      await firstValueFrom(this.personService.update(person.id, updatePayload));
      person = { ...person, ...updatePayload };
    }

    // ======================================================
    // 🔹 FALL B: Neue Person (NUR wenn KEINE person_id!)
    // ======================================================
    if (!selectedPersonId) {
      const allPersons = await firstValueFrom(this.personService.getAll(ownerId));
      const existingPerson = (allPersons || []).find(
        (p) =>
          p.first_name.toLowerCase() === first.toLowerCase() &&
          p.last_name.toLowerCase() === last.toLowerCase()
      );

      if (existingPerson) {
        person = existingPerson;
      } else {
        const newPerson: Person = {
          first_name: first,
          last_name: last,
          birth_date: v.birth_date || undefined,
          gender: v.gender || 'm',
          email: v.email || undefined,
          phone: v.phone || undefined,
          street: v.street || undefined,
          postal_code: v.postal_code || undefined,
          city: v.city || undefined,
          country: v.country || 'Deutschland',
          owner_id: ownerId,
        };

        const created = await firstValueFrom(this.personService.create(newPerson));
        if (!created?.id) {
          alert('❌ Person konnte nicht korrekt angelegt werden.');
          return;
        }
        person = created;
      }
    }

    if (!person?.id) {
      alert('❌ Interner Fehler: Person konnte nicht ermittelt werden.');
      return;
    }

    const resolvedPerson = person;

    // ======================================================
    // 🔹 Doppelt hinzufügen verhindern
    // ======================================================
    if (this.addedPersons.some((p) => p.id === resolvedPerson.id)) {
      alert(`${resolvedPerson.first_name} ${resolvedPerson.last_name} wurde bereits hinzugefügt.`);
      return;
    }

    // ======================================================
    // 🔹 Lokal hinzufügen
    // ======================================================
    const participantToAdd = {
      ...resolvedPerson,
      inSquadron: !!squadronId,
      squadronName,
      catering_type: v.catering_type ?? null,
      start_number: 0,
    } as EventParticipantUI;

    this.addedPersons.push(participantToAdd);

    this.existingPersons = this.existingPersons.filter((ep) => ep.id !== resolvedPerson.id);

    if (resolvedPerson.id === this.loggedPersonId) {
      this.selfPending = false;
    }

    this.resetPersonFormDefaults();
  } catch (err) {
    console.error('❌ Fehler beim Hinzufügen der Person:', err);
    alert('Fehler beim Hinzufügen der Person.');
  }
}


  private resetPersonFormDefaults(): void {
    this.personForm.reset({
      person_id: '',
      first_name: '',
      last_name: '',
      birth_date: '',
      gender: 'm',
      email: '',
      phone: '',
      street: '',
      postal_code: '',
      city: '',
      country: 'Deutschland',
      catering_type: null,
    });
  }

  // ======================================================
  // 🔹 Person entfernen (Backend oder lokal)
  // ======================================================
  async removePerson(personId?: string) {
    if (!personId) return;

    const eventId = this.event?.id;
    if (!eventId) {
      console.warn('⚠️ Keine Event-ID vorhanden.');
      return;
    }

    const removed = this.addedPersons.find((p) => p.id === personId) || null;

    // ✅ passende Registrierung in existingRegs suchen (Backend)
    const reg = (this.existingRegs || []).find((r: any) => {
      const participants = (r.participants || []) as any[];
      return r.event_id === eventId && participants.some((pp: any) => pp.person_id === personId);
    });

    // ✅ Nur lokal
    if (!reg) {
      this.addedPersons = this.addedPersons.filter((p) => p.id !== personId);
      const removedPerson = removed as Person | null;
      if (removedPerson?.id && !this.existingPersons.some((ep: Person) => ep.id === removedPerson.id)) {
        this.existingPersons.push(removedPerson);
      }
      return;
    }

    if (!window.confirm('Willst du diese Person wirklich aus der Registrierung entfernen?')) return;

    try {
      const participant = reg.participants?.find((pp: any) => pp.person_id === personId);
      if (!participant?.id) {
        console.warn('⚠️ Kein Teilnehmer-Datensatz für diese Person gefunden.');
        return;
      }

      await firstValueFrom(this.registrationService.deleteParticipant(participant.id));

      this.addedPersons = this.addedPersons.filter((p) => p.id !== personId);

      // ✅ existingRegs aktualisieren
      this.existingRegs = this.existingRegs.map((r: any) => ({
        ...r,
        participants: r.participants?.filter((pp: any) => pp.person_id !== personId),
      }));

      const removedPerson = removed as Person | null;
      if (removedPerson?.id && !this.existingPersons.some((ep: Person) => ep.id === removedPerson.id)) {
        this.existingPersons.push(removedPerson);
      }

      // ✅ Nach dem Entfernen neu laden (um Startnummern etc. konsistent zu halten)
      await this.loadExistingRegistration(eventId);
    } catch (err) {
      console.error('❌ Fehler beim Entfernen der Person:', err);
      alert('❌ Entfernen fehlgeschlagen – siehe Konsole für Details.');
    }
  }

  // ======================================================
  // 🔹 Staffelverwaltung
  // ======================================================
  toggleNewSquadronForm() {
    this.showNewSquadronForm = !this.showNewSquadronForm;
  }

  async createSquadron(): Promise<void> {
    if (!this.squadronForm.valid || !this.event?.id) return alert('Bitte Staffelname angeben.');

    try {
      const payload = {
        name: this.squadronForm.value.name.trim(),
        description: this.squadronForm.value.description,
        event_id: this.event.id,
      };

      const created = await firstValueFrom(this.squadronService.create(payload));

      if (created) {
        this.squadrons.push(created);

        this.registrationForm.patchValue({
          squadron_id: created.id,
          teilnahme_art: 'staffel',
        });
      }

      this.squadronForm.reset();
      this.showNewSquadronForm = false;
    } catch (err) {
      console.error(err);
      alert('❌ Fehler beim Erstellen der Staffel.');
    }
  }

  // ======================================================
  // 🔹 Registrierung erstellen (mit Teilnehmern)
  // ======================================================
  async registerAll(): Promise<void> {
    if (!this.event?.id) return alert('❌ Event fehlt.');
    if (this.addedPersons.length === 0) return alert('Bitte mindestens eine Person hinzufügen.');
    if (this.registrationForm.invalid) return alert('Bitte Haftung akzeptieren.');

    try {
      const personId = this.authService.getPersonId();
      if (!personId) {
        alert('❌ Kein eingeloggter Benutzer gefunden.');
        return;
      }

      if (this.existingRegistration) {
        alert('⚠️ Du bist bereits für dieses Event angemeldet.');
        return;
      }

      const payload: EventRegistrationGroupPayload = {
        event_id: this.event.id,
        registered_by_person_id: personId,
        phone_number: this.registrationForm.value.phone_number || null,
        license_plate: this.registrationForm.value.license_plate || null,
        wishes: this.registrationForm.value.wishes || null,
        club: this.registrationForm.value.club || null,
        status: this.registrationForm.value.status || 'In Bearbeitung',

        participants: this.addedPersons.map((p) => ({
          person_id: p.id!,
          squadron_id:
            this.registrationForm.value.teilnahme_art === 'staffel'
              ? this.registrationForm.value.squadron_id
              : null,
          participation_type: this.registrationForm.value.teilnahme_art,
          liability_accept: this.registrationForm.value.liability_accept,
          catering_type: p.catering_type ?? null,
        })) as any,
      };

      const created = await firstValueFrom(
        this.registrationService.createGroupRegistration(payload)
      );

      const newReg = (created as any)?.registration || created;
      if (newReg?.id) {
        this.existingRegistration = newReg as any;
        this.isRegistered = true;
        alert('✅ Anmeldung erfolgreich erstellt!');

        // ✅ WICHTIG: neu laden → Participant IDs + Startnummern kommen vom Backend
        await this.loadExistingRegistration(this.event.id);
      } else {
        alert('❌ Unerwartete Antwort vom Server – keine Registrierung-ID.');
      }
    } catch (err) {
      console.error('❌ Fehler bei der Gruppenregistrierung:', err);
      alert('❌ Fehler bei der Anmeldung.');
    }
  }

  // ======================================================
  // 🔹 Registrierung updaten / Teilnehmer ergänzen
  // ======================================================
  async updateRegistration(): Promise<void> {
    if (!this.event?.id) return alert('❌ Event-ID fehlt.');

    try {
      const personId = this.authService.getPersonId();
      if (!personId) {
        alert('❌ Kein eingeloggter Benutzer gefunden.');
        return;
      }

      // 1️⃣ Falls keine Registrierung → neu anlegen
      if (!this.existingRegistration) {
        const payload: EventRegistrationGroupPayload = {
          event_id: this.event.id,
          registered_by_person_id: personId,
          phone_number: this.registrationForm.value.phone_number || null,
          license_plate: this.registrationForm.value.license_plate || null,
          wishes: this.registrationForm.value.wishes || null,
          club: this.registrationForm.value.club || null,
          status: this.registrationForm.value.status || 'In Bearbeitung',

          participants: this.addedPersons.map((p) => ({
            person_id: p.id!,
            squadron_id:
              this.registrationForm.value.teilnahme_art === 'staffel'
                ? this.registrationForm.value.squadron_id
                : null,
            participation_type: this.registrationForm.value.teilnahme_art,
            liability_accept: this.registrationForm.value.liability_accept,
            catering_type: p.catering_type ?? null,
          })) as any,
        };

        const created = await firstValueFrom(
          this.registrationService.createGroupRegistration(payload)
        );

        const newReg = (created as any)?.registration || created;
        if (newReg?.id) {
          this.existingRegistration = newReg as any;
          this.isRegistered = true;
          alert('✅ Registrierung erfolgreich angelegt!');

          // ✅ neu laden → Startnummern/IDs
          await this.loadExistingRegistration(this.event.id);
        }
        return;
      }

      // 2️⃣ Teilnehmer hinzufügen, die noch nicht im Backend sind
      const regId = this.existingRegistration.id!;
      const existingParticipantIds =
        (this.existingRegistration.participants as any[])?.map((pp: any) => pp.person_id) || [];

      const newParticipants = this.addedPersons.filter(
        (p) => !existingParticipantIds.includes(p.id!)
      );

      for (const p of newParticipants) {
        const participantPayload = {
          registration_id: regId,
          person_id: p.id!,
          squadron_id:
            this.registrationForm.value.teilnahme_art === 'staffel'
              ? this.registrationForm.value.squadron_id
              : null,
          participation_type: this.registrationForm.value.teilnahme_art,
          liability_accept: this.registrationForm.value.liability_accept,
          catering_type: p.catering_type ?? null,
        };

        await firstValueFrom(this.registrationService.addParticipant(participantPayload as any));
      }

      // 3️⃣ Header-Daten updaten
      const headerUpdate: Partial<EventRegistrationInterface> = {
        phone_number: this.registrationForm.value.phone_number || null,
        license_plate: this.registrationForm.value.license_plate || null,
        wishes: this.registrationForm.value.wishes || null,
        club: this.registrationForm.value.club || null,
        status: this.registrationForm.value.status || 'In Bearbeitung',
      };

      await firstValueFrom(this.registrationService.update(regId, headerUpdate));

      this.isRegistered = true;
      alert('✅ Registrierung erfolgreich aktualisiert!');

      // ✅ neu laden → Startnummern/Teilnehmerliste konsistent
      await this.loadExistingRegistration(this.event.id);
    } catch (err) {
      console.error('❌ Fehler beim Aktualisieren oder Anlegen:', err);
      alert('❌ Fehler beim Aktualisieren der Anmeldung.');
    }
  }

  // ======================================================
  // 🔹 Navigation
  // ======================================================
  goToAccommodation(): void {
    if (!this.isRegistered) {
      alert('⚠️ Bitte melde dich zuerst für das Event an.');
      return;
    }

    if (!this.event?.id) {
      alert('❌ Event-ID fehlt – Navigation nicht möglich.');
      return;
    }

    if (!this.existingRegistration?.id) {
      alert('❌ Registrierung-ID fehlt – bitte erneut versuchen.');
      return;
    }

    this.router.navigate(['/booking-accommodation'], {
      queryParams: {
        eventId: this.event.id,
        registrationId: this.existingRegistration.id,
      },
    });
  }

  goToMyRegistrations() {
    this.router.navigate(['/my-registrations']);
  }

  // ======================================================
  // 🔹 Anmeldung stornieren
  // ======================================================
  async cancelRegistration(): Promise<void> {
    if (!this.existingRegistration) {
      alert('❌ Es wurde keine bestehende Anmeldung gefunden.');
      return;
    }

    if (!confirm('⚠️ Willst du deine Anmeldung wirklich stornieren?')) return;

    try {
      await firstValueFrom(this.registrationService.delete(this.existingRegistration.id!));

      // UI zurücksetzen
      this.isRegistered = false;
      this.existingRegistration = null;
      this.existingRegs = [];
      this.addedPersons = [];

      alert('✅ Deine Anmeldung wurde erfolgreich storniert.');
      this.loadPersons();
    } catch (err) {
      console.error('❌ Fehler beim Stornieren:', err);
      alert('Fehler beim Stornieren der Anmeldung.');
    }
  }

  private async loadBookingsForRegistration(): Promise<void> {
    if (!this.existingRegistration?.id) return;

    try {
      const bookings = await firstValueFrom(
        this.bookingService.getAllByRegistration(this.existingRegistration.id)
      );
      this.bookedAccommodations = bookings || [];
    } catch (err: any) {
      if (err.status === 404) {
        this.bookedAccommodations = [];
      } else {
        console.error('❌ Fehler beim Laden der gebuchten Unterkünfte:', err);
      }
    }
  }
}
