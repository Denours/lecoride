import { Logo } from './../../logo/logo';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RideSearchStore } from '../store/ride-search.store';
import { PaymentModal } from '../../payment/components/payment-modal/payment-modal';
import { RouterLink } from '@angular/router';
import { Ride } from '../models/ride.type';


@Component({
  selector: 'app-ride-history-page',
  standalone: true,
  imports: [CommonModule, PaymentModal, RouterLink, Logo],
  template: `
    <app-logo />
    <section class="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 class="text-2xl font-bold">Historique de mes trajets</h1>

      <button
        routerLink="/ride/search"
        class="hover:text-blue-800 transition text-slate-800 text-start border border-green-400 bg-green-200 rounded-lg w-48 p-1"
      >
        ← Retour à la réservation
      </button>

      @if (rides().length === 0) {
      <p class="text-gray-600 italic">Aucun trajet réservé pour le moment.</p>
      } @else {
      <div class="grid gap-4">
        @for (ride of rides(); track ride.id) {
        <div
          class="p-4 border border-gray-300 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white"
        >
          <div class="flex flex-col">
            <h2 class="font-semibold text-lg text-gray-800">
              {{ ride.pickup }} → {{ ride.dropoff }}
            </h2>
            <p class="text-gray-600 text-sm">
              {{ ride.when }} • {{ ride.price | number : '1.0-0' }} FCFA
            </p>
          </div>

          <div class="flex gap-3">
            @if (ride.isPaid) {
            <span class="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium"
              >Payé</span
            >
            } @else {
            <button
              class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium"
              (click)="openPaymentModal(ride)"
            >
              Payer
            </button>
            }
          </div>
        </div>
        }
      </div>
      }

      <!-- 🪙 Modal de paiement -->
      @if (showPaymentModal()) {
      <app-payment-modal
        [ride]="selectedRide()"
        (toClose)="closePaymentModal()"
        (paymentDone)="markAsPaid(selectedRide()?.id)"
      />
      }
    </section>
  `,
  styles: `
    h1 {
      color: #1f2937;
    }

    button {
      cursor: pointer;
    }
  `,
})
export class RideHistoryPage {
  private readonly store = inject(RideSearchStore);

  // ✅ Récupération directe depuis le store
  readonly rides = this.store.rides;

  readonly showPaymentModal = signal(false);
  readonly selectedRide = signal<Ride | null>(null);

  openPaymentModal(ride: Ride) {
    this.selectedRide.set(ride);
    this.showPaymentModal.set(true);
  }

  closePaymentModal() {
    this.showPaymentModal.set(false);
    this.selectedRide.set(null);
  }

  markAsPaid(rideId?: string | null): void {
    if (!rideId) return;

    this.store.rides.update((list) =>
      list.map((r) => (r.id === rideId ? { ...r, isPaid: true } : r))
    );

    this.closePaymentModal();
  }
}
