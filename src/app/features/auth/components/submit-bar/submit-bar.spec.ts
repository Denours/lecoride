import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitBar } from './submit-bar';

describe('SubmitBar', () => {
  let component: SubmitBar;
  let fixture: ComponentFixture<SubmitBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
