import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentOption } from './payment-option';
import { By } from '@angular/platform-browser';

describe('PaymentOption', () => {
  let component: PaymentOption;
  let fixture: ComponentFixture<PaymentOption>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentOption],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentOption);
    component = fixture.componentInstance;
    component.option = { id: 'cash', label: 'Cash', icon: '💵', description: 'Paiement en espèces' };
    component.selected = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render option label and icon', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Cash');
    expect(element.textContent).toContain('💵');
  });

  it('should emit selection when onClick is called', () => {
    const spy = spyOn(component.selection, 'emit');
    component.onClick();
    expect(spy).toHaveBeenCalledWith(component.option);
  });

  it('should toggle selected input properly', () => {
    component.selected = true;
    fixture.detectChanges();
    expect(component.selected).toBeTrue();
  });

  it('should emit selection when element clicked (integration test)', () => {
    const spy = spyOn(component.selection, 'emit');
    const hostEl = fixture.debugElement;
    const clickable = hostEl.query(By.css('*')); // clic sur le composant hôte
    clickable.triggerEventHandler('click', {});
    expect(spy).toHaveBeenCalledWith(component.option);
  });
});
