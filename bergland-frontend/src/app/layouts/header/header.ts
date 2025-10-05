import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { LucideAngularModule, User } from 'lucide-angular'; // ✅ so ist korrekt


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  icons = { User }; // 👈 hier alle gewünschten Icons eintragen
  @Input() title = '';
  @Input() subtitle = '';

  userName: string | null = null;
  userEmail: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUser();
  }

  private loadUser(): void {
    const token = this.authService.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userName = payload.first_name
          ? `${payload.first_name} ${payload.last_name || ''}`.trim()
          : payload.email || 'Benutzer';
        this.userEmail = payload.email || null;
      } catch {
        this.userName = 'Benutzer';
      }
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.router.navigate(['/login']);
      }
    });
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
