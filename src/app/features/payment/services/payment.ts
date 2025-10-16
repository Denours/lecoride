import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaymentMethodId } from '../models/payment.type';
import { PaymentMetaData } from '../models/payment-metadata.type';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  // Simule un init d'un paiement.
  // payload contient { method, price, metadata }
  initiate(
    method: PaymentMethodId,
    price: number,
    metadata?: PaymentMetaData
  ): Observable<{
    status: 'pending' | 'success' | 'failed';
    paymentId?: string;
    redirectUrl?: string;
  }> {
    // Pour simuler différents comportements selon méthode :
    if (method === 'card') {
      // simulate Stripe: return pending with a redirectUrl
      return of({
        status: 'pending',
        paymentId: 'card_123',
        redirectUrl: 'https://example.com/stripe-checkout-mock',
      });
    }

    if (method === 'mobile_money') {
      // simulate pending then success after 3s
      return timer(500).pipe(map(() => ({ status: 'pending', paymentId: 'mm_123' })));
    }

    // cash: immediate success
    return of({ status: 'success', paymentId: 'cash_123' });
  }

  // Optionnel : récupérer statut (simulé)
  pollStatus(paymentId: string): Observable<{ status: 'pending' | 'success' | 'failed' }> {
    // pour la démo, après 3s on renvoie success
    return timer(3000).pipe(map(() => ({ status: 'success' })));
  }
}
