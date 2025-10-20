import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SosPage } from './sos-page';

describe('SosPage', () => {
  let component: SosPage;
  let fixture: ComponentFixture<SosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SosPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
