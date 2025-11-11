import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SignupEmail } from './signup-email';
import { SignupStore } from '../../store/signup.store';
import { AuthApi } from '../../services/auth-api';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('SignupEmail', () => {
  let component: SignupEmail;
  let fixture: ComponentFixture<SignupEmail>;
  let store: SignupStore;
  let api: AuthApi;
  let router: Router;

  beforeEach(async () => {
    const storeMock = {
      startLoading: jasmine.createSpy(),
      stopLoading: jasmine.createSpy(),
      setStep: jasmine.createSpy(),
      setError: jasmine.createSpy(),
    };

    const apiMock = {
      signupEmail: jasmine.createSpy(),
    };

    const routerMock = {
      navigate: jasmine.createSpy(),
    };

    const activatedRouteMock = {
      snapshot: {},
      url: of([]),
      params: of({}),
      queryParams: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [SignupEmail],
      providers: [
        { provide: SignupStore, useValue: storeMock },
        { provide: AuthApi, useValue: apiMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }, // ✅ important
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupEmail);
    component = fixture.componentInstance;
    store = TestBed.inject(SignupStore);
    api = TestBed.inject(AuthApi);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call onFormSubmit and handle success', fakeAsync(() => {
    const payload = { email: 'test@test.com', password: '123456', firstName: 'John', lastName: 'Doe' };
    (api.signupEmail as jasmine.Spy).and.returnValue(of({}));

    component.onFormSubmit(payload);
    tick(); // simule la fin de l'Observable

    expect(store.startLoading).toHaveBeenCalled();
    expect(store.setStep).toHaveBeenCalledWith('check-inbox');
    expect(router.navigate).toHaveBeenCalledWith(['signup/email/check-inbox']);
  }));

  it('should call onFormSubmit and handle error', fakeAsync(() => {
    const payload = { email: 'test@test.com', password: '123456', firstName: 'John', lastName: 'Doe' };
    (api.signupEmail as jasmine.Spy).and.returnValue(throwError(() => new Error('fail')));

    component.onFormSubmit(payload);
    tick();

    expect(store.startLoading).toHaveBeenCalled();
    expect(store.setError).toHaveBeenCalledWith('Impossible de créer le compte. Réessaie.');
    expect(store.stopLoading).toHaveBeenCalled();
  }));

  it('should call goBack', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
