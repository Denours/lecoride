import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PaymentService } from './payment';
import { take } from 'rxjs/operators';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaymentService],
    });
    service = TestBed.inject(PaymentService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should simulate card initiate returning redirectUrl', (done) => {
    service
      .initiate('card', 1000)
      .pipe(take(1))
      .subscribe((res) => {
        expect(res.status).toBe('pending');
        expect(res.redirectUrl).toBe('https://example.com/stripe-checkout-mock');
        expect(res.paymentId).toBe('card_123');
        done();
      });
  });

  it('should simulate mobile_money initiate returning pending after 500ms', fakeAsync(() => {
    let result: any;
    service
      .initiate('mobile_money', 500)
      .pipe(take(1))
      .subscribe((res) => (result = res));

    // Simule 500 ms
    tick(500);

    expect(result.status).toBe('pending');
    expect(result.paymentId).toBe('mm_123');
  }));

  it('should simulate cash initiate returning success immediately', (done) => {
    service
      .initiate('cash', 100)
      .pipe(take(1))
      .subscribe((res) => {
        expect(res.status).toBe('success');
        expect(res.paymentId).toBe('cash_123');
        done();
      });
  });

  it('should return success from pollStatus after 3s', fakeAsync(() => {
    let result: any;
    service
      .pollStatus('any_id')
      .pipe(take(1))
      .subscribe((res) => (result = res));

    // Simule les 3 secondes
    tick(3000);

    expect(result.status).toBe('success');
  }));
});
