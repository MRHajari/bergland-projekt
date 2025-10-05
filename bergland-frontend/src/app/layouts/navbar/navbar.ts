import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {
  isCollapsed = false;      // Sidebar Zustand (eingeklappt / ausgeklappt)
  isAdmin = false;          // Wird dynamisch vom Token gesetzt
  private authService = inject(AuthService); // ✅ Angular inject-Methode

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'admin';
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
      error: (err) => console.error('Logout failed', err)
    });
  }
}
