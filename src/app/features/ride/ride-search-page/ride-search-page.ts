import { Component, inject } from '@angular/core';
import { AddressForm } from '../components/address-form/address-form';
import { RideMap } from '../components/ride-map/ride-map';
import { EstimatePanel } from '../components/estimate-panel/estimate-panel';
import { RideSearchStore } from '../store/ride-search.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ride-search-page',
  standalone: true,
  imports: [CommonModule, AddressForm, RideMap, EstimatePanel],
  template: `
    <section class="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 class="text-2xl font-bold">Réserver un trajet</h1>
      <app-address-form></app-address-form>
      <app-ride-map [pickup]="pickup" [dropoff]="dropoff"></app-ride-map>
      <app-estimate-panel></app-estimate-panel>
    </section>
  `,
})
export class RideSearchPage {
  private readonly store = inject(RideSearchStore);
  get pickup() {
    return this.store.pickup();
  }
  get dropoff() {
    return this.store.dropoff();
  }
}
