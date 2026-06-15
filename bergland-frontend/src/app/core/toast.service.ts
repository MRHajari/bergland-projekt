import { Injectable, signal } from '@angular/core';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 1;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(message: string, type: ToastType = 'info', durationMs = 5000) {
    const id = this.nextId++;
    const toast: ToastMessage = { id, message, type };

    this.messages.update((items) => [...items, toast]);

    const timer = setTimeout(() => {
      this.dismiss(id);
    }, durationMs);

    this.timers.set(id, timer);
    return id;
  }

  dismiss(id: number) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.messages.update((items) => items.filter((item) => item.id !== id));
  }

  clear() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    this.timers.clear();
    this.messages.set([]);
  }
}

