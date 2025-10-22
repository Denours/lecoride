import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentOptionInt } from '../../models/payment.type';
import { RideSearchStore } from '../../../ride/store/ride-search.store';
import { Ride } from '../../../ride/models/ride.type';
import { PaymentService } from '../../services/payment';

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
          <p>📍 De : {{ pickupLabel() || 'Non défini' }}</p>
          <p>🏁 À : {{ dropoffLabel() || 'Non défini' }}</p>
        </div>

        <!-- OPTIONS -->
        <div class="grid grid-cols-3 gap-3">
          @for (opt of options; track opt.id) {
          <button
            (click)="select(opt)"
            [class.border-blue-500]="selected()?.id === opt.id"
            class="border rounded-xl p-3 flex flex-col items-center hover:border-blue-400"
            role="option"
            [attr.aria-selected]="selected()?.id === opt.id"
          >
            <span class="text-3xl" aria-hidden="true">{{ opt.icon }}</span>
            <span class="text-sm font-semibold mt-1">{{ opt.label }}</span>
          </button>
          }
        </div>

        <!-- MESSAGE -->
        @if (message()) {
        <p
          class="text-center font-medium"
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
            (click)="simulatePayment()"
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
  private readonly paymentService = inject(PaymentService);

  @Input() ride: Ride | null = null;
  @Output() paymentDone = new EventEmitter<string | null>();
  @Output() toClose = new EventEmitter<void>();

  private readonly store = inject(RideSearchStore);

  options: PaymentOptionInt[] = [
    { id: 'cash', label: 'Cash', icon: '💵', description: 'Paiement en espèces' },
    { id: 'mobile_money', label: 'Mobile Money', icon: '📱', description: 'Paiement via mobile' },
    { id: 'card', label: 'Carte', icon: '💳', description: 'Paiement via carte' },
  ];

  selected = signal<PaymentOptionInt | null>(null);
  stage = signal<'idle' | 'initiated' | 'pending' | 'success' | 'failed'>('idle');
  message = signal<string | null>(null);

  pickupLabel = computed(() => this.ride?.pickup ?? '');
  dropoffLabel = computed(() => this.ride?.dropoff ?? '');
  price = computed(() => {
    const distance = this.store.distance();
    if (this.ride?.price != null) return this.ride.price;
    return distance ? Math.round(distance * 400) : 0;
  });

  select(opt: PaymentOptionInt) {
    this.selected.set(opt);
    this.message.set(null);
  }

  // --- Simulation locale du paiement ---
  simulatePayment() {
    const chosen = this.selected();
    if (!chosen) return;

    this.stage.set('initiated');
    this.message.set('Initialisation du paiement…');

    const price = this.price();

    this.paymentService.initiate(chosen.id, price).subscribe((res) => {
      if (res.status === 'pending' && res.redirectUrl) {
        // Simulation d'une redirection Stripe (pour carte)
        window.open(res.redirectUrl, '_blank');
        this.stage.set('pending');
        this.message.set('Redirection vers la page de paiement…');
        setTimeout(() => this.onSuccess(), 4000);
      } else if (res.status === 'pending' && !res.redirectUrl) {
        // Simulation du traitement Mobile Money
        this.stage.set('pending');
        this.message.set('Paiement Mobile Money en cours...');
        // après 3 secondes, on simule la réussite
        setTimeout(() => this.onSuccess(), 3000);
      } else if (res.status === 'success') {
        this.onSuccess();
      } else {
        this.onFailure();
      }
    });
  }

  private onSuccess() {
    this.stage.set('success');
    this.message.set('✅ Paiement réussi');
    this.paymentDone.emit(this.ride?.id ?? null);
  }

  private onFailure() {
    this.stage.set('failed');
    this.message.set('❌ Paiement échoué, réessayez ou changez de mode.');
  }

  downloadReceipt() {
    const content = `Reçu LeCoRide\nMode: ${
      this.selected()?.label
    }\nMontant: ${this.price()} FCFA\nTrajet: ${this.pickupLabel()} → ${this.dropoffLabel()}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lecoride-receipt.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  finishPayment() {
    this.toClose.emit();
  }
}
