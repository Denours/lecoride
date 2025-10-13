import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentOption } from './payment-option';

describe('PaymentOptionComponent', () => {
  let comp: PaymentOption;
  let fixture: ComponentFixture<PaymentOption>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaymentOption] }).compileComponents();
    fixture = TestBed.createComponent(PaymentOption);
    comp = fixture.componentInstance;
    comp.option = { id: 'cash', icon: '💵', label: 'Cash' };
    fixture.detectChanges();
  });

  it('renders label and icon', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Cash');
    expect(el.textContent).toContain('💵');
  });
});
