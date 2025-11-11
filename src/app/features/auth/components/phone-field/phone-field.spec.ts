import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhoneField } from './phone-field';
import { AbstractControl } from '@angular/forms';

describe('PhoneField', () => {
  let component: PhoneField;
  let fixture: ComponentFixture<PhoneField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneField],
    }).compileComponents();

    fixture = TestBed.createComponent(PhoneField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate E.164 correctly', () => {
    const control = { value: '+237699999999' } as AbstractControl;
    expect(component['e164Validator'](control)).toBeNull();

    const invalidControl = { value: 'abc' } as AbstractControl;
    expect(component['e164Validator'](invalidControl)).toEqual({ e164: true });
  });

  it('should propagate valueChanges via onChange', () => {
    const spy = jasmine.createSpy('onChange');
    component.registerOnChange(spy);
    component.control.setValue('+237699999999');
    expect(spy).toHaveBeenCalledWith('+237699999999');
  });

  it('should writeValue correctly', () => {
    component.writeValue('+237699999999');
    expect(component.control.value).toBe('+237699999999');

    component.writeValue(null);
    expect(component.control.value).toBe('');
  });

  it('should registerOnChange and registerOnTouched', () => {
    const changeSpy = jasmine.createSpy();
    const touchSpy = jasmine.createSpy();
    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchSpy);

    component['onChange']('+237699999999');
    component['onTouched']();
    expect(changeSpy).toHaveBeenCalledWith('+237699999999');
    expect(touchSpy).toHaveBeenCalled();
  });

  it('should disable and enable', () => {
    component.disable();
    expect(component.control.disabled).toBeTrue();

    component.enable();
    expect(component.control.enabled).toBeTrue();
  });

  it('should return correct E.164 number', () => {
    component.writeValue('+237699999999');
    expect(component.getE164()).toBe('+237699999999');

    component.writeValue('invalid');
    expect(component.getE164()).toBeNull();
  });

  it('should return correct errorMsg', () => {
    component.writeValue('');
    component.control.markAsTouched();
    expect(component.errorMsg).toBe('Numéro requis');

    component.writeValue('invalid');
    component.control.markAsTouched();
    expect(component.errorMsg).toBe('Format international requis (ex : +237 699 999 999)');
  });

  it('should markTouched', () => {
    const spy = jasmine.createSpy();
    component.registerOnTouched(spy);
    component.markTouched();
    expect(spy).toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    const spy = spyOn(component['_sub'], 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
