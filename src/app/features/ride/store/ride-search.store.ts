import { Injectable, signal } from '@angular/core';

export interface RidePoint {
  lat: number;
  lng: number;
  label?: string;
}

@Injectable({
  providedIn: 'root', // 👈 ajoute ça
})
export class RideSearchStore {
  readonly pickup = signal<RidePoint | null>(null);
  readonly dropoff = signal<RidePoint | null>(null);

  setPickup(p: RidePoint | null) {
    this.pickup.set(p);
  }

  setDropoff(d: RidePoint | null) {
    this.dropoff.set(d);
  }
}
