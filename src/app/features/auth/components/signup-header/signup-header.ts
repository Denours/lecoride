import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../services/i18n';

@Component({
  selector: 'app-signup-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <h1>{{ 'signup.title' | translate }}</h1>
    <button (click)="switch('fr')">FR</button>
    <button (click)="switch('en')">EN</button>
  `,
})
export class SignupHeader {
  constructor(public i18n: I18nService) {}

  switch(lang: 'fr' | 'en') {
    this.i18n.setLang(lang);
  }
}
