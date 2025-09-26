import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupChoice } from './signup-choice';

describe('SignupChoice', () => {
  let component: SignupChoice;
  let fixture: ComponentFixture<SignupChoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupChoice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupChoice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
