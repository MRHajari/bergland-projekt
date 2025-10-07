import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';

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
    public router: Router // 🔹 public statt private
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.error = 'Kein Verifikationstoken angegeben.';
      this.loading = false;
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (res) => {
        this.message = res.message || 'E-Mail erfolgreich bestätigt!';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Der Bestätigungslink ist ungültig oder abgelaufen.';
        this.loading = false;
      }
    });
  }

  // 🔹 Methode für Template-Navigation
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
