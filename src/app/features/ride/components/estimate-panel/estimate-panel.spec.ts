import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimatePanel } from './estimate-panel';

describe('EstimatePanel', () => {
  let component: EstimatePanel;
  let fixture: ComponentFixture<EstimatePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstimatePanel],
    }).compileComponents();

    fixture = TestBed.createComponent(EstimatePanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
