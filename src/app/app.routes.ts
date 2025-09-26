import { Routes } from '@angular/router';

export const routes: Routes = [
  // Choix du type d'inscription (téléphone ou email)
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/components/signup-choice/signup-choice').then((c) => c.SignupChoice),
  },
  // Parcours téléphone + OTP
  {
    path: 'signup/phone',
    loadComponent: () =>
      import('./features/auth/components/signup-phone/signup-phone').then((c) => c.SignupPhone),
  },
  {
    path: 'signup/phone/verify',
    loadComponent: () =>
      import('./features/auth/components/signup-phone-verify/signup-phone-verify').then(
        (c) => c.SignupPhoneVerify
      ),
  },
  // Parcours email + mot de passe
  {
    path: 'signup/email',
    loadComponent: () =>
      import('./features/auth/components/signup-email/signup-email').then((c) => c.SignupEmail),
  },
  {
    path: 'signup/email/check-inbox',
    loadComponent: () =>
      import('./features/auth/components/signup-email-check/signup-email-check').then(
        (c) => c.SignupEmailCheck
      ),
  },
  // Succès après validation email / OTP
  {
    path: 'signup/success',
    loadComponent: () =>
      import('./features/auth/components/signup-success/signup-success').then(
        (c) => c.SignupSuccess
      ),
  },
  // { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Choix du type d'inscription (téléphone ou email) à la landing-page
  {
    path: 'ride/search',
    loadComponent: () =>
      import('./features/ride/ride-search-page/ride-search-page').then((c) => c.RideSearchPage),
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/auth/components/signup-choice/signup-choice').then((c) => c.SignupChoice),
  },
];
