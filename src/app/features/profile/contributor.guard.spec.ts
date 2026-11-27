import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, isObservable, Observable } from 'rxjs';
import { contributorGuard } from './contributor.guard';
import { CurrentUserService } from './current-user.service';

describe('contributorGuard', () => {
  const status = signal('ready');
  const canContribute = signal(true);

  function run(): Promise<boolean | UrlTree> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: CurrentUserService, useValue: { status, canContribute } },
      ],
    });
    return TestBed.runInInjectionContext(async () => {
      const result = contributorGuard('/roasters')(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      );
      return isObservable(result)
        ? firstValueFrom(result as Observable<boolean | UrlTree>)
        : (result as boolean | UrlTree);
    });
  }

  beforeEach(() => {
    status.set('ready');
    canContribute.set(true);
  });

  it('lets a contributor or an admin through', async () => {
    expect(await run()).toBe(true);
  });

  it('sends anyone else to the list', async () => {
    canContribute.set(false);
    const result = await run();

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/roasters');
  });

  it('waits for the profile to load before deciding', async () => {
    status.set('loading');
    canContribute.set(false);
    const pending = run();
    canContribute.set(true);
    status.set('ready');

    expect(await pending).toBe(true);
  });
});
