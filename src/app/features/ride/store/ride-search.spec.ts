import { TestBed } from '@angular/core/testing';
import { RideSearchStore, RidePoint } from './ride-search.store';
import { Ride } from '../models/ride.type';

describe('RideSearchStore', () => {
  let store: RideSearchStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(RideSearchStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should set and get pickup', () => {
    const pickup: RidePoint = { lat: 4.05, lng: 9.7, label: 'Akwa' };
    store.setPickup(pickup);
    expect(store.pickup()).toEqual(pickup);
  });

  it('should set and get dropoff', () => {
    const dropoff: RidePoint = { lat: 4.07, lng: 9.71, label: 'Bepanda' };
    store.setDropoff(dropoff);
    expect(store.dropoff()).toEqual(dropoff);
  });

  it('should set estimate', () => {
    store.setEstimate(10, 5000);
    expect(store.distance()).toBe(10);
    expect(store.estimatedPrice()).toBe(5000);
  });

  it('should add a ride to rides list', () => {
    const ride: Ride = {
      id: 'r1',
      pickup: 'Akwa',
      dropoff: 'Bepanda',
      vehicle: 'Car',
      passengers: 2,
      baggage: true,
      ac: true,
      when: 'now',
      distance: 5,
      price: 2000,
    };
    store.addRide(ride);
    expect(store.rides().length).toBe(1);
    expect(store.rides()[0]).toEqual(ride);
  });

  it('should clear rides', () => {
    const ride: Ride = {
      id: 'r2',
      pickup: 'Akwa',
      dropoff: 'Bepanda',
      vehicle: 'Car',
      passengers: 1,
      baggage: false,
      ac: false,
      when: 'now',
    };
    store.addRide(ride);
    expect(store.rides().length).toBe(1);
    store.clearRides();
    expect(store.rides().length).toBe(0);
  });

  it('should initialize signals as null or empty', () => {
    expect(store.pickup()).toBeNull();
    expect(store.dropoff()).toBeNull();
    expect(store.distance()).toBeNull();
    expect(store.duration()).toBeNull();
    expect(store.estimatedPrice()).toBeNull();
    expect(store.rides()).toEqual([]);
  });
});
