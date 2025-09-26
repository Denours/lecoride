import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupEmailCheck } from './signup-email-check';

describe('SignupEmailCheck', () => {
  let component: SignupEmailCheck;
  let fixture: ComponentFixture<SignupEmailCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupEmailCheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupEmailCheck);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
