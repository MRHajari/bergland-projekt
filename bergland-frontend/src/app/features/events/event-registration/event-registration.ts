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

type AddedPerson = Person & { inSquadron?: boolean; squadronName?: string | null; };

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

  existingRegs: EventRegistrationInterface[] = []; // ✅ neu hinzugefügt
  existingRegistration: EventRegistrationInterface | null = null;


  loading = true;
  errorMessage = '';
  isRegistered = false;
  createdRegistrationIds: string[] = [];
  showNewSquadronForm = false;

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

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
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

  // ======================================================
  // 🔹 Personen des eingeloggten Users laden
  // ======================================================
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

  // ======================================================
// 🔹 Bestehende Registrierungen für dieses Event laden
// ======================================================
private async loadExistingRegistration(eventId: string) {
  try {
    const userId = this.authService.getUserId();

    if (!userId) {
      console.warn('⚠️ Kein eingeloggter Benutzer gefunden.');
      return;
    }

    // 1️⃣ Personen dieses Users laden
    const persons = await firstValueFrom(this.personService.getAll(userId));
    if (!persons || persons.length === 0) {
      console.warn('⚠️ Keine Personen gefunden, die diesem Benutzer gehören.');
      return;
    }

    // 2️⃣ Registrierungen für jede Person laden
    const allRegs = await Promise.all(
      persons
        .filter((p) => !!p.id)
        .map((p) => firstValueFrom(this.registrationService.getByPerson(p.id!)))
    );

    const flatRegs = allRegs.flat() as EventRegistrationInterface[];

    // 3️⃣ Filtere nur Registrierungen für dieses Event
    this.existingRegs = flatRegs.filter((r) => r.event_id === eventId);

    // 4️⃣ Staffel-Infos vorbereiten
    const squadronMap: Record<string, string> = {};
    for (const s of this.squadrons) {
      squadronMap[s.id] = s.name;
    }

    // ============================================================
    // 🔹 Personen trennen & Staffelname anhängen
    // ============================================================
    if (this.existingRegs.length > 0) {
      this.isRegistered = true;

      // Erste Registrierung fürs Formular übernehmen
      this.existingRegistration = this.existingRegs[0];
      this.registrationForm.patchValue(this.existingRegistration);

      // 🔹 Registrierte Personen (werden im Formular angezeigt)
      this.addedPersons = persons.map((p) => {
        const reg = this.existingRegs.find((r) => r.person_id === p.id);
        const squadronName = reg?.squadron_id
          ? squadronMap[reg.squadron_id] || 'Unbekannte Staffel'
          : null;

        return {
          ...p,
          inSquadron: !!reg?.squadron_id,
          squadronName,
        };
      }).filter((p) =>
        this.existingRegs.some((r) => r.person_id === p.id)
      );

      // 🔹 Noch nicht registrierte Personen (zur Auswahl verfügbar)
      this.existingPersons = persons.filter(
        (p) => !this.existingRegs.some((r) => r.person_id === p.id)
      );

      console.log('✅ Personen & Registrierungen synchronisiert:');
      console.table({
        addedPersons: this.addedPersons.map((p) => ({
          id: p.id,
          squadron: p.squadronName || '-'
        })),
        existingPersons: this.existingPersons.map((p) => p.id),
      });
    } else {
      // Keine Registrierung für dieses Event
      this.isRegistered = false;
      this.addedPersons = [];
      this.existingPersons = persons;

    }
  } catch (err) {
    console.warn('❌ Fehler beim Laden bestehender Registrierungen:', err);
  }
}


toggleSelfRegistration(e: any) {
  const checked = e.target.checked;
  const userId = this.authService.getUserId();
  console.log('🔄 Toggle eigene Person:', checked, ' (user_id:', userId, ')');

  // 🔐 Benutzerinformationen robust laden
  const user =
    (this.authService as any)?.currentUserValue ||
    JSON.parse(localStorage.getItem('currentUser') || 'null');
 

  const personId = user?.person_id;

  if (!personId) {
    console.warn('⚠️ Keine Person-ID für eingeloggten Benutzer gefunden.');
    alert('❌ Dein Benutzer ist keiner Person zugeordnet.');
    return;
  }

  if (checked) {
    console.log('🧍 Versuche eigene Person hinzuzufügen:', personId);
    this.personService.getById(personId).subscribe({
      next: (p) => {
        if (!p) {
          alert('❌ Personendaten konnten nicht geladen werden.');
          return;
        }

        // ✅ Prüfen, ob schon vorhanden
        const alreadyAdded = this.addedPersons.some((ap) => ap.id === p.id);
        if (alreadyAdded) {
          alert('Du bist bereits als Teilnehmer hinzugefügt.');
          return;
        }

        this.addedPersons.push({ ...p, inSquadron: false, squadronName: null });
        console.log('🧍 Benutzer selbst als Teilnehmer hinzugefügt:', p);
      },
      error: (err) => {
        console.error('❌ Fehler beim Laden der eigenen Person:', err);
        alert('Fehler beim Hinzufügen deiner Person.');
      },
    });
  } else {
    // Entfernen
    this.addedPersons = this.addedPersons.filter((p) => p.id !== personId);
    console.log('🚫 Benutzer selbst wieder entfernt.');
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
    phone_number: [''], // ✅ neu
    start_number: [''],
    catering_type: [''],
    wishes: [''],
    gender: ['m'],
    club: [''],
    status: ['in_auswahl'],
    liability_accept: [false, Validators.requiredTrue],
  });

  // 🧍 Personenerfassungsformular – jetzt mit Adresse
  this.personForm = this.fb.group({
    person_id: [''],
    first_name: [''],
    last_name: [''],
    birth_date: [''],
    email: [''],
    phone: [''],          // ✅ neu
    street: [''],         // ✅ neu
    postal_code: [''],    // ✅ neu
    city: [''],           // ✅ neu
    country: ['Deutschland'], // ✅ Standardwert
  });

  this.squadronForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });
}

  
// ======================================================
// 🔹 Wenn eine vorhandene Person ausgewählt wird → nur lokal hinzufügen
// ======================================================
async onSelectExistingPerson(e: any): Promise<void> {
  const id = e.target.value;
  if (!id) return;

  const person = this.existingPersons.find((p) => p.id === id);
  if (!person) return;

  const participationType = this.registrationForm.value.teilnahme_art;
  const squadronId =
    participationType === 'staffel'
      ? this.registrationForm.value.squadron_id
      : null;

  if (participationType === 'staffel' && !squadronId) {
    alert('Bitte zuerst eine Staffel auswählen.');
    return;
  }

  // 🔹 Staffelname ermitteln
  const squadronName = squadronId
    ? this.squadrons.find((s) => s.id === squadronId)?.name || 'Unbekannte Staffel'
    : null;

  // 🔹 Nur lokal hinzufügen – noch keine API-Registrierung!
  this.addedPersons.push({
    ...person,
    inSquadron: !!squadronId,
    squadronName,
  });

  // 🔹 Person aus Auswahl entfernen
  this.existingPersons = this.existingPersons.filter((p) => p.id !== id);

  // 🔹 Formular zurücksetzen
  this.personForm.reset();

  console.log(`👤 ${person.first_name} wurde lokal für die Anmeldung vorgemerkt.`);
}


// ======================================================
// 🔹 Neue Person hinzufügen (nur lokal vormerken, keine Registrierung)
// ======================================================
async addPerson(): Promise<void> {
  const v = this.personForm.value;

  // 🧩 Grundvalidierung
  if (!v.first_name || !v.last_name) {
    alert('Bitte Vor- und Nachname eingeben.');
    return;
  }

  try {
    const ownerId = this.authService.getUserId();
    if (!ownerId) {
      alert('⚠️ Kein eingeloggter Benutzer gefunden.');
      return;
    }

    const first = v.first_name.trim();
    const last = v.last_name.trim();

    // 🧠 Schritt 1: Prüfen, ob Person bereits im Backend existiert
    const allPersons = await firstValueFrom(this.personService.getAll(ownerId));
    const existingPerson = allPersons.find(
      (p) =>
        p.first_name.toLowerCase() === first.toLowerCase() &&
        p.last_name.toLowerCase() === last.toLowerCase()
    );

    let person: Person;

    if (existingPerson) {
      console.log('👀 Person existiert bereits:', existingPerson);
      person = existingPerson;
    } else {
      // 👤 Neue Person anlegen (nur speichern, keine Event-Registrierung)
      const newPerson: Person = {
        first_name: first,
        last_name: last,
        birth_date: v.birth_date || undefined,
        email: v.email || undefined,
        owner_id: ownerId,
      };

      const created = await firstValueFrom(this.personService.create(newPerson));
      if (!created?.id) {
        alert('❌ Person konnte nicht korrekt angelegt werden.');
        return;
      }
      person = created;
      console.log('🆕 Neue Person angelegt:', created);
    }

    // 🧩 Staffelzuordnung
    const squadronId =
      this.registrationForm.value.teilnahme_art === 'staffel'
        ? this.registrationForm.value.squadron_id
        : null;

    const squadronName = squadronId
      ? this.squadrons.find((s) => s.id === squadronId)?.name || 'Unbekannte Staffel'
      : null;

    // 🔹 Prüfen, ob Person schon in der UI hinzugefügt ist
    const alreadyAdded = this.addedPersons.some((p) => p.id === person.id);
    if (alreadyAdded) {
      alert(`${first} ${last} wurde bereits zur Liste hinzugefügt.`);
      return;
    }

    // 🔹 Person lokal vormerken (nicht im Backend registrieren)
    this.addedPersons.push({
      ...person,
      inSquadron: !!squadronId,
      squadronName,
    });

    // 🔹 Person aus Auswahl entfernen (falls vorhanden)
    this.existingPersons = this.existingPersons.filter((p) => p.id !== person.id);

    console.log(`✅ ${first} ${last} wurde lokal zur Anmeldung hinzugefügt.`);
    this.personForm.reset();
  } catch (err) {
    console.error('❌ Fehler beim Hinzufügen der Person:', err);
    alert('Fehler beim Hinzufügen der Person.');
  }
}


  // ======================================================
  // 🔹 Person aus Event-Registrierung entfernen
  // ======================================================
  async removePerson(personId?: string) {
    if (!personId) return;

    const eventId = this.event?.id;
    if (!eventId) {
      console.warn('⚠️ Keine Event-ID vorhanden.');
      return;
    }

    // Prüfen, ob diese Person in diesem Event registriert ist
    const reg = this.existingRegs?.find(
      (r) => r.person_id === personId && r.event_id === eventId
    );

    if (!reg) {
      console.warn('⚠️ Diese Person ist laut DB nicht für dieses Event registriert.');
      alert('❌ Diese Person war für dieses Event nicht registriert oder wurde bereits gelöscht.');
      return;
    }

    if (!confirm('Willst du diese Person wirklich aus der Registrierung entfernen?')) return;

    console.log(`🧩 Lösche Registrierung: Event ${eventId} / Person ${personId}`);

    try {
      await firstValueFrom(this.registrationService.deleteByEventAndPerson(eventId, personId));

      // Lokal entfernen
      this.addedPersons = this.addedPersons.filter((p) => p.id !== personId);
      this.existingRegs = this.existingRegs.filter((r) => r.person_id !== personId);

      console.log(`✅ Person ${personId} wurde erfolgreich aus dem Event entfernt.`);
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

  // ======================================================
  // 🔹 Registrierung (neu oder update)
  // ======================================================
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
          phone_number: this.registrationForm.value.phone_number || null, // ✅ neu
          liability_accept: this.registrationForm.value.liability_accept,
          status: this.registrationForm.value.status,
          license_plate: this.registrationForm.value.license_plate,
          start_number: this.registrationForm.value.start_number,
          catering_type: this.registrationForm.value.catering_type,
          wishes: this.registrationForm.value.wishes,
          gender: this.registrationForm.value.gender,
          club: this.registrationForm.value.club,
        };

        const created = await firstValueFrom(this.registrationService.create(payload));
        if (created?.id) this.createdRegistrationIds.push(created.id);
      }

      this.isRegistered = true;
      alert('✅ Erfolgreich angemeldet!');
    } catch (err) {
      console.error(err);
      alert('❌ Fehler bei der Anmeldung.');
    }
  }

  async updateRegistration(): Promise<void> {
    if (!this.existingRegistration?.id) return alert('Keine bestehende Anmeldung gefunden.');

    try {
      const payload: Partial<EventRegistrationInterface> = {
        event_id: this.event?.id,
        person_id: this.existingRegistration.person_id,
        squadron_id:
          this.registrationForm.value.teilnahme_art === 'staffel'
            ? this.registrationForm.value.squadron_id
            : null,
        participation_type: this.registrationForm.value.teilnahme_art,
        phone_number: this.registrationForm.value.phone_number || null, // ✅ neu
        liability_accept: this.registrationForm.value.liability_accept,
        status: this.registrationForm.value.status,
        license_plate: this.registrationForm.value.license_plate || null,
        start_number: this.registrationForm.value.start_number || null,
        catering_type: this.registrationForm.value.catering_type || null,
        wishes: this.registrationForm.value.wishes || null,
        gender: this.registrationForm.value.gender || null,
        club: this.registrationForm.value.club || null,
      };

      const updated = await firstValueFrom(
        this.registrationService.update(this.existingRegistration.id!, payload)
      );

      this.existingRegistration = updated;
      alert('✅ Anmeldung erfolgreich aktualisiert!');
    } catch (err) {
      console.error(err);
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
  
    // 🔹 Navigiere zur Booking-Seite mit eventId als QueryParam
    this.router.navigate(['/booking'], { queryParams: { eventId: this.event.id } });
  }
  

  goToMyRegistrations() {
    this.router.navigate(['/my-registrations']);
  }
}
