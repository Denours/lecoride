import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupPhoneVerify } from './signup-phone-verify';

describe('SignupPhoneVerify', () => {
  let component: SignupPhoneVerify;
  let fixture: ComponentFixture<SignupPhoneVerify>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupPhoneVerify]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupPhoneVerify);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
