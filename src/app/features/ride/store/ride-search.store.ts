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
  distance = signal<number | null>(null);
  duration = signal<number | null>(null);

  // Liste des trajets réservés
  readonly rides = signal<Ride[]>([]);

  setPickup(p: RidePoint | null): void {
    this.pickup.set(p);
  }

  setDropoff(d: RidePoint | null): void {
    this.dropoff.set(d);
  }

  // Ajoute un trajet dans l’historique
  addRide(ride: Ride): void {
    const id = Date.now().toString(); // Génère un ID unique local
    this.rides.update((oldRides) => [...oldRides, { ...ride, id }]);
  }

  clearRides(): void {
    this.rides.set([]);
  }
}
