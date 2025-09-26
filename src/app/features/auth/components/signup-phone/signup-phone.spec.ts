import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupPhone } from './signup-phone';

describe('SignupPhone', () => {
  let component: SignupPhone;
  let fixture: ComponentFixture<SignupPhone>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupPhone]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupPhone);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
