import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule], // 👈 RouterModule hinzufügen
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
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/events';

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
  
    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        console.log('Login erfolgreich');
        this.router.navigateByUrl(this.returnUrl || '/events');
      },
      error: (err) => {
        console.error('Login fehlgeschlagen', err);
        this.errorMessage = err.error?.message || 'Login fehlgeschlagen';
        this.loading = false;
      }
    });
  }
  
  
}
