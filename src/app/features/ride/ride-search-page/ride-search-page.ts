import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressForm } from '../components/address-form/address-form';
import { RideMap } from '../components/ride-map/ride-map';
import { EstimatePanel } from '../components/estimate-panel/estimate-panel';
import { RideRequestModal } from '../components/ride-request-modal/ride-request-modal';
import { Logo } from '../../logo/logo';
import { RideSearchStore } from '../store/ride-search.store';
import { GlobalRideData } from '../models/global-ride-data.type';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ride-search-page',
  standalone: true,
  imports: [CommonModule, AddressForm, RideMap, EstimatePanel, RideRequestModal, Logo, RouterLink],
  template: `
    <app-logo />

    <section class="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 class="text-2xl font-bold">Réserver un trajet</h1>

      <!-- 🧭 Lien vers l’historique -->
      <a routerLink="/ride/history" class="text-blue-600 underline hover:text-blue-800 transition">
        Historique de mes trajets
      </a>

      <!-- 🧾 Formulaire et estimation -->
      <app-address-form (requestRide)="openModal()" />
      <app-estimate-panel (requestRide)="openModal()" />

      <!-- 🪟 Modal de demande de course -->
      @if (showModal()) {
      <app-ride-request-modal
        [pickupLabel]="pickup()?.label ?? null"
        [dropoffLabel]="dropoff()?.label ?? null"
        [distanceKm]="distance()"
        [durationMin]="duration()"
        (toClose)="closeModal()"
        (toConfirm)="handleConfirm($event)"
      />
      }

      <!-- 🗺️ Carte -->
      <app-ride-map [pickup]="pickup()" [dropoff]="dropoff()"></app-ride-map>
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

  // ✅ On passe à des signaux Angular v20+
  readonly showModal = signal(false);

  // Getters basés sur les signaux du store
  pickup = this.store.pickup;
  dropoff = this.store.dropoff;
  distance = this.store.distance;
  duration = this.store.duration;

  // Gestion du modal
  openModal() {
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  handleConfirm(data: GlobalRideData) {
    console.log('✅ Course confirmée :', data);

    // ⛔ Ne pas ouvrir le modal de paiement ici
    // Ce sera géré dans la page "ride-history" lors du clic sur "Payer"

    // Ferme juste le modal de demande de course
    this.closeModal();
  }
}
