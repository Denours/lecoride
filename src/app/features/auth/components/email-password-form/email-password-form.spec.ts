import { EmailPasswordForm } from './email-password-form';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withRouterConfig } from '@angular/router';

describe('SignupEmail', () => {
  let component: EmailPasswordForm;
  let fixture: ComponentFixture<EmailPasswordForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailPasswordForm], // ton composant standalone
      providers: [
        provideHttpClient(), // fournit HttpClient
        provideHttpClientTesting(), // fournit le backend de test pour HttpClient
        provideRouter([], withRouterConfig({ onSameUrlNavigation: 'reload' })),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailPasswordForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
