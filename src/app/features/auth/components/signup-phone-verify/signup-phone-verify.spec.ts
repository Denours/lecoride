import { SignupPhoneVerify } from './signup-phone-verify';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withRouterConfig } from '@angular/router';

describe('SignupEmail', () => {
  let component: SignupPhoneVerify;
  let fixture: ComponentFixture<SignupPhoneVerify>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupPhoneVerify], // ton composant standalone
      providers: [
        provideHttpClient(), // fournit HttpClient
        provideHttpClientTesting(), // fournit le backend de test pour HttpClient
        provideRouter([], withRouterConfig({ onSameUrlNavigation: 'reload' })),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPhoneVerify);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
