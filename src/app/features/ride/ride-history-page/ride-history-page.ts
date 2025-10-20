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
              {{ ride.when }}
            </p>
          </div>

          <div class="flex gap-3 items-center">
            @if (ride.isPaid) {
            <span class="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium"
              >Payé</span
            >
            } @else {
            <button
              class="px-4 py-2 rounded-lg text-sm font-medium transition"
              [class.bg-blue-600]="processingRideId() !== ride.id"
              [class.text-white]="processingRideId() !== ride.id"
              [class.opacity-50]="processingRideId() === ride.id"
              [attr.aria-disabled]="processingRideId() === ride.id"
              (click)="openPaymentModal(ride)"
              [disabled]="processingRideId() === ride.id"
            >
              @if (processingRideId() === ride.id) { Traitement… } @else { Payer }
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
        (paymentDone)="onPaymentDone($event)"
      />
      }
    </section>
  `,
  styles: `
    h1 { color: #1f2937; }
    button { cursor: pointer; }
  `,
})
export class RideHistoryPage {
  private readonly store = inject(RideSearchStore);

  // Utiliser directement le signal du store
  readonly rides = this.store.rides;

  readonly showPaymentModal = signal(false);
  readonly selectedRide = signal<Ride | null>(null);

  // id du trajet en cours de paiement (pour bloquer le bouton)
  readonly processingRideId = signal<string | null>(null);

  openPaymentModal(ride: Ride) {
    this.selectedRide.set(ride);
    this.processingRideId.set(ride.id ?? null); // bloquer le bouton immédiatement
    this.showPaymentModal.set(true);
  }

  closePaymentModal() {
    this.showPaymentModal.set(false);
    this.selectedRide.set(null);
    this.processingRideId.set(null);
  }

  // handler appelé quand PaymentModal émet paymentDone (avec rideId)
  onPaymentDone(rideId: string | null) {
    if (!rideId) {
      // si aucun id (edge-case), on ferme et débloque tout
      this.closePaymentModal();
      return;
    }

    // Met à jour le store (déjà fait côté modal, mais double-sûreté)
    this.store.rides.update((list) =>
      list.map((r) => (r.id === rideId ? { ...r, isPaid: true } : r))
    );

    // fermer modal et débloquer
    // this.closePaymentModal();
  }
}
