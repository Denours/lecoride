import { Component, inject, signal, effect, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RideSearchStore, RidePoint } from '../../store/ride-search.store';

@Component({
  selector: 'app-estimate-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estimate-panel.html',
})
export class EstimatePanel {
  private readonly store = inject(RideSearchStore);

  // Signaux pour pickup/dropoff et estimation
  pickup = signal<RidePoint | null>(null);
  dropoff = signal<RidePoint | null>(null);
  estimatedPrice = signal(0);
  distanceKm = signal(0);
  @Output() distanceChange = new EventEmitter<number>();
  @Output() priceChange = new EventEmitter<number>();

  constructor() {
    // Synchronisation avec le store
    effect(() => {
      this.pickup.set(this.store.pickup());
      this.dropoff.set(this.store.dropoff());
      this.calculateEstimate();
    });
  }

  private calculateEstimate() {
    const pickup = this.pickup();
    const dropoff = this.dropoff();

    if (!pickup || !dropoff) {
      this.estimatedPrice.set(0);
      this.distanceKm.set(0);
      return;
    }

    // Calcul de la distance Haversine
    const distance = this.getDistanceFromLatLonInKm(
      pickup.lat,
      pickup.lng,
      dropoff.lat,
      dropoff.lng
    );
    this.distanceKm.set(distance);

    // Tarif réaliste (F CFA)
    const tarifParKm = 50; // F CFA par km
    const fraisFixe = 500; // F CFA fixe

    const prix = Math.round(distance * tarifParKm + fraisFixe);
    this.estimatedPrice.set(prix);
    this.distanceChange.emit(distance);
    this.priceChange.emit(prix);
  }

  private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // rayon Terre km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
}
