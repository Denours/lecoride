import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, withRouterConfig, Router, ActivatedRoute } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError, Subject } from 'rxjs';
import { SignupSuccess } from './signup-success';
import { AuthApi } from '../../services/auth-api';

class MockAuthApi {
  confirmEmail(token: string) {
    return of({ token: 'dummy_token' });
  }
  me() {
    return of({});
  }
}

describe('SignupSuccess', () => {
  let component: SignupSuccess;
  let fixture: any;
  let router: Router;
  let routeSubject: Subject<any>;
  let api: MockAuthApi;

  beforeEach(async () => {
    routeSubject = new Subject<any>();
    api = new MockAuthApi();

    await TestBed.configureTestingModule({
      imports: [SignupSuccess],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([], withRouterConfig({ onSameUrlNavigation: 'reload' })),
        { provide: ActivatedRoute, useValue: { queryParams: routeSubject.asObservable() } },
        { provide: AuthApi, useValue: api },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupSuccess);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle missing token', fakeAsync(() => {
    routeSubject.next({});
    tick();
    fixture.detectChanges();
    expect(component.loading).toBeFalse();
    expect(component.errorMsg).toBe('Token manquant ou invalide.');
  }));

  it('should handle valid token and navigate', fakeAsync(() => {
    spyOn(router, 'navigate');
    routeSubject.next({ token: 'valid_token' });
    tick(); // pour queryParams
    tick(); // pour confirmEmail
    tick(); // pour me()
    fixture.detectChanges();
    expect(localStorage.getItem('auth_token')).toBe('dummy_token');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should handle confirmEmail error', fakeAsync(() => {
    spyOn(api, 'confirmEmail').and.returnValue(throwError(() => new Error('fail')));
    routeSubject.next({ token: 'invalid_token' });
    tick();
    fixture.detectChanges();
    expect(component.loading).toBeFalse();
    expect(component.errorMsg).toBe('Token invalide ou expiré.');
  }));

  it('should handle me() error', fakeAsync(() => {
    spyOn(api, 'me').and.returnValue(throwError(() => new Error('fail')));
    routeSubject.next({ token: 'valid_token' });
    tick(); // queryParams
    tick(); // confirmEmail
    tick(); // me()
    fixture.detectChanges();
    expect(component.loading).toBeFalse();
    expect(component.errorMsg).toBe('Impossible de récupérer les informations utilisateur.');
  }));
});
