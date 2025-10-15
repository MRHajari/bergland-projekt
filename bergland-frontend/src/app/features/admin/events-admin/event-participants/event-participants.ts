import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  EventRegistrationService,
  EventRegistrationInterface,
} from '../../../../core/services/event-registration.service';

// 🔧 Lokale, erweiterte Typen für die Admin-Ansicht
type PersonLite = {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  birth_date?: string; // ✅ hinzugefügt für Anzeige
};
type SquadLite = { id?: string; name?: string; start_number?: string };
type EventLite = { id?: string; name?: string };

interface EventRegistrationWithRelations extends EventRegistrationInterface {
  person?: PersonLite;
  squadron?: SquadLite;
  event?: EventLite;
}

@Component({
  selector: 'app-event-participants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-participants.html',
  styleUrls: ['./event-participants.css'],
})
export class EventParticipants implements OnInit {
  private route = inject(ActivatedRoute);
  private registrationService = inject(EventRegistrationService);

  eventId!: string;
  registrations = signal<EventRegistrationWithRelations[]>([]);
  searchTerm = signal<string>('');
  objectKeys = Object.keys; // ✅ damit du im Template Object.keys() verwenden kannst

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    this.loadRegistrations();
  }

  async loadRegistrations(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.registrationService.getByEventId(this.eventId)
      );
      this.registrations.set((data || []) as EventRegistrationWithRelations[]);
      console.log('📦 Registrierungen geladen:', data);
    } catch (err) {
      console.error('❌ Fehler beim Laden der Event-Registrierungen:', err);
    }
  }

  // 🔍 Gruppieren nach phone_number (wer gemeldet hat) + globaler Name-Filter
  groupedRegistrations = computed(() => {
    const regs = this.registrations() || [];
    const term = (this.searchTerm() || '').toLowerCase();
    const groups: Record<string, EventRegistrationWithRelations[]> = {};

    for (const reg of regs) {
      const key = reg.phone_number || 'Unbekannt';
      if (!groups[key]) groups[key] = [];

      const fullName = `${reg.person?.first_name || ''} ${reg.person?.last_name || ''}`.toLowerCase();
      if (!term || fullName.includes(term)) {
        groups[key].push(reg);
      }
    }

    // 🔢 Sortierte Gruppen (optional: „Unbekannt“ ans Ende)
    const sortedKeys = Object.keys(groups).sort((a, b) =>
      a === 'Unbekannt' ? 1 : b === 'Unbekannt' ? -1 : a.localeCompare(b)
    );

    return Object.fromEntries(sortedKeys.map((k) => [k, groups[k]]));
  });
}
