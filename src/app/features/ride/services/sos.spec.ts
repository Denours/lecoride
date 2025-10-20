import { TestBed } from '@angular/core/testing';

import { Sos } from './sos';

describe('Sos', () => {
  let service: Sos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
