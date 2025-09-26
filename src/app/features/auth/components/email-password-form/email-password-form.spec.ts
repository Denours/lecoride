import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailPasswordForm } from './email-password-form';

describe('EmailPasswordForm', () => {
  let component: EmailPasswordForm;
  let fixture: ComponentFixture<EmailPasswordForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailPasswordForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailPasswordForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
