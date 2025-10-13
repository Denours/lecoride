import { TestBed } from '@angular/core/testing';
import { PaymentService } from './payment';
import { take } from 'rxjs/operators';

describe('PaymentService', () => {
  let svc: PaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PaymentService] });
    svc = TestBed.inject(PaymentService);
  });

  it('should simulate card initiate returning redirectUrl', (done) => {
    svc
      .initiate('card', 1000)
      .pipe(take(1))
      .subscribe((res) => {
        expect(res.status).toBe('pending');
        expect(res.redirectUrl).toBeTruthy();
        done();
      });
  });
});
