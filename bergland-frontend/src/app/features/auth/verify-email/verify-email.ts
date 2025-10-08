// frontend/src/app/features/auth/verify-email/verify-email.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service'; // ✅ korrigierter Pfad

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.html',
  styleUrls: ['./verify-email.css']
})
export class VerifyEmail implements OnInit {
  message = '';
  error = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.error = '❌ Kein Verifikationstoken angegeben.';
      this.loading = false;
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = res.message || '✅ E-Mail erfolgreich bestätigt!';
        // ⏳ 3 Sekunden warten, dann Redirect
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err.error?.error ||
          '⚠️ Der Bestätigungslink ist ungültig oder abgelaufen.';
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
