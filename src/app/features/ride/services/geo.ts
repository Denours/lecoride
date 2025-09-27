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
    // Douala
    { label: 'Akwa, Douala', lat: 4.05, lng: 9.7 },
    { label: 'Bonanjo, Douala', lat: 4.0475, lng: 9.707 },
    { label: 'Bepanda, Douala', lat: 4.072, lng: 9.711 },
    { label: 'Makepe, Douala', lat: 4.026, lng: 9.737 },
    { label: 'Marché Mboppi, Douala', lat: 4.0525, lng: 9.691 },

    // Yaoundé
    { label: 'Bastos, Yaoundé', lat: 3.865, lng: 11.509 },
    { label: 'Mokolo, Yaoundé', lat: 3.881, lng: 11.516 },
    { label: 'Melen, Yaoundé', lat: 3.844, lng: 11.478 },
    { label: 'Nlongkak, Yaoundé', lat: 3.875, lng: 11.497 },

    // Bafoussam
    { label: 'Bafoussam centre', lat: 5.4766, lng: 10.4177 },
    { label: 'Tamdja, Bafoussam', lat: 5.45, lng: 10.417 },
    { label: 'Banego, Bafoussam', lat: 5.49, lng: 10.42 },

    // Bamenda
    { label: 'Commercial Avenue, Bamenda', lat: 5.963, lng: 10.159 },
    { label: 'Nkwen, Bamenda', lat: 5.976, lng: 10.165 },

    // Garoua
    { label: 'Roumde Adjia, Garoua', lat: 9.3, lng: 13.4 },
    { label: 'Plateau, Garoua', lat: 9.31, lng: 13.39 },

    // Maroua
    { label: 'Dougoï, Maroua', lat: 10.595, lng: 14.327 },
    { label: 'Domayo, Maroua', lat: 10.58, lng: 14.33 },

    // Ngaoundéré
    { label: 'Dang, Ngaoundéré', lat: 7.32, lng: 13.58 },
    { label: 'Bali, Ngaoundéré', lat: 7.33, lng: 13.58 },

    // Kribi
    { label: 'Kribi plage', lat: 2.9456, lng: 9.91 },
    { label: 'Mboamanga, Kribi', lat: 2.95, lng: 9.92 },

    // Limbé
    { label: 'Down Beach, Limbé', lat: 4.017, lng: 9.21 },
    { label: 'Mile 1, Limbé', lat: 4.02, lng: 9.22 },

    // Buéa
    { label: 'Molyko, Buéa', lat: 4.155, lng: 9.24 },
    { label: 'Great Soppo, Buéa', lat: 4.17, lng: 9.23 },
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
