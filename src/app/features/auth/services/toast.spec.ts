import { TestBed } from '@angular/core/testing';
import { ToastService, ToastMessage } from './toast';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('show should emit a message with default duration', (done) => {
    service.messages$.subscribe((msg: ToastMessage) => {
      expect(msg.text).toBe('Hello');
      expect(msg.duration).toBe(3000); // valeur par défaut
      done();
    });

    service.show('Hello');
  });

  it('show should emit a message with custom duration', (done) => {
    service.messages$.subscribe((msg: ToastMessage) => {
      expect(msg.text).toBe('Hi');
      expect(msg.duration).toBe(5000);
      done();
    });

    service.show('Hi', 5000);
  });
});
