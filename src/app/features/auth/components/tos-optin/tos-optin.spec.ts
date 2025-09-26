import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TosOptin } from './tos-optin';

describe('TosOptin', () => {
  let component: TosOptin;
  let fixture: ComponentFixture<TosOptin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TosOptin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TosOptin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
