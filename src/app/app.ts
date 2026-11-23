import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgOptimizedImage],
  selector: 'app-root',
  templateUrl: './app.html',
  host: { class: 'flex min-h-screen flex-col' },
})
export class App {}
