import { Component, OnInit, inject, signal } from '@angular/core';
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
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private registrationService = inject(EventRegistrationService);

  eventId!: string;
  event: any = null;
  registrations = signal<any[]>([]);
  searchTerm = signal<string>('');
  loading = signal<boolean>(true);

  async ngOnInit(): Promise<void> {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const [event, registrations] = await Promise.all([
        firstValueFrom(this.eventService.getById(this.eventId)),
        firstValueFrom(this.registrationService.getGroupByEvent(this.eventId)),
      ]);
      this.event = event;
      this.registrations.set(registrations);
    } catch (err) {
      console.error('❌ Fehler beim Laden der Daten:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async updateStatus(reg: any, newStatus: string): Promise<void> {
    if (reg.status === newStatus) return;
    try {
      await firstValueFrom(this.registrationService.updateStatus(reg.id, newStatus));
      this.registrations.set(
        this.registrations().map((r) =>
          r.id === reg.id ? { ...r, status: newStatus } : r
        )
      );
    } catch (err) {
      console.error('❌ Fehler beim Ändern des Status:', err);
      alert('Fehler beim Ändern des Status.');
    }
  }

  get filteredRegistrations() {
    const term = this.searchTerm().toLowerCase();
    return this.registrations().filter((r) => {
      const userName =
        (r.user?.email || '').toLowerCase() +
        ' ' +
        (r.user?.person?.first_name || '') +
        ' ' +
        (r.user?.person?.last_name || '');
      return !term || userName.includes(term);
    });
  }
}
