import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupEmail } from './signup-email';

describe('SignupEmail', () => {
  let component: SignupEmail;
  let fixture: ComponentFixture<SignupEmail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupEmail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupEmail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
