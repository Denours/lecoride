import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RideHistoryPage } from './ride-history-page';
import { RideSearchStore } from '../store/ride-search.store';
import { ActivatedRoute, Router } from '@angular/router';
import { Ride } from '../models/ride.type';
import { signal } from '@angular/core';

describe('RideHistoryPage', () => {
  let component: RideHistoryPage;
  let fixture: ComponentFixture<RideHistoryPage>;
  let storeMock: any;

  const sampleRide: Ride = {
    id: '1',
    pickup: 'Point A',
    dropoff: 'Point B',
    when: 'now',
    isPaid: false,
    vehicle: 'moto',
    passengers: 1,
    baggage: false,
    ac: false,
  };

  beforeEach(async () => {
    storeMock = {
      rides: signal<Ride[]>([sampleRide]),
      update: jasmine.createSpy('update').and.callFake((fn: any) => {
        const updated = fn(storeMock.rides());
        storeMock.rides.set(updated);
      }),
    };

    await TestBed.configureTestingModule({
      imports: [RideHistoryPage],
      providers: [
        { provide: RideSearchStore, useValue: storeMock },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({}),
            serializeUrl: jasmine.createSpy('serializeUrl').and.returnValue('/stub-url'),
            events: { subscribe: () => {} },
          },
        },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RideHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open payment modal correctly', () => {
    component.openPaymentModal(sampleRide);
    expect(component.selectedRide()).toEqual(sampleRide);
    expect(component.processingRideId()).toBe('1');
    expect(component.showPaymentModal()).toBeTrue();
  });

  it('should close payment modal correctly', () => {
    component.closePaymentModal();
    expect(component.selectedRide()).toBeNull();
    expect(component.processingRideId()).toBeNull();
    expect(component.showPaymentModal()).toBeFalse();
  });

  it('should handle onPaymentDone correctly with rideId', () => {
    component.onPaymentDone('1');
    expect(storeMock.rides()[0].isPaid).toBeTrue();
  });

  it('should handle onPaymentDone correctly with null rideId', () => {
    component.showPaymentModal.set(true);
    component.selectedRide.set(sampleRide);
    component.processingRideId.set('1');

    component.onPaymentDone(null);

    expect(component.showPaymentModal()).toBeFalse();
    expect(component.selectedRide()).toBeNull();
    expect(component.processingRideId()).toBeNull();
  });
});
