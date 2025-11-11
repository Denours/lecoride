import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { RidePoint } from '../store/ride-search.store';

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
function haversine(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371; // km
  const dLat = deg2rad(bLat - aLat);
  const dLon = deg2rad(bLng - aLng);
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(aLat)) * Math.cos(deg2rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

@Injectable({ providedIn: 'root' })
export class EstimationService {
  // tarification locale (exemple) : base + per km
  private readonly baseFare = 300; // XAF
  private readonly perKm = 450; // XAF par km (ajustable)
  private readonly trafficFactor = 1.2; // prend en compte trafic africain

  getEstimate(pickup: RidePoint, dropoff: RidePoint) {
    const dist = haversine(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    const distance = Number.parseFloat(dist.toFixed(1)); // au lieu de parseFloat
    const eta = Math.max(3, Math.round(distance * 3.5 + 2)); // env. 3.5 min/km + base
    const price = Math.round((this.baseFare + this.perKm * distance) * this.trafficFactor);
    return of({ distance, eta, price }).pipe(delay(200));
  }
}
