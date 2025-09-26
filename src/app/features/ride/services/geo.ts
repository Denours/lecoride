import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { RidePoint } from '../../ride/store/ride-search.store';

export interface GeoResult extends RidePoint {
  label: string;
}

@Injectable({ providedIn: 'root' })
export class GeoService {
  private readonly sample: GeoResult[] = [
    { label: 'Akwa, Douala', lat: 4.05, lng: 9.7 },
    { label: 'Bonanjo, Douala', lat: 4.0475, lng: 9.707 },
    { label: 'Bepanda, Douala', lat: 4.072, lng: 9.711 },
    { label: 'Makepe, Douala', lat: 4.026, lng: 9.737 },
    { label: 'Marché Mboppi, Douala', lat: 4.0525, lng: 9.691 },
    { label: 'Yaoundé - Bastos', lat: 3.865, lng: 11.509 },
    { label: 'Bafoussam centre', lat: 5.4766, lng: 10.4177 },
    { label: 'Kribi plage', lat: 2.9456, lng: 9.91 },
  ];

  // Autocomplete : filtre simple + délai réseau simulé
  autocomplete(query: string) {
    if (!query || query.trim().length < 1) return of([]).pipe(delay(150));
    const q = query.toLowerCase();
    return of(this.sample).pipe(
      map((list) => list.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 6)),
      delay(200)
    );
  }

  // reverse : renvoie le plus proche (mock)
  reverseGeocode(lat: number, lng: number) {
    // simple nearest-neighbour mock
    const nearest = this.sample.reduce((best, cur) => {
      const dcur = (cur.lat - lat) ** 2 + (cur.lng - lng) ** 2;
      const dbest = best ? (best.lat - lat) ** 2 + (best.lng - lng) ** 2 : Number.POSITIVE_INFINITY;
      return dcur < dbest ? cur : best;
    }, this.sample[0]);
    return of({ label: nearest.label, lat: nearest.lat, lng: nearest.lng }).pipe(delay(200));
  }
}
