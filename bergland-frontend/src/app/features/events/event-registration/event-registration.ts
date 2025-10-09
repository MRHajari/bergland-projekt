import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EventService } from '../../../core/services/event.service';
import { EventRegistrationService } from '../../../core/services/event-registration.service';
import { RelayTeamService } from '../../../core/services/relay-team.service';
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
  event: any = null;
  relayTeams: any[] = [];
  squadrons: any[] = [];

  loading = true;
  errorMessage = '';
  isRegistered = false;

  registrationForm!: FormGroup;

  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private relayTeamService = inject(RelayTeamService);
  private squadronService = inject(SquadronService);
  private registrationService = inject(EventRegistrationService);
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

    this.initForm();

    // Event laden (liefert KEINE relayTeams)
    this.eventService.getById(eventId).subscribe({
      next: (evt) => { this.event = evt; this.loading = false; },
      error: () => { this.errorMessage = '❌ Event konnte nicht geladen werden.'; this.loading = false; }
    });

    // Lauftage separat laden und ggf. automatisch vorbelegen
    this.relayTeamService.getByEvent(eventId).subscribe({
      next: (teams) => {
        this.relayTeams = teams || [];
        if (this.relayTeams.length === 1) {
          this.registrationForm.patchValue({ relay_team_id: this.relayTeams[0].id });
        }
      },
      error: (err) => console.error('Fehler beim Laden der Lauftage:', err),
    });

    // Staffeln separat laden
    this.squadronService.getByEvent(eventId).subscribe({
      next: (sq) => { this.squadrons = sq || []; },
      error: (err) => console.error('Fehler beim Laden der Staffeln:', err),
    });
  }

  private initForm(): void {
    this.registrationForm = this.fb.group({
      participation_type: ['einzeln', Validators.required], // 'einzeln' | 'staffel'
      relay_team_id: [null],                                 // Lauftag
      squadron_id: [null],                                   // Staffel
      phone_number: [''],
      license_plate: [''],
      catering_type: [''],
      wishes: [''],
      gender: ['m'],
      club: [''],
      liability_accept: [false, Validators.requiredTrue],
    });
  }

  registerForEvent(): void {
    if (!this.authService.isLoggedIn()) {
      alert('Bitte logge dich zuerst ein.');
      this.router.navigate(['/login']);
      return;
    }
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      alert('Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    const payload = {
      ...this.registrationForm.value,
      event_id: this.event.id,
      person_id: this.authService.getUserId(),
      status: 'in_auswahl'
    };

    this.registrationService.createEventRegistration(payload).subscribe({
      next: () => { this.isRegistered = true; alert('✅ Erfolgreich angemeldet!'); },
      error: (err) => {
        console.error('❌ Fehler bei Anmeldung:', err);
        alert(err?.error?.message || 'Fehler bei der Anmeldung.');
      }
    });
  }

  goBack(): void { this.router.navigate(['/events']); }
}
