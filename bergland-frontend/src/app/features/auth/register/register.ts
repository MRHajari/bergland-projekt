import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      birth_date: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      street: [''],
      postal_code: [''],
      city: [''],
      country: ['Deutschland'],
    });
  }


  onSubmit(): void {
    console.log("🟢 Submit ausgelöst!");
    console.log("📋 Aktuelle Formulardaten:", this.registerForm.value);
    console.log("✅ Form valid?", this.registerForm.valid);
  
    // 🕵️ Prüfe, ob etwas ungültig ist
    if (this.registerForm.invalid) {
      const invalidControls = Object.keys(this.registerForm.controls).filter(
        key => this.registerForm.get(key)?.invalid
      );
      console.warn("⚠️ Ungültige Felder:", invalidControls);
  
      // alle Felder als 'touched' markieren, um Fehlermeldungen sichtbar zu machen
      this.registerForm.markAllAsTouched();
      return;
    }
  
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
  
    const formValue = this.registerForm.value;
  
    // 🧭 Datum konvertieren, falls gesetzt
    let formattedBirthDate = null;
    if (formValue.birth_date) {
      try {
        formattedBirthDate = new Date(formValue.birth_date)
          .toISOString()
          .split('T')[0];
      } catch (e) {
        console.error("❌ Fehler beim Konvertieren des Datums:", e);
      }
    }
  
    // ✳️ Nur Felder, die im Backend erlaubt sind
    const formData = {
      first_name: formValue.first_name,
      last_name: formValue.last_name,
      birth_date: formattedBirthDate ?? '',
      email: formValue.email,
      password: formValue.password,
      phone: formValue.phone,
      street: formValue.street,
      postal_code: formValue.postal_code,
      city: formValue.city,
      country: formValue.country,
    };
    
  
    console.log("📦 Daten werden an Backend gesendet:", formData);
  
    // 🔥 Anfrage senden
    this.authService.register(formData).subscribe({
      next: (res) => {
        console.log("✅ Backend-Antwort:", res);
        this.loading = false;
        this.successMessage =
          '✅ Registrierung erfolgreich! Bitte prüfe deine E-Mail, um dein Konto zu bestätigen.';
        this.errorMessage = '';
        this.registerForm.reset();
      },
      error: (err) => {
        console.error("❌ Fehler bei Registrierung:", err);
        this.loading = false;
        this.errorMessage =
          err.error?.error ||
          '❌ Registrierung fehlgeschlagen. Bitte erneut versuchen.';
        this.successMessage = '';
      },
      complete: () => {
        console.log("🏁 Registrierung abgeschlossen (complete).");
      },
    });
  }
  
  

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
