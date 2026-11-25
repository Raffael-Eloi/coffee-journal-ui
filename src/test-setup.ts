import { TestBed } from '@angular/core/testing';
import { provideTransloco, Translation, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import en from '../public/i18n/en.json';

class TestLoader implements TranslocoLoader {
  getTranslation() {
    return of(en as Translation);
  }
}

// Every component spec gets the English translations, loaded synchronously.
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideTransloco({
        config: { availableLangs: ['en', 'pt'], defaultLang: 'en' },
        loader: TestLoader,
      }),
    ],
  });
});
