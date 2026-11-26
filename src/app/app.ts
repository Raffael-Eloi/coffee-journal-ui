import { NgOptimizedImage } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from './auth/auth.service';
import { CurrentUserService } from './features/profile/current-user.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgOptimizedImage, TranslocoPipe],
  selector: 'app-root',
  templateUrl: './app.html',
  host: { class: 'flex min-h-screen flex-col' },
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly currentUser = inject(CurrentUserService);
  private readonly router = inject(Router);

  constructor() {
    // A signed-in user without a profile has to create one first.
    effect(() => {
      if (this.currentUser.status() === 'needs-profile') {
        void this.router.navigateByUrl('/profile/setup');
      }
    });
  }
}
