import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressForm } from '../components/address-form/address-form';
import { RideMap } from '../components/ride-map/ride-map';
import { EstimatePanel } from '../components/estimate-panel/estimate-panel';
import { RideRequestModal } from '../components/ride-request-modal/ride-request-modal';
import { Logo } from '../../logo/logo';
import { RideSearchStore } from '../store/ride-search.store';
import { RouterLink } from '@angular/router';
import { Ride } from '../models/ride.type';
import { SOSButton } from '../../sos-button/sos-button';

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
    RouterLink,
    SOSButton,
  ],
  template: `
    <app-logo />
    <section class="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 class="text-2xl font-bold">Réserver un trajet</h1>
      <!-- 🧭 Lien vers l’historique -->
      <div class="flex space-x-4">
        <button
          routerLink="/ride/history"
          class=" hover:text-blue-800 transition text-lg text-slate-800 border border-1 border-green-400 bg-green-200 w-56 rounded-lg p-0.5"
        >
          Historique de mes trajets
        </button>
        <button
          routerLink="/sos"
          class=" hover:text-blue-800 transition text-lg text-slate-800 border border-1 border-red-400 bg-red-200 w-56 rounded-lg p-0.5"
        >
          Historique de mes alertes
        </button>
      </div>
      <app-sos-button />

      <!-- 🧾 Formulaire et estimation -->
      <app-address-form (requestRide)="openModal()" />
      <app-estimate-panel
        (requestRide)="openModal()"
        (distanceChange)="distanceKm = $event"
        (priceChange)="prixEstime = $event"
      />

      <!-- 🪟 Modal de demande de course -->
      @if (showModal()) {
      <app-ride-request-modal
        [pickupLabel]="pickup()?.label ?? null"
        [dropoffLabel]="dropoff()?.label ?? null"
        [distanceKm]="distance()"
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

  // On passe à des signaux Angular v20+
  readonly showModal = signal(false);

  // Getters basés sur les signaux du store
  pickup = this.store.pickup;
  dropoff = this.store.dropoff;
  distance = this.store.distance;
  distanceKm = 0;
  prixEstime = 0;

  // Gestion du modal
  openModal() {
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  handleConfirm(data: Ride) {
    // récupérer distance & prix à partir du store/estimate service
    const distance = this.store.distance();
    // Tarif réaliste (F CFA)
    const tarifParKm = 50; // F CFA par km
    const fraisFixe = 500; // F CFA fixe
    const price = distance ? Math.round(distance * tarifParKm + fraisFixe) : undefined;

    const ride = {
      id: Date.now().toString(),
      pickup: data.pickup,
      dropoff: data.dropoff,
      vehicle: data.vehicle,
      passengers: data.passengers,
      baggage: data.baggage,
      ac: data.ac,
      when: data.when,
      distance: distance ?? null,
      price: price,
      isPaid: false,
    };

    // Ajoute le trajet dans le store
    this.store.addRide(ride);

    console.log('✅ Nouveau trajet ajouté à l’historique :', ride);

    // Ferme le modal
    this.closeModal();
  }
}
