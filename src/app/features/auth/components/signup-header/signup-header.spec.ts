import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupHeader } from './signup-header';

describe('SignupHeader', () => {
  let component: SignupHeader;
  let fixture: ComponentFixture<SignupHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
