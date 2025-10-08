// frontend/src/app/features/auth/register/register.component.ts
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
  styleUrls: ['./register.css']
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birth_date: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // 🧭 Datum als ISO-String konvertieren
    const formData = { ...this.registerForm.value };
    formData.birth_date = new Date(formData.birth_date).toISOString().split('T')[0];

    this.authService.register(formData).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '✅ Registrierung erfolgreich! Bitte prüfe deine E-Mail, um dein Konto zu bestätigen.';
        this.errorMessage = '';
        this.registerForm.reset();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || '❌ Registrierung fehlgeschlagen. Bitte erneut versuchen.';
        this.successMessage = '';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
