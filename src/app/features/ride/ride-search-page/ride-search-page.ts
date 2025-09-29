import { Component, inject } from '@angular/core';
import { AddressForm } from '../components/address-form/address-form';
import { RideMap } from '../components/ride-map/ride-map';
import { EstimatePanel } from '../components/estimate-panel/estimate-panel';
import { RideSearchStore } from '../store/ride-search.store';
import { CommonModule } from '@angular/common';
import { RideRequestModal } from '../components/ride-request-modal/ride-request-modal';

@Component({
  selector: 'app-ride-search-page',
  standalone: true,
  imports: [CommonModule, AddressForm, RideMap, EstimatePanel, RideRequestModal],
  template: `
    <section class="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 class="text-2xl font-bold">Réserver un trajet</h1>
      <app-address-form (requestRide)="openModal()"></app-address-form>
      <app-estimate-panel (requestRide)="openModal()"></app-estimate-panel>
      <app-ride-request-modal
        *ngIf="showModal"
        [pickupLabel]="pickup?.label || null"
        [dropoffLabel]="dropoff?.label || null"
        [distanceKm]="distance"
        [durationMin]="duration"
        (toClose)="closeModal()"
        (toConfirm)="handleConfirm($event)"
      ></app-ride-request-modal>
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
  handleConfirm(data: any) {
    console.log('✅ Course confirmée :', data);
    // 👉 Ici tu pourras plus tard déclencher un appel API
    this.closeModal();
  }
}
