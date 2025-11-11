import { Injectable, signal } from '@angular/core';
import { Ride } from '../models/ride.type';

export interface RidePoint {
  lat: number;
  lng: number;
  label?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RideSearchStore {
  readonly pickup = signal<RidePoint | null>(null);
  readonly dropoff = signal<RidePoint | null>(null);
  distance = signal<number | null>(null); //  distance en km
  duration = signal<number | null>(null); //  durée en minutes

  estimatedPrice = signal<number | null>(null);

  // Nouveau : liste des trajets réservés
  readonly rides = signal<Ride[]>([]);
  setPickup(p: RidePoint | null) {
    this.pickup.set(p);
  }

  setDropoff(d: RidePoint | null) {
    this.dropoff.set(d);
  }

  setEstimate(distance: number, price: number): void {
    this.distance.set(distance);
    this.estimatedPrice.set(price);
  }
  // Ajoute un trajet dans l’historique
  addRide(ride: Ride): void {
    this.rides.update((oldRides) => [...oldRides, ride]);
  }

  // (Optionnel) vider l’historique
  clearRides(): void {
    this.rides.set([]);
  }
}
