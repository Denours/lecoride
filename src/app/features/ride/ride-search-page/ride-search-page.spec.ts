import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RideSearchPage } from './ride-search-page';
import { RideSearchStore } from '../store/ride-search.store';
import { Ride } from '../models/ride.type';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';

class RideSearchStoreMock {
  pickup = signal('Point A');
  dropoff = signal('Point B');
  distance = signal(10);
  rides = signal<Ride[]>([]);

  addRide = jasmine.createSpy('addRide').and.callFake((ride: Ride) => {
    const current = this.rides();
    this.rides.set([...current, ride]);
  });

  setEstimate = jasmine.createSpy('setEstimate');
}

describe('RideSearchPage', () => {
  let component: RideSearchPage;
  let fixture: ComponentFixture<RideSearchPage>;
  let storeMock: RideSearchStoreMock;

  beforeEach(async () => {
    storeMock = new RideSearchStoreMock();

    await TestBed.configureTestingModule({
      imports: [RideSearchPage],
      providers: [{ provide: RideSearchStore, useValue: storeMock }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RideSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open modal', () => {
    expect(component.showModal()).toBeFalse();
    component.openModal();
    expect(component.showModal()).toBeTrue();
  });

  it('should close modal', () => {
    component.openModal();
    expect(component.showModal()).toBeTrue();
    component.closeModal();
    expect(component.showModal()).toBeFalse();
  });

  it('should handle confirm and add ride', () => {
    const rideData: Ride = {
      id: '1',
      pickup: 'Point A',
      dropoff: 'Point B',
      vehicle: 'Sedan',
      passengers: 2,
      baggage: true,
      ac: true,
      when: new Date().toISOString(), // string
      distance: undefined,
      price: undefined,
      isPaid: false,
    };

    component.handleConfirm(rideData);

    // Le modal doit se fermer
    expect(component.showModal()).toBeFalse();

    // Le store doit avoir reçu addRide
    expect(storeMock.addRide).toHaveBeenCalled();
    const addedRide = storeMock.addRide.calls.mostRecent().args[0];
    expect(addedRide.distance).toBe(10);
    expect(addedRide.price).toBe(10 * 50 + 500); // tarifParKm * distance + fraisFixe
  });
});
