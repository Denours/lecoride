import { TestBed } from '@angular/core/testing';

import { OtpTimer } from './otp-timer';

describe('OtpTimer', () => {
  let service: OtpTimer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtpTimer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
