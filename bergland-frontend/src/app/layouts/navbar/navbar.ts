import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {
  isCollapsed = false;
  isAdmin = false;
  isLoggedIn = false;  
  isTimekeeper = false;
  canAccessTime = false;

  private authService = inject(AuthService);

  ngOnInit(): void {
    const role = this.authService.getUserRole();
  
    this.isAdmin = role === 'admin';
    this.isTimekeeper = role === 'timekeeper';
    this.canAccessTime = this.isAdmin || this.isTimekeeper;
  
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.clear();
        window.location.href = '/login';
      },
      error: (err) => console.error('Logout fehlgeschlagen:', err)
    });
  }
}
