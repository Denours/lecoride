import { TestBed, waitForAsync } from '@angular/core/testing';
import { EstimationService } from './estimation';
import { RidePoint } from '../store/ride-search.store';
import { take } from 'rxjs/operators';

describe('EstimationService', () => {
  let service: EstimationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstimationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate distance correctly (haversine)', () => {
    const pickup: RidePoint = { lat: 3.848, lng: 11.502, label: 'A' };
    const dropoff: RidePoint = { lat: 3.858, lng: 11.512, label: 'B' };

    service
      .getEstimate(pickup, dropoff)
      .pipe(take(1))
      .subscribe((result) => {
        expect(result.distance).toBeGreaterThan(0);
        expect(result.eta).toBeGreaterThan(0);
        expect(result.price).toBeGreaterThan(0);
      });
  });

  it('should round distance to one decimal place', waitForAsync(() => {
    const pickup: RidePoint = { lat: 0, lng: 0, label: 'A' };
    const dropoff: RidePoint = { lat: 0.001, lng: 0.001, label: 'B' };

    service
      .getEstimate(pickup, dropoff)
      .pipe(take(1))
      .subscribe((result) => {
        const str = result.distance.toString();
        expect(str.includes('.')).toBeTrue();
        expect(str.split('.')[1].length).toBeLessThanOrEqual(1); // 1 chiffre max après la virgule
      });
  }));

  it('should return price > 0 and eta >= 3', waitForAsync(() => {
    const pickup: RidePoint = { lat: 1, lng: 1, label: 'Start' };
    const dropoff: RidePoint = { lat: 2, lng: 2, label: 'End' };

    service
      .getEstimate(pickup, dropoff)
      .pipe(take(1))
      .subscribe((result) => {
        expect(result.price).toBeGreaterThan(0);
        expect(result.eta).toBeGreaterThanOrEqual(3);
      });
  }));

  it('should handle same pickup and dropoff (distance = 0)', waitForAsync(() => {
    const pickup: RidePoint = { lat: 10, lng: 10, label: 'X' };
    const dropoff: RidePoint = { lat: 10, lng: 10, label: 'X' };

    service
      .getEstimate(pickup, dropoff)
      .pipe(take(1))
      .subscribe((result) => {
        expect(result.distance).toBe(0); // plus de fraction 0.0
        expect(result.eta).toBe(3); // valeur minimale
        expect(result.price).toBe(Math.round(service['baseFare'] * service['trafficFactor']));
      });
  }));
});
