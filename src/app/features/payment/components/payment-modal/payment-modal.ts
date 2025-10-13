import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment';
import { PaymentOptionInt } from '../../models/payment.type';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 flex flex-col gap-6 relative">
        <!-- HEADER -->
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">Sélection du mode de paiement</h2>
          <button (click)="toClose.emit()" class="text-gray-500 hover:text-black">✖</button>
        </div>

        <!-- RÉSUMÉ -->
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold mb-1">Résumé du trajet</p>
          <p>📍 De : {{ summary().pickup }}</p>
          <p>🏁 À : {{ summary().dropoff }}</p>
          <p class="text-sm text-gray-600 mt-1">💰 Montant : {{ amount() }} FCFA</p>
        </div>

        <!-- OPTIONS DE PAIEMENT -->
        <div class="grid grid-cols-3 gap-3">
          @for (opt of options; track opt.id) {
          <button
            (click)="select(opt)"
            [class.border-blue-500]="selected()?.id === opt.id"
            class="border rounded-xl p-3 flex flex-col items-center hover:border-blue-400"
          >
            <span class="text-3xl">{{ opt.icon }}</span>
            <span class="text-sm font-semibold mt-1">{{ opt.label }}</span>
          </button>
          }
        </div>

        <!-- MESSAGE ÉTAT -->
        @if (message()) {
        <p class="text-center font-medium"
          [ngClass]="{
            'text-blue-600': stage() === 'pending' || stage() === 'initiated',
            'text-green-600': stage() === 'success',
            'text-red-600': stage() === 'failed'
          }"
        >
          {{ message() }}
        </p>
        }

        <!-- ACTIONS -->
        <div class="flex justify-end gap-2 mt-4">
          @if (stage() === 'success') {
          <button
            (click)="downloadReceipt()"
            class="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Télécharger reçu
          </button>
          <button
            (click)="finishPayment()"
            class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Terminer
          </button>
          } @else {
          <button
            (click)="startPayment()"
            class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            [disabled]="!selected() || stage() === 'pending'"
          >
            Payer maintenant
          </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class PaymentModal {
  @Output() toClose = new EventEmitter<void>();
  @Output() paymentDone = new EventEmitter<void>();

  options: PaymentOptionInt[] = [
    { id: 'cash', label: 'Cash', icon: '💵', description: 'Paiement en espèces' },
    { id: 'mobile_money', label: 'Mobile Money', icon: '📱', description: 'Paiement via mobile' },
    { id: 'card', label: 'Carte', icon: '💳', description: 'Paiement via carte (Stripe)' },
  ];

  selected = signal<PaymentOptionInt | null>(null);
  amount = signal<number>(1200);
  summary = signal({ pickup: 'Point A', dropoff: 'Point B' });

  stage = signal<'idle' | 'initiated' | 'pending' | 'success' | 'failed'>('idle');
  message = signal<string | null>(null);
  private paymentId: string | null = null;

  constructor(private readonly svc: PaymentService) {}

  select(opt: PaymentOptionInt) {
    this.selected.set(opt);
    this.message.set(null);
  }

  startPayment() {
    const chosen = this.selected();
    if (!chosen) return;

    this.stage.set('initiated');
    this.message.set('Initialisation du paiement…');

    this.svc.initiate(chosen.id, this.amount())
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.paymentId = res.paymentId ?? null;

          if (res.status === 'pending') {
            this.stage.set('pending');
            this.message.set('Paiement en cours…');
            this.svc.pollStatus(this.paymentId ?? '')
              .pipe(take(1))
              .subscribe((s) => {
                s.status === 'success' ? this.onSuccess() : this.onFailure();
              });
            return;
          }

          if (chosen.id === 'card' && res.redirectUrl) {
            this.message.set('Redirection vers la page de paiement...');
            window.open(res.redirectUrl, '_blank');
            this.stage.set('pending');
            this.svc.pollStatus(this.paymentId ?? '')
              .pipe(take(1))
              .subscribe((s) => {
                s.status === 'success' ? this.onSuccess() : this.onFailure();
              });
            return;
          }

          res.status === 'success' ? this.onSuccess() : this.onFailure();
        },
        error: () => this.onFailure(),
      });
  }

  private onSuccess() {
    this.stage.set('success');
    this.message.set('✅ Paiement réussi');
  }

  private onFailure() {
    this.stage.set('failed');
    this.message.set('❌ Paiement échoué, réessayez ou changez de mode.');
  }

  downloadReceipt() {
    const content = `Reçu LeCoRide\nMode: ${
      this.selected()?.label
    }\nMontant: ${this.amount()} FCFA\nTrajet: ${this.summary().pickup} → ${this.summary().dropoff}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lecoride-receipt.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  finishPayment() {
    this.paymentDone.emit();
    this.toClose.emit();
  }
}
