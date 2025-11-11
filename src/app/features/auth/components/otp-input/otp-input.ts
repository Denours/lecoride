import {
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './otp-input.html',
  styleUrls: ['./otp-input.scss'],
})
export class OtpInput {
  inputs = new Array(6);
  @ViewChildren('otp') otpEls!: QueryList<ElementRef>;
  private values = new Array(6).fill('');

  @Output() complete = new EventEmitter<string>();

  onInput(e: Event, idx: number) {
    const input = e.target as HTMLInputElement;
    const val = input.value.replaceAll(/\D/g, '');
    if (!val) {
      this.values[idx] = '';
      return;
    }

    // Collage de plusieurs chiffres
    if (val.length > 1) {
      for (let i = 0; i < val.length && idx + i < 6; i++) {
        this.values[idx + i] = val[i];
        const el = this.otpEls.toArray()[idx + i].nativeElement;
        el.value = val[i];
      }
      const next = Math.min(5, idx + val.length);
      this.otpEls.toArray()[next].nativeElement.focus();
    } else {
      this.values[idx] = val;
      const next = idx + 1;
      if (next < 6) this.otpEls.toArray()[next].nativeElement.focus();
    }

    this.emitIfComplete();
  }

  onKey(e: KeyboardEvent, idx: number) {
    const el = this.otpEls.toArray()[idx].nativeElement;
    if (e.key === 'Backspace' && !el.value && idx > 0) {
      const prev = this.otpEls.toArray()[idx - 1].nativeElement;
      prev.focus();
      prev.value = '';
      this.values[idx - 1] = '';
    }
  }

  onPaste(e: ClipboardEvent) {
    const text = e.clipboardData?.getData('text') ?? '';
    const digits = text.replaceAll(/\D/g, '').slice(0, 6);

    for (let i = 0; i < digits.length; i++) {
      const el = this.otpEls.toArray()[i].nativeElement;
      el.value = digits[i];
      this.values[i] = digits[i];
    }

    this.emitIfComplete();
  }

  private emitIfComplete() {
    if (this.values.every((v) => v !== '')) this.complete.emit(this.values.join(''));
  }
}
