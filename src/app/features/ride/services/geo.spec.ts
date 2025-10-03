import { TestBed } from '@angular/core/testing';

import { GeoService } from './geo';

describe('Geo', () => {
  let service: GeoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
