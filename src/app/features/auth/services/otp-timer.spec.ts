import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OtpTimer } from './otp-timer';
import { BehaviorSubject } from 'rxjs';

describe('OtpTimer', () => {
  let service: OtpTimer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtpTimer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('start should count down and stop at 0', fakeAsync(() => {
    const results: number[] = [];

    // On ignore la valeur initiale du BehaviorSubject
    service.remaining$ = new BehaviorSubject<number>(4);

    service.remaining$.subscribe((val) => results.push(val));

    service.start(3);

    tick(1000); // remaining$ = 2
    tick(1000); // remaining$ = 1
    tick(1000); // remaining$ = 0

    expect(results).toEqual([4, 3, 2, 1, 0]); // inclut la dernière valeur 0
  }));

  it('stop should immediately stop the timer and set remaining to 0', fakeAsync(() => {
    service.start(5);
    tick(1000);
    service.stop();
    expect(service.remaining$.value).toBe(0);
  }));

  it('starting a new timer unsubscribes the previous one', fakeAsync(() => {
    service.start(3);
    const firstSub = (service as any).sub;
    service.start(1);
    const secondSub = (service as any).sub;
    expect(firstSub.closed).toBeTrue();
    expect(secondSub.closed).toBeFalse();
  }));
});
