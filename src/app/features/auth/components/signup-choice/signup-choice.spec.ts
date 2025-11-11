import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SignupChoice } from './signup-choice';
import { provideRouter, withRouterConfig, Router } from '@angular/router';

describe('SignupChoice', () => {
  let component: SignupChoice;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SignupChoice],
      providers: [provideRouter([], withRouterConfig({ onSameUrlNavigation: 'reload' }))],
    });

    const fixture = TestBed.createComponent(SignupChoice);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to the given path when go() is called', fakeAsync(() => {
    spyOn(router, 'navigate');
    const path = 'email';
    component.go(path);
    tick();
    expect(router.navigate).toHaveBeenCalledWith(['/signup', path]);
  }));
});
