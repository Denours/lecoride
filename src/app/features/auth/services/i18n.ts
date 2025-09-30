// src/app/features/auth/i18n/i18n.service.ts
import { Injectable, signal, computed, effect } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class I18nService {
  // signal pour la langue courante
  private readonly currentLangSignal = signal<'fr' | 'en'>('fr');

  // computed pour expose la langue actuelle
  readonly lang = computed(() => this.currentLangSignal());

  constructor(private readonly translate: TranslateService) {
    // définir la langue par défaut
    translate.setFallbackLang('fr');
    translate.use(this.currentLangSignal());

    // effet pour réagir à tout changement de signal
    effect(() => {
      const lang = this.currentLangSignal();
      translate.use(lang);
    });
  }

  // méthode pour changer la langue
  setLang(lang: 'fr' | 'en') {
    this.currentLangSignal.set(lang);
  }

  // helper pour obtenir la langue courante
  getLang() {
    return this.currentLangSignal();
  }
}
