import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideRequestModal } from './ride-request-modal';

describe('RideRequestModal', () => {
  let component: RideRequestModal;
  let fixture: ComponentFixture<RideRequestModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideRequestModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideRequestModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
