import { TestBed, waitForAsync } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { GeoService, GeoResult } from './geo';

describe('GeoService', () => {
  let service: GeoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty array for empty or short query', waitForAsync(() => {
    service
      .autocomplete('')
      .pipe(take(1))
      .subscribe((results) => {
        expect(results).toEqual([]);
      });
    service
      .autocomplete(' ')
      .pipe(take(1))
      .subscribe((results) => {
        expect(results).toEqual([]);
      });
  }));

  it('should return matching results for autocomplete', waitForAsync(() => {
    service
      .autocomplete('Douala')
      .pipe(take(1))
      .subscribe((results) => {
        expect(results.length).toBeGreaterThan(0);
        expect(
          results.every((r: GeoResult) => r.label.toLowerCase().includes('douala'))
        ).toBeTrue();
      });
  }));

  it('should limit autocomplete results to 6 items', waitForAsync(() => {
    service
      .autocomplete('a')
      .pipe(take(1))
      .subscribe((results) => {
        expect(results.length).toBeLessThanOrEqual(6);
      });
  }));

  it('should return nearest point for reverseGeocode', waitForAsync(() => {
    const lat = 4.05,
      lng = 9.7; // proche de Akwa, Douala
    service
      .reverseGeocode(lat, lng)
      .pipe(take(1))
      .subscribe((result) => {
        expect(result.label).toBe('Akwa, Douala');
        expect(result.lat).toBeCloseTo(lat, 3);
        expect(result.lng).toBeCloseTo(lng, 3);
      });
  }));

  it('should handle reverseGeocode for distant point', waitForAsync(() => {
    const lat = 10.595,
      lng = 14.327; // Dougoï, Maroua
    service
      .reverseGeocode(lat, lng)
      .pipe(take(1))
      .subscribe((result) => {
        expect(result.label).toBe('Dougoï, Maroua');
      });
  }));
});
