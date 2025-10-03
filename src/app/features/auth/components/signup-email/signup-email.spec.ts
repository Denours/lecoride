import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupEmail } from './signup-email';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withRouterConfig } from '@angular/router';

describe('SignupEmail', () => {
  let component: SignupEmail;
  let fixture: ComponentFixture<SignupEmail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupEmail], // ton composant standalone
      providers: [
        provideHttpClient(), // fournit HttpClient
        provideHttpClientTesting(), // fournit le backend de test pour HttpClient
        provideRouter([], withRouterConfig({ onSameUrlNavigation: 'reload' })),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupEmail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
