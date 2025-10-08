import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], // 👈 Wichtig
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
      birth_date: ['', Validators.required] // 🆕 hinzugefügt
    });
  }
  

  // frontend/src/app/pages/auth/register/register.component.ts
onSubmit() {
  if (this.registerForm.invalid) return;

  this.loading = true;
  this.authService.register(this.registerForm.value).subscribe({
    next: () => {
      this.successMessage = 'Registrierung erfolgreich! Bitte prüfe deine E-Mail, um dein Konto zu bestätigen.';
      this.errorMessage = '';
      this.loading = false;
      // Kein automatischer Login — User muss erst bestätigen
    },
    error: (err) => {
      this.errorMessage = err.error?.error || 'Registrierung fehlgeschlagen';
      this.successMessage = '';
      this.loading = false;
    }
  });
}

goToLogin(): void {
  this.router.navigate(['/login']);
}

}
