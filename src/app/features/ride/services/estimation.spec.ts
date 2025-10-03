import { TestBed } from '@angular/core/testing';

import { EstimationService } from './estimation';

describe('Estimation', () => {
  let service: EstimationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstimationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
