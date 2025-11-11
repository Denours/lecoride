import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OtpInput } from './otp-input';
import { ElementRef } from '@angular/core';

describe('OtpInput', () => {
  let component: OtpInput;
  let fixture: ComponentFixture<OtpInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpInput],
    }).compileComponents();

    fixture = TestBed.createComponent(OtpInput);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Mock des inputs pour pouvoir utiliser nativeElement
    const otpElsArray = Array.from({ length: 6 }, () => ({
      nativeElement: document.createElement('input'),
    })) as ElementRef[];
    component['otpEls'] = {
      toArray: () => otpElsArray,
    } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle single input digit', () => {
    spyOn(component.complete, 'emit');
    const event = { target: { value: '5' } } as unknown as Event;
    component.onInput(event, 0);
    expect(component['values'][0]).toBe('5');
    expect(component.complete.emit).not.toHaveBeenCalled();
  });

  it('should handle multiple input digits (paste in input)', () => {
    spyOn(component.complete, 'emit');
    const event = { target: { value: '123' } } as unknown as Event;
    component.onInput(event, 0);
    expect(component['values'][0]).toBe('1');
    expect(component['values'][1]).toBe('2');
    expect(component['values'][2]).toBe('3');
  });

  it('should move focus on backspace', () => {
    component['values'][1] = '5';
    const keyEvent = { key: 'Backspace' } as unknown as KeyboardEvent;
    component.onKey(keyEvent, 1);
    expect(component['values'][0]).toBe('');
  });

  it('should handle onPaste', () => {
    spyOn(component.complete, 'emit');
    const clipboardData = {
      getData: () => '987654',
    };
    const pasteEvent = { clipboardData } as unknown as ClipboardEvent;
    component.onPaste(pasteEvent);
    expect(component['values']).toEqual(['9', '8', '7', '6', '5', '4']);
    expect(component.complete.emit).toHaveBeenCalledWith('987654');
  });

  it('should emit complete when all digits filled', () => {
    spyOn(component.complete, 'emit');
    component['values'] = ['1', '2', '3', '4', '5', ''];
    const event = { target: { value: '6' } } as unknown as Event;
    component.onInput(event, 5);
    expect(component.complete.emit).toHaveBeenCalledWith('123456');
  });
});
