// frontend/src/app/features/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service'; // ✅ korrigierter Pfad

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  errorMessage = '';
  loading = false;
  returnUrl = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 🔹 Optionaler Redirect-Zielpfad
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/events';

    if (this.route.snapshot.queryParams['reason'] === 'session-expired') {
      this.errorMessage = 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.';
    }

    // 🔹 Formular initialisieren
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        console.log('✅ Login erfolgreich:', res);
        this.loading = false;

        // ✅ Weiterleitung nach erfolgreichem Login
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        console.error('❌ Login fehlgeschlagen:', err);
        this.loading = false;

        if (err.status === 403) {
          this.errorMessage = 'Bitte bestätige zuerst deine E-Mail-Adresse.';
        } else if (err.status === 401) {
          this.errorMessage = 'Ungültige Zugangsdaten.';
        } else {
          this.errorMessage = err.error?.error || 'Login fehlgeschlagen. Bitte erneut versuchen.';
        }
      },
    });
  }
}
