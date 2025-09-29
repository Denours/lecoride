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
  distance = signal<number | null>(null);   //  distance en km
  duration = signal<number | null>(null);   //  durée en minutes
  setPickup(p: RidePoint | null) {
    this.pickup.set(p);
  }

  setDropoff(d: RidePoint | null) {
    this.dropoff.set(d);
  }
}
