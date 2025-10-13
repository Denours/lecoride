import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentOption } from '../payment-option/payment-option';
import { PaymentOptionInt } from '../../models/payment.type';
import { PaymentService } from '../../services/payment';
import { RouterModule, Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-payment-checkout',
  standalone: true,
  imports: [CommonModule, PaymentOption, RouterModule],
  templateUrl: './payment-checkout.html',
})
export class PaymentCheckout {
  // options
  options: PaymentOptionInt[] = [
    { id: 'cash', label: 'Cash', icon: '💵', description: 'Payer en espèces au chauffeur' },
    {
      id: 'mobile_money',
      label: 'Mobile Money',
      icon: '📱',
      description: 'Payer via Mobile Money',
    },
    { id: 'card', label: 'Carte bancaire', icon: '💳', description: 'Payer via carte (Stripe)' },
  ];

  // reactive state
  selected = signal<PaymentOptionInt | null>(this.options[0]); // default cash
  amount = signal<number>(1200); // montant à afficher (remplace par votre calcul)
  summary = signal({ pickup: 'Point A', dropoff: 'Point B', distanceKm: 3.2 });

  stage = signal<'idle' | 'initiated' | 'pending' | 'success' | 'failed'>('idle');
  message = signal<string | null>(null);
  private paymentId: string | null = null;
  constructor(private readonly svc: PaymentService, private readonly router: Router) {}

  select(option: PaymentOptionInt) {
    this.selected.set(option);
    this.message.set(null);
  }

  startPayment() {
    const chosen = this.selected();
    if (!chosen) return;
    this.stage.set('initiated');
    this.message.set('Initialisation du paiement…');

    this.svc
      .initiate(chosen.id, this.amount())
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.paymentId = res.paymentId ?? null;
          if (chosen.id === 'card' && res.redirectUrl) {
            // Simuler redirection Stripe : ouvrir un nouvel onglet (ici mock)
            this.message.set('Redirection vers la page de paiement...');
            window.open(res.redirectUrl, '_blank');
            // En simulate: on passe en pending
            this.stage.set('pending');
            // et on poll le statut (simulé)
            this.svc
              .pollStatus(this.paymentId ?? '')
              .pipe(take(1))
              .subscribe((s) => {
                if (s.status === 'success') {
                  this.onSuccess();
                } else {
                  this.onFailure();
                }
              });
            return;
          }

          if (res.status === 'pending') {
            this.stage.set('pending');
            this.message.set('Paiement en cours…');
            // simule polling
            this.svc
              .pollStatus(this.paymentId ?? '')
              .pipe(take(1))
              .subscribe((s) => {
                if (s.status === 'success') this.onSuccess();
                else this.onFailure();
              });
            return;
          }

          if (res.status === 'success') {
            this.onSuccess();
          } else {
            this.onFailure();
          }
        },
        error: () => {
          this.onFailure();
        },
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
    // simple receipt text; replace with jsPDF if disponible
    const content = `Reçu LecoRide\nMode: ${
      this.selected()?.label
    }\nMontant: ${this.amount()} FCFA\nTrajet: ${this.summary().pickup} → ${
      this.summary().dropoff
    }\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lecoride-receipt.txt'; // si tu veux PDF, installer jsPDF et remplacer logic
    a.click();
    URL.revokeObjectURL(url);
  }
}
