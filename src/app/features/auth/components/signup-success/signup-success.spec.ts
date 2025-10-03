import { TestBed } from '@angular/core/testing';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SignupSuccess } from './signup-success';

describe('SignupSuccess', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SignupSuccess],
      providers: [
        provideHttpClient(), // fournit HttpClient
        provideHttpClientTesting(), // fournit le backend de test pour HttpClient
        provideRouter([], withRouterConfig({ onSameUrlNavigation: 'reload' })),
      ],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SignupSuccess);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
