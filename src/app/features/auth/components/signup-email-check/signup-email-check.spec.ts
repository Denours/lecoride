import { SignupEmailCheck } from './signup-email-check';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, withRouterConfig, Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('SignupEmailCheck', () => {
  let component: SignupEmailCheck;
  let fixture: ComponentFixture<SignupEmailCheck>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupEmailCheck],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([], withRouterConfig({ onSameUrlNavigation: 'reload' })),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupEmailCheck);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate home when goHome() is called', fakeAsync(() => {
    spyOn(router, 'navigate');
    component.goHome();
    tick();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should navigate to /ride/search when confirmEmail() is called', fakeAsync(() => {
    spyOn(router, 'navigate');
    component.confirmEmail();
    tick();
    expect(router.navigate).toHaveBeenCalledWith(['/ride/search']);
  }));
});
