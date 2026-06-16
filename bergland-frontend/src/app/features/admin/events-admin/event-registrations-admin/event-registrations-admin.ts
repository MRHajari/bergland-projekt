import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EventService } from '../../../../core/services/event.service';
import { EventRegistrationService } from '../../../../core/services/event-registration.service';

@Component({
  selector: 'app-event-registrations-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-registrations-admin.html',
  styleUrls: ['./event-registrations-admin.css'],
})
export class EventRegistrationsAdmin implements OnInit {
  // ======================================================
  // 🔧 Dependencies
  // ======================================================
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private registrationService = inject(EventRegistrationService);

  // ======================================================
  // 🧩 Component state
  // ======================================================
  eventId!: string;
  event: any = null;
  registrations: any[] = [];
  searchTerm: string = '';
  loading = true;
  editingStartNumber: string | null = null;
  editingParticipantId: string | null = null;


  // ======================================================
  // 🚀 Init
  // ======================================================
  async ngOnInit(): Promise<void> {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    await this.loadData();
  }

  // ======================================================
  // 📦 Daten laden (Event + Registrierungen)
  // ======================================================
  private async loadData(): Promise<void> {
    this.loading = true;
    try {
      const event = await firstValueFrom(this.eventService.getById(this.eventId));
      const registrations = (await firstValueFrom(
        this.registrationService.getGroupByEvent(this.eventId)
      )) as any[];

      this.event = event;
      this.registrations = registrations;
      console.log('📦 Registrierungen geladen:', this.registrations);
    } catch (err) {
      console.error('❌ Fehler beim Laden der Daten:', err);
    } finally {
      this.loading = false;
    }
  }

  // ======================================================
  // 🔄 Status ändern (Admin)
  // ======================================================
  async updateStatus(reg: any, newStatus: string): Promise<void> {
    if (reg.status === newStatus) return;
    try {
      await firstValueFrom(this.registrationService.updateStatus(reg.id, newStatus));
      this.registrations = this.registrations.map((r) =>
        r.id === reg.id ? { ...r, status: newStatus } : r
      );
      console.log(`✅ Status für ${reg.id} geändert auf ${newStatus}`);
    } catch (err) {
      console.error('❌ Fehler beim Ändern des Status:', err);
      alert('Fehler beim Ändern des Status.');
    }
  }

  // ======================================================
  // 🔍 Filter für Suchfeld (Anmelder + Teilnehmer)
  // ======================================================
  get filteredRegistrations() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.registrations;


    return this.registrations.filter((reg) => {
      // 1️⃣ Namen + E-Mail des Anmelders
      const registeredBy =
        `${reg.registered_by_person?.first_name || ''} ${reg.registered_by_person?.last_name || ''} ${reg.registered_by_person?.email || ''}`
          .toLowerCase();

      // 2️⃣ Namen + E-Mails aller Teilnehmer
      const participantsText = (reg.participants || [])
        .map((p: any) => {
          const first = (p.person?.first_name || '').toLowerCase();
          const last = (p.person?.last_name || '').toLowerCase();
          const email = (p.person?.email || '').toLowerCase();
          return `${first} ${last} ${email}`;
        })
        .join(' ');

      // 3️⃣ Gesamter Suchtext (Anmelder + Teilnehmer)
      const combinedText = `${registeredBy} ${participantsText}`;

      return combinedText.includes(term);
    });
  }

  startEditStartNumber(p: any) {
    this.editingParticipantId = p.id;
    this.editingStartNumber = String(p.start_number ?? '');
  }
  
  cancelEditStartNumber() {
    this.editingParticipantId = null;
    this.editingStartNumber = null;
  }
  
  async saveStartNumber(p: any) {
    try {
      const nextValue = this.editingStartNumber?.trim() || '';

      await firstValueFrom(
        this.registrationService.updateParticipantStartNumber(
          p.id,
          nextValue
        )
      );

      const updatedStartNumber = Number(nextValue);

      this.registrations = this.registrations.map((reg) => ({
        ...reg,
        participants: (reg.participants || []).map((participant: any) => {
          if (participant.id === p.id) {
            return { ...participant, start_number: updatedStartNumber };
          }

          if (
            participant.participation_type === 'staffel' &&
            participant.squadron_id &&
            participant.squadron_id === p.squadron_id
          ) {
            return { ...participant, start_number: updatedStartNumber };
          }

          return participant;
        }),
      }));
  
      this.cancelEditStartNumber();
      console.log('✅ Startnummer aktualisiert');
    } catch (err) {
      console.error('❌ Fehler beim Speichern der Startnummer:', err);
      alert('Fehler beim Speichern der Startnummer');
    }
  }
  
}