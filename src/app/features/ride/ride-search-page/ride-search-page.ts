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

@Component({
  selector: 'app-ride-search-page',
  standalone: true,
  imports: [CommonModule, AddressForm, RideMap, EstimatePanel, RideRequestModal, Logo, RouterLink],
  template: `
    <app-logo />
    <section class="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 class="text-2xl font-bold">Réserver un trajet</h1>
      <!-- 🧭 Lien vers l’historique -->
      <button
        routerLink="/ride/history"
        class=" hover:text-blue-800 transition text-lg text-slate-800 border border-1 border-green-400 bg-green-200 w-52 d-block mx-auto rounded-lg p-0.5"
      >
        Historique de mes trajets
      </button>

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

  handleConfirm(data: Ride) {
    const ride = {
      pickup: data.pickup,
      dropoff: data.dropoff,
      vehicle: data.vehicle,
      passengers: data.passengers,
      baggage: data.baggage,
      ac: data.ac,
      when: data.when,
      distance: this.distance() ?? 0,
      price: data.price ?? 0,
      isPaid: false,
    };

    // ✅ Ajoute le trajet dans le store
    this.store.addRide(ride);

    console.log('✅ Nouveau trajet ajouté à l’historique :', ride);

    // Ferme le modal
    this.closeModal();
  }
}
