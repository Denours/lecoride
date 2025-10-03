import { SignupEmailCheck } from './signup-email-check';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withRouterConfig } from '@angular/router';

describe('SignupEmail', () => {
  let component: SignupEmailCheck;
  let fixture: ComponentFixture<SignupEmailCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupEmailCheck], // ton composant standalone
      providers: [
        provideHttpClient(), // fournit HttpClient
        provideHttpClientTesting(), // fournit le backend de test pour HttpClient
        provideRouter([], withRouterConfig({ onSameUrlNavigation: 'reload' })),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupEmailCheck);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
