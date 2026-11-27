import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../auth/auth.service';
import { SymbolIcon } from '../../shared/ui/symbol/symbol';

interface Goal {
  number: string;
  icon: string;
  key: 'shops' | 'roasters' | 'gear';
  link: string;
}

const GOALS: Goal[] = [
  { number: '01', icon: 'storefront', key: 'shops', link: '/coffee-shops' },
  { number: '02', icon: 'local_cafe', key: 'roasters', link: '/roasters' },
  { number: '03', icon: 'coffee_maker', key: 'gear', link: '/equipment' },
];

/** Home page: why the app exists, what it offers and where to start (Stitch "Purpose & Home"). */
@Component({
  selector: 'app-home-page',
  imports: [TranslocoPipe, RouterLink, SymbolIcon, NgOptimizedImage],
  template: `
    <div class="flex flex-col gap-20">
      <section class="mx-auto flex max-w-4xl flex-col items-center gap-6 pt-6 text-center md:pt-12">
        <p
          class="inline-flex items-center gap-2 rounded-full border border-hairline bg-container px-4 py-1 text-[0.6875rem] font-semibold tracking-widest text-on-surface-variant uppercase"
        >
          <span class="size-2 rounded-full bg-terracotta" aria-hidden="true"></span>
          {{ 'home.hero.badge' | transloco }}
        </p>
        <h1 class="text-4xl leading-tight tracking-tight md:text-5xl lg:text-6xl">
          <em class="font-normal text-terracotta">{{
            'home.hero.titleHighlight' | transloco
          }}</em>{{ 'home.hero.titleRest' | transloco }}
          <br class="hidden sm:inline" />
          {{ 'home.hero.titleLine2' | transloco }}
        </h1>
        <p class="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          {{ 'home.hero.intro' | transloco }}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <a class="btn btn-primary gap-2" routerLink="/coffee-shops">
            {{ 'home.hero.ctaShops' | transloco }}
            <app-symbol name="arrow_forward" [size]="18" />
          </a>
          <button type="button" class="btn btn-ghost" (click)="scrollTo('community')">
            {{ 'home.hero.ctaStory' | transloco }}
          </button>
        </div>
      </section>

      <section
        class="flex flex-col gap-10 rounded-2xl border border-hairline bg-container-low p-6 md:p-12"
        aria-labelledby="goals-title"
      >
        <header class="flex max-w-2xl flex-col gap-1">
          <p class="text-[0.6875rem] font-semibold tracking-widest text-terracotta uppercase">
            {{ 'home.goals.eyebrow' | transloco }}
          </p>
          <h2 id="goals-title" class="text-3xl tracking-tight">
            {{ 'home.goals.title' | transloco }}
          </h2>
        </header>

        <ul class="grid gap-6 md:grid-cols-3">
          @for (goal of goals; track goal.key) {
            <li class="card flex flex-col justify-between gap-6">
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <span class="font-display text-2xl text-terracotta italic" aria-hidden="true">{{
                    goal.number
                  }}</span>
                  <span
                    class="flex size-10 items-center justify-center rounded-full bg-container text-espresso"
                  >
                    <app-symbol [name]="goal.icon" [size]="20" />
                  </span>
                </div>
                <h3 class="text-xl">{{ 'home.goals.' + goal.key + '.title' | transloco }}</h3>
                <p class="leading-relaxed text-on-surface-variant">
                  {{ 'home.goals.' + goal.key + '.text' | transloco }}
                </p>
              </div>
              <a
                class="link inline-flex items-center gap-1.5 no-underline border-t border-hairline pt-4 text-xs font-semibold tracking-wider uppercase"
                [routerLink]="goal.link"
              >
                <span class="underline underline-offset-4">{{
                  'home.goals.' + goal.key + '.link' | transloco
                }}</span>
                <app-symbol name="arrow_forward" [size]="16" />
              </a>
            </li>
          }
        </ul>
      </section>

      <section
        id="community"
        class="mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-2"
        aria-labelledby="community-title"
      >
        <div
          class="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-hairline shadow-sm"
        >
          <img
            class="object-cover object-center"
            ngSrc="images/pour-over.jpg"
            fill
            [alt]="'home.community.imageAlt' | transloco"
          />
        </div>
        <div class="flex flex-col gap-4">
          <h2 id="community-title" class="text-3xl tracking-tight">
            {{ 'home.community.title' | transloco }}
          </h2>
          <p class="text-lg leading-relaxed text-on-surface-variant">
            {{ 'home.community.intro' | transloco }}
          </p>
          <p class="text-lg leading-relaxed text-on-surface-variant">
            {{ 'home.community.share' | transloco }}
          </p>
        </div>
      </section>

      <section
        class="mx-auto flex max-w-3xl flex-col items-center gap-6 border-t border-hairline pt-16 pb-8 text-center"
      >
        <h2 class="text-3xl tracking-tight">{{ 'home.closing.title' | transloco }}</h2>
        <div
          class="flex flex-col gap-4 text-justify text-lg leading-relaxed text-on-surface-variant"
        >
          <p class="font-semibold text-espresso">{{ 'home.closing.start' | transloco }}</p>
          <p>{{ 'home.closing.discovery' | transloco }}</p>
          <p>{{ 'home.closing.wish' | transloco }}</p>
          <p>{{ 'home.closing.purpose' | transloco }}</p>
        </div>
        <div
          class="flex w-full flex-col items-center gap-4 rounded-2xl border border-hairline bg-container-low px-6 py-10 sm:px-10"
        >
          <app-symbol class="text-espresso" name="coffee" [size]="40" />
          <h3 class="text-2xl">{{ 'home.closing.ctaTitle' | transloco }}</h3>
          <p class="max-w-xl text-on-surface-variant">{{ 'home.closing.ctaText' | transloco }}</p>
          @if (auth.isSignedIn()) {
            <a class="btn btn-primary" routerLink="/coffee-shops">
              {{ 'home.closing.ctaBrowse' | transloco }}
            </a>
          } @else {
            <button type="button" class="btn btn-primary" (click)="auth.signIn()">
              {{ 'home.closing.ctaSignIn' | transloco }}
            </button>
            <p class="text-sm text-husk">
              {{ 'home.closing.ctaCurious' | transloco }}
              <a class="link" routerLink="/coffee-shops">{{
                'home.closing.ctaExplore' | transloco
              }}</a>
            </p>
          }
        </div>
      </section>
    </div>
  `,
})
export class HomePage {
  protected readonly auth = inject(AuthService);
  private readonly document = inject(DOCUMENT);

  protected readonly goals = GOALS;

  protected scrollTo(id: string): void {
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
