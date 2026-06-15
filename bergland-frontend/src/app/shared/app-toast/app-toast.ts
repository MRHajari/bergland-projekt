import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-toast.html',
  styleUrls: ['./app-toast.css']
})
export class AppToast {
  readonly toastService = inject(ToastService);

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }
}

