import { TestBed } from '@angular/core/testing';
import { provideRouter, withRouterConfig } from '@angular/router';
import { SignupChoice } from './signup-choice';

describe('SignupChoice', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SignupChoice],
      providers: [
        provideRouter([], withRouterConfig({ onSameUrlNavigation: 'reload' }))
      ]
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SignupChoice);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
