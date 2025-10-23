import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  loggedPersonId: string | null = null;
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
    const userId = this.authService.getUserId();
    this.loggedPersonId = this.authService.getPersonId(); // 👈 direkt hier setzen
  
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
    return this.addedPersons.some(p => p.id === this.loggedPersonId);
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
// 🔹 Bestehende Gruppen-Registrierung für dieses Event laden
// ======================================================
private async loadExistingRegistration(eventId: string) {
  try {
    const userId = this.authService.getUserId();
    const myPersonId = this.authService.getPersonId();

    if (!userId || !myPersonId) {
      console.warn('⚠️ Kein eingeloggter Benutzer oder keine Person-ID gefunden.');
      return;
    }

    // 1️⃣ Lade alle Personen des eingeloggten Users (z. B. Familie)
    const persons = await firstValueFrom(this.personService.getAll(userId));
    if (!persons || persons.length === 0) {
      console.warn('⚠️ Keine Personen gefunden, die diesem Benutzer gehören.');
      return;
    }
    this.existingPersons = persons;

    // 2️⃣ Lade alle Gruppen-Registrierungen für dieses Event
    const allRegs = await firstValueFrom(
      this.registrationService.getGroupByEvent(eventId)
    );

    // 3️⃣ Finde die Registrierung, die vom eingeloggten User erstellt wurde
    this.existingRegistration =
      (allRegs || []).find(
        (r: any) =>
          r.registered_by_person?.id === myPersonId ||
          r.registered_by_person_id === myPersonId
      ) || null;

    // 4️⃣ Wenn keine Registrierung vorhanden → Abbrechen
    if (!this.existingRegistration) {
      console.log('ℹ️ Keine bestehende Registrierung für diesen Benutzer gefunden.');
      this.isRegistered = false;
      this.loading = false;
      return;
    }

  // 5️⃣ Teilnehmer-Daten aus Registrierung laden
if (this.existingRegistration?.participants?.length) {
  const squadronMap: Record<string, string> = {};
  for (const s of this.squadrons) squadronMap[s.id] = s.name;

  this.addedPersons = this.existingRegistration.participants.map((p: any) => ({
    ...(p.person || {}),
    inSquadron: !!p.squadron_id,
    squadronName: p.squadron_id
      ? squadronMap[p.squadron_id] || 'Unbekannte Staffel'
      : null,
  }));

  const addedIds = new Set(this.addedPersons.map((p) => p.id));
  this.existingPersons = this.existingPersons.filter(
    (p) => !addedIds.has(p.id!)
  );
}


    // 6️⃣ Formular mit Registrierungsdaten füllen
    const r = this.existingRegistration;
    this.registrationForm.patchValue({
      phone_number: r.phone_number || '',
      license_plate: r.license_plate || '',
      start_number: r.start_number || '',
      catering_type: r.catering_type || '',
      wishes: r.wishes || '',
      gender: r.gender || 'm',
      club: r.club || '',
      status: r.status || 'in_auswahl',
      liability_accept: true,
    });

    // 7️⃣ Status setzen
    this.isRegistered = true;
    this.loading = false;

    console.log('✅ Bestehende Registrierung erfolgreich geladen:', this.existingRegistration);
  } catch (err) {
    console.error('❌ Fehler beim Laden bestehender Registrierung:', err);
    this.loading = false;
  }
}



toggleSelfRegistration(e: any) {
  const checked = e.target.checked;
  const userId = this.authService.getUserId();
  console.log('🔄 Toggle eigene Person:', checked, ' (user_id:', userId, ')');

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

        const alreadyAdded = this.addedPersons.some((ap) => ap.id === p.id);
        if (alreadyAdded) {
          alert('Du bist bereits als Teilnehmer hinzugefügt.');
          return;
        }

        // ✅ Person hinzufügen
        this.addedPersons.push({ ...p, inSquadron: false, squadronName: null });

        // ✅ Entferne eigene Person aus Dropdown, damit sie nicht doppelt auswählbar ist
        this.existingPersons = this.existingPersons.filter((ep) => ep.id !== p.id);

        console.log('🧍 Benutzer selbst als Teilnehmer hinzugefügt:', p);
      },
      error: (err) => {
        console.error('❌ Fehler beim Laden der eigenen Person:', err);
        alert('Fehler beim Hinzufügen deiner Person.');
      },
    });
  } else {
    // ❌ Entferne Person aus lokaler Liste
    this.addedPersons = this.addedPersons.filter((p) => p.id !== personId);

    // ✅ Füge eigene Person wieder zurück in Dropdown (erneute Auswahl möglich)
    this.personService.getById(personId).subscribe({
      next: (p) => {
        if (p && !this.existingPersons.some((ep) => ep.id === p.id)) {
          this.existingPersons.push(p);
        }
      },
    });

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
// 🔹 Neue Person hinzufügen (nur lokal vormerken, noch kein Backend-Aufruf)
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

    // 🧠 Schritt 1: Prüfen, ob Person bereits existiert (im Backend)
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
      // 👤 Neue Person im Backend anlegen
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
      console.log('🆕 Neue Person in DB angelegt:', created);
    }

    // 🧩 Staffelzuordnung
    const squadronId =
      this.registrationForm.value.teilnahme_art === 'staffel'
        ? this.registrationForm.value.squadron_id
        : null;

    const squadronName = squadronId
      ? this.squadrons.find((s) => s.id === squadronId)?.name || 'Unbekannte Staffel'
      : null;

    // 🧩 Prüfen, ob Person schon lokal hinzugefügt ist
    const alreadyAdded = this.addedPersons.some((p) => p.id === person.id);
    if (alreadyAdded) {
      alert(`${first} ${last} wurde bereits hinzugefügt.`);
      return;
    }

    // ✅ Person nur lokal vormerken (noch keine Registrierung!)
    this.addedPersons.push({
      ...person,
      inSquadron: !!squadronId,
      squadronName,
    });

    // ✅ Aus Dropdown entfernen
    this.existingPersons = this.existingPersons.filter((p) => p.id !== person.id);

    // ✅ Formular zurücksetzen
    this.personForm.reset();

    console.log(`✅ ${first} ${last} wurde lokal zur Teilnehmerliste hinzugefügt.`);

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

  // Prüfen, ob die Person über eine Registrierung mit Teilnehmern im Backend existiert
  const reg = this.existingRegs?.find(
    (r) =>
      r.event_id === eventId &&
      r.participants?.some((p) => p.person_id === personId)
  );

  if (!reg) {
    console.log('ℹ️ Person ist nur lokal hinzugefügt – wird lokal entfernt.');
    this.addedPersons = this.addedPersons.filter((p) => p.id !== personId);
    return;
  }

  if (!confirm('Willst du diese Person wirklich aus der Registrierung entfernen?')) return;

  console.log(`🧩 Entferne Teilnehmer: Event ${eventId} / Person ${personId}`);

  try {
    // 🔍 Passenden Teilnehmer aus Registrierung finden
    const participant = reg.participants?.find((p) => p.person_id === personId);
    if (!participant?.id) {
      console.warn('⚠️ Kein Teilnehmer-Datensatz für diese Person gefunden.');
      return;
    }

    // 🗑️ Teilnehmer im Backend löschen
    await firstValueFrom(this.registrationService.deleteParticipant(participant.id));

    // 🧩 Lokal entfernen – sowohl aus UI als auch aus Registrierungsliste
    this.addedPersons = this.addedPersons.filter((p) => p.id !== personId);

    this.existingRegs = this.existingRegs.map((r) => ({
      ...r,
      participants: r.participants?.filter((p) => p.person_id !== personId),
    }));

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
  
      if (created) {
        // 👉 Staffel in Liste aufnehmen
        this.squadrons.push(created);
  
        // 👉 automatisch als ausgewählt setzen
        this.registrationForm.patchValue({
          squadron_id: created.id,
        });
  
        // 👉 Optional: sofort die neue Staffel als "teilnahme_art" aktivieren
        this.registrationForm.patchValue({
          teilnahme_art: 'staffel',
        });
  
        console.log('🆕 Staffel erstellt und ausgewählt:', created.name);
      }
  
      this.squadronForm.reset();
      this.showNewSquadronForm = false;
    } catch (err) {
      console.error(err);
      alert('❌ Fehler beim Erstellen der Staffel.');
    }
  }
  

// ======================================================
// 🔹 Registrierung (nur 1x pro User + Event, mit allen Teilnehmern)
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

    // 🧩 Prüfen, ob bereits eine Registrierung existiert
    if (this.existingRegistration) {
      alert('⚠️ Du bist bereits für dieses Event angemeldet.');
      return;
    }

    // 🧠 Registrierungspayload zusammenbauen
    const payload: EventRegistrationGroupPayload = {
      event_id: this.event.id,
      registered_by_person_id: personId,
      phone_number: this.registrationForm.value.phone_number || null,
      license_plate: this.registrationForm.value.license_plate || null,
      start_number: this.registrationForm.value.start_number || null,
      catering_type: this.registrationForm.value.catering_type || null,
      wishes: this.registrationForm.value.wishes || null,
      gender: this.registrationForm.value.gender || null,
      club: this.registrationForm.value.club || null,
      status: this.registrationForm.value.status || 'in_auswahl',

      // 👇 Alle hinzugefügten Personen als Teilnehmer
      participants: this.addedPersons.map((p) => ({
        person_id: p.id!,
        squadron_id:
          this.registrationForm.value.teilnahme_art === 'staffel'
            ? this.registrationForm.value.squadron_id
            : null,
        participation_type: this.registrationForm.value.teilnahme_art,
        liability_accept: this.registrationForm.value.liability_accept,
      })),
    };

    console.log('📦 Registrierungspayload:', payload);

    // 💾 API-Aufruf: Gruppenregistrierung anlegen
    const created = await firstValueFrom(
      this.registrationService.createGroupRegistration(payload)
    );

    // 🔹 Erfolgreich angelegt?
    const newReg = created?.registration || created; // je nach Backend-Rückgabe
    if (newReg?.id) {
      this.existingRegistration = newReg;
      this.isRegistered = true;
      console.log('✅ Registrierung erfolgreich erstellt:', newReg.id);
      alert('✅ Anmeldung erfolgreich erstellt!');
    } else {
      alert('❌ Unerwartete Antwort vom Server – keine Registrierung-ID.');
    }

  } catch (err) {
    console.error('❌ Fehler bei der Gruppenregistrierung:', err);
    alert('❌ Fehler bei der Anmeldung.');
  }
}

  

  // ======================================================
// 🔹 Registrierung updaten ODER fehlende Personen anlegen
// ======================================================
async updateRegistration(): Promise<void> {
  if (!this.event?.id) return alert('❌ Event-ID fehlt.');

  try {
    const personId = this.authService.getPersonId();
    if (!personId) {
      alert('❌ Kein eingeloggter Benutzer gefunden.');
      return;
    }

    // 1️⃣ Falls keine bestehende Registrierung → neue anlegen
    if (!this.existingRegistration) {
      const payload: EventRegistrationGroupPayload = {
        event_id: this.event.id,
        registered_by_person_id: personId,
        phone_number: this.registrationForm.value.phone_number || null,
        license_plate: this.registrationForm.value.license_plate || null,
        start_number: this.registrationForm.value.start_number || null,
        catering_type: this.registrationForm.value.catering_type || null,
        wishes: this.registrationForm.value.wishes || null,
        gender: this.registrationForm.value.gender || null,
        club: this.registrationForm.value.club || null,
        status: this.registrationForm.value.status || 'in_auswahl',

        participants: this.addedPersons.map((p) => ({
          person_id: p.id!,
          squadron_id:
            this.registrationForm.value.teilnahme_art === 'staffel'
              ? this.registrationForm.value.squadron_id
              : null,
          participation_type: this.registrationForm.value.teilnahme_art,
          liability_accept: this.registrationForm.value.liability_accept,
        })),
      };

      const created = await firstValueFrom(
        this.registrationService.createGroupRegistration(payload)
      );
      if (created?.id) {
        this.existingRegistration = created;
        console.log('✅ Neue Registrierung mit Teilnehmern erstellt:', created.id);
      }
      this.isRegistered = true;
      alert('✅ Registrierung erfolgreich angelegt!');
      return;
    }

    // 2️⃣ Falls Registrierung existiert → Teilnehmer hinzufügen oder Headerdaten updaten
    const regId = this.existingRegistration.id!;
    const existingParticipantIds =
      this.existingRegistration.participants?.map((p) => p.person_id) || [];

    // Fehlende Personen hinzufügen
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
      };

      const createdPart = await firstValueFrom(
        this.registrationService.addParticipant(participantPayload)
      );
      console.log('➕ Neuer Teilnehmer hinzugefügt:', createdPart);
    }

    // 3️⃣ Header-Daten (z. B. Wünsche, Verpflegung etc.) aktualisieren
    const headerUpdate: Partial<EventRegistrationInterface> = {
      phone_number: this.registrationForm.value.phone_number || null,
      license_plate: this.registrationForm.value.license_plate || null,
      start_number: this.registrationForm.value.start_number || null,
      catering_type: this.registrationForm.value.catering_type || null,
      wishes: this.registrationForm.value.wishes || null,
      gender: this.registrationForm.value.gender || null,
      club: this.registrationForm.value.club || null,
      status: this.registrationForm.value.status || 'in_auswahl',
    };

    const updated = await firstValueFrom(
      this.registrationService.update(regId, headerUpdate)
    );
    this.existingRegistration = updated;
    console.log('🔄 Registrierung aktualisiert:', updated.id);

    this.isRegistered = true;
    alert('✅ Registrierung erfolgreich aktualisiert!');
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
  
    // 🔹 Navigiere zur Booking-Seite mit eventId als QueryParam
    this.router.navigate(['/booking'], { queryParams: { eventId: this.event.id } });
  }
  

  goToMyRegistrations() {
    this.router.navigate(['/my-registrations']);
  }

  // ======================================================
// 🔹 Anmeldung stornieren
// ======================================================
async cancelRegistration(): Promise<void> {
  if (!this.existingRegs || this.existingRegs.length === 0) {
    alert('❌ Es wurde keine bestehende Anmeldung gefunden.');
    return;
  }

  if (!confirm('⚠️ Willst du deine Anmeldung wirklich stornieren?')) return;

  try {
    for (const reg of this.existingRegs) {
      await firstValueFrom(this.registrationService.delete(reg.id!));
      console.log(`🗑️ Registrierung gelöscht: ${reg.id}`);
    }

    // UI zurücksetzen
    this.isRegistered = false;
    this.existingRegs = [];
    this.existingRegistration = null;
    this.addedPersons = [];
    this.createdRegistrationIds = [];

    alert('✅ Deine Anmeldung wurde erfolgreich storniert.');
  } catch (err) {
    console.error('❌ Fehler beim Stornieren:', err);
    alert('Fehler beim Stornieren der Anmeldung.');
  }
}

}
