import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { PaymentModal } from './payment-modal';
import { PaymentService } from '../../services/payment';
import { RideSearchStore } from '../../../ride/store/ride-search.store';
import { PaymentOptionInt } from '../../models/payment.type';

describe('PaymentModal', () => {
  let component: PaymentModal;
  let fixture: ComponentFixture<PaymentModal>;
  let mockPaymentService: jasmine.SpyObj<PaymentService>;
  let mockStore: jasmine.SpyObj<RideSearchStore>;

  beforeEach(async () => {
    mockPaymentService = jasmine.createSpyObj('PaymentService', ['initiate']);
    mockStore = jasmine.createSpyObj('RideSearchStore', ['distance']);
    mockStore.distance.and.returnValue(10); // simulons 10 km

    await TestBed.configureTestingModule({
      imports: [PaymentModal],
      providers: [
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: RideSearchStore, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute price from ride if defined', () => {
    component.ride = { id: '1', pickup: 'A', dropoff: 'B', price: 2500 } as any;
    const price = component.price();
    expect(price).toBe(2500);
  });

  it('should compute price from distance when ride price not defined', () => {
    component.ride = { id: '1', pickup: 'A', dropoff: 'B' } as any;
    const price = component.price();
    expect(price).toBe(4000); // 10 * 400
  });

  it('should set selected option and clear message', () => {
    const opt: PaymentOptionInt = { id: 'cash', label: 'Cash', icon: '💵', description: '' };
    component.message.set('hello');
    component.select(opt);
    expect(component.selected()).toEqual(opt);
    expect(component.message()).toBeNull();
  });

  it('should do nothing if simulatePayment called without selection', () => {
    spyOn(component as any, 'onSuccess');
    component.simulatePayment();
    expect((component as any).onSuccess).not.toHaveBeenCalled();
  });

  it('should handle simulatePayment success instantly', fakeAsync(() => {
    const opt: PaymentOptionInt = { id: 'cash', label: 'Cash', icon: '💵', description: '' };
    component.select(opt);
    mockPaymentService.initiate.and.returnValue(of({ status: 'success' }));

    spyOn<any>(component, 'onSuccess').and.callThrough();
    component.simulatePayment();
    expect(mockPaymentService.initiate).toHaveBeenCalled();
    expect(component.stage()).toBe('success');
    expect(component.message()).toContain('✅ Paiement réussi');
    tick();
    expect(component['onSuccess']).toHaveBeenCalled();
  }));

  it('should handle simulatePayment redirect (card)', fakeAsync(() => {
    spyOn(globalThis, 'open');
    const opt: PaymentOptionInt = { id: 'card', label: 'Carte', icon: '💳', description: '' };
    component.select(opt);
    mockPaymentService.initiate.and.returnValue(
      of({ status: 'pending', redirectUrl: 'http://fake' })
    );

    spyOn<any>(component, 'onSuccess').and.callThrough();
    component.simulatePayment();
    expect(window.open).toHaveBeenCalledWith('http://fake', '_blank');
    expect(component.stage()).toBe('pending');
    expect(component.message()).toContain('Redirection');
    tick(4000);
    expect(component['onSuccess']).toHaveBeenCalled();
  }));

  it('should handle simulatePayment mobile money (pending no redirect)', fakeAsync(() => {
    const opt: PaymentOptionInt = {
      id: 'mobile_money',
      label: 'Mobile Money',
      icon: '📱',
      description: '',
    };
    component.select(opt);
    mockPaymentService.initiate.and.returnValue(of({ status: 'pending' }));

    spyOn<any>(component, 'onSuccess').and.callThrough();
    component.simulatePayment();
    expect(component.stage()).toBe('pending');
    expect(component.message()).toContain('Mobile Money');
    tick(3000);
    expect(component['onSuccess']).toHaveBeenCalled();
  }));

  it('should handle simulatePayment failure', fakeAsync(() => {
    const opt: PaymentOptionInt = { id: 'cash', label: 'Cash', icon: '💵', description: '' };
    component.select(opt);
    mockPaymentService.initiate.and.returnValue(of({ status: 'failed' }));

    spyOn<any>(component, 'onFailure').and.callThrough();
    component.simulatePayment();
    tick();
    expect(component['onFailure']).toHaveBeenCalled();
  }));

  it('should set success stage and emit paymentDone', () => {
    const spyEmit = spyOn(component.paymentDone, 'emit');
    component.ride = { id: 'xyz' } as any;
    (component as any).onSuccess();
    expect(component.stage()).toBe('success');
    expect(component.message()).toContain('✅');
    expect(spyEmit).toHaveBeenCalledWith('xyz');
  });

  it('should set failed stage and message on failure', () => {
    (component as any).onFailure();
    expect(component.stage()).toBe('failed');
    expect(component.message()).toContain('❌');
  });

  it('should download receipt successfully', () => {
    const aSpy = spyOn(document, 'createElement').and.callFake((): any => ({
      click: jasmine.createSpy('click'),
    }));
    component.selected.set({ id: 'cash', label: 'Cash', icon: '💵', description: '' });
    component.ride = { pickup: 'A', dropoff: 'B', price: 1000 } as any;
    component.downloadReceipt();
    expect(aSpy).toHaveBeenCalledWith('a');
  });

  it('should emit close when finishPayment called', () => {
    const spyEmit = spyOn(component.toClose, 'emit');
    component.finishPayment();
    expect(spyEmit).toHaveBeenCalled();
  });
});
