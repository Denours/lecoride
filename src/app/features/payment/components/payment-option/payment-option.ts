import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PaymentOptionInt } from '../../models/payment.type';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-payment-option',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-option.html',
})
export class PaymentOption {
  @Input() option!: PaymentOptionInt;
  @Input() selected = false;
  @Output() select = new EventEmitter<PaymentOptionInt>();

  onClick() {
    this.select.emit(this.option);
  }
}
