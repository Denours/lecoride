import { Logo } from './../../logo/logo';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RideSearchStore } from '../store/ride-search.store';
import { PaymentModal } from '../../payment/components/payment-modal/payment-modal';
import { RouterLink } from '@angular/router';

export interface RideHistoryItem {
  id: number;
  pickup: string;
  dropoff: string;
  price: number;
  date: string;
  paid: boolean;
}

@Component({
  selector: 'app-ride-history-page',
  standalone: true,
  imports: [CommonModule, PaymentModal, RouterLink, Logo],
  template: `
    <app-logo />
    <section class="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 class="text-2xl font-bold">Historique de mes trajets</h1>

      <a routerLink="/ride/search" class="text-blue-600 underline hover:text-blue-800 transition">
        ← Retour à la réservation
      </a>

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
              {{ ride.date }} • {{ ride.price | number : '1.0-0' }} FCFA
            </p>
          </div>

          <div class="flex gap-3">
            @if (ride.paid) {
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
    :host {
      display: block;
      background-color: #f9fafb;
      min-height: 100vh;
      padding-bottom: 4rem;
    }

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

  // Liste dynamique des trajets réservés (provenant du store ou d’un service futur)
  readonly rides = signal<RideHistoryItem[]>([
    // 🚧 Exemple temporaire — remplacé ensuite par tes vraies données de store ou API
    {
      id: 1,
      pickup: 'Carrefour Biyem-Assi',
      dropoff: 'Marché Mokolo',
      price: 1200,
      date: new Date().toLocaleString(),
      paid: false,
    },
    {
      id: 2,
      pickup: 'Bonamoussadi',
      dropoff: 'Akwa',
      price: 2200,
      date: new Date().toLocaleString(),
      paid: true,
    },
  ]);

  readonly showPaymentModal = signal(false);
  readonly selectedRide = signal<RideHistoryItem | null>(null);

  openPaymentModal(ride: RideHistoryItem) {
    this.selectedRide.set(ride);
    this.showPaymentModal.set(true);
  }

  closePaymentModal() {
    this.showPaymentModal.set(false);
    this.selectedRide.set(null);
  }

  markAsPaid(rideId?: number | null) {
    if (!rideId) return;

    this.rides.update((list) => list.map((r) => (r.id === rideId ? { ...r, paid: true } : r)));

    this.closePaymentModal();
  }
}
