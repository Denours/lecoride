import { Component, inject } from '@angular/core';
import { AddressForm } from '../components/address-form/address-form';
import { RideMap } from '../components/ride-map/ride-map';
import { EstimatePanel } from '../components/estimate-panel/estimate-panel';
import { RideSearchStore } from '../store/ride-search.store';
import { CommonModule } from '@angular/common';
import { RideRequestModal } from '../components/ride-request-modal/ride-request-modal';
import { Logo } from '../../logo/logo';
import { GlobalRideData } from '../models/global-ride-data.type';
import { PaymentModal } from '../../payment/components/payment-modal/payment-modal';

@Component({
  selector: 'app-ride-search-page',
  standalone: true,
  imports: [
    CommonModule,
    AddressForm,
    RideMap,
    EstimatePanel,
    RideRequestModal,
    Logo,
    PaymentModal,
  ],
  template: `
    <app-logo />
    <section class="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 class="text-2xl font-bold">Réserver un trajet</h1>
      <app-address-form (requestRide)="openModal()"></app-address-form>
      <app-estimate-panel (requestRide)="openModal()"></app-estimate-panel>
      @if (showModal) {
      <app-ride-request-modal
        [pickupLabel]="pickup?.label || null"
        [dropoffLabel]="dropoff?.label || null"
        [distanceKm]="distance"
        [durationMin]="duration"
        (toClose)="closeModal()"
        (toConfirm)="handleConfirm($event)"
      />
      } @if (showPaymentModal) {
      <app-payment-modal (toClose)="closePaymentModal()" (paymentDone)="closePaymentModal()" />
      }

      <app-ride-map [pickup]="pickup" [dropoff]="dropoff"></app-ride-map>
    </section>
  `,
  styles: `
    /* Toujours envoyer la carte derrière */
#map,
.leaflet-pane,
.leaflet-control-container {
  z-index: 0 !important;
}

/* Toujours mettre le modal devant */
app-ride-request-modal {
  position: relative;
  z-index: 9999 !important;
}

  `,
})
export class RideSearchPage {
  private readonly store = inject(RideSearchStore);
  showModal = false;
  showPaymentModal = false;

  get pickup() {
    return this.store.pickup();
  }
  get dropoff() {
    return this.store.dropoff();
  }

  get distance() {
    return this.store.distance(); //  à ajouter si pas encore présent
  }
  get duration() {
    return this.store.duration(); //  à ajouter si pas encore présent
  }

  // Gestion du modal
  openModal() {
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
  }
  handleConfirm(data: GlobalRideData) {
    console.log('Course confirmée :', data);
    // 👉 Ici tu pourras plus tard déclencher un appel API
    this.closeModal();
    // 👉 Ouvre directement le modal de paiement après la confirmation
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
  }
}
