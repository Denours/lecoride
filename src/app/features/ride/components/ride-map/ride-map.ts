import { Component, inject, AfterViewInit, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

import { RideSearchStore } from '../../store/ride-search.store';

// Empêche Leaflet de charger les images par défaut
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: '',
});

@Component({
  selector: 'app-ride-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div id="map"></div>`,
  styleUrls: ['./ride-map.scss'],
})
export class RideMap implements AfterViewInit, OnChanges {
  readonly store = inject(RideSearchStore);
  private map!: L.Map;
  private pickupMarker!: L.Marker;
  private dropoffMarker!: L.Marker;
  private markers: L.Marker[] = [];
  private routeLine?: L.Polyline;

  @Input() pickup: { lat: number; lng: number; label?: string } | null = null;
  @Input() dropoff: { lat: number; lng: number; label?: string } | null = null;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(): void {
    if (!this.map) return;

    // Supprimer anciens marqueurs et itinéraire
    this.clearMap();

    // Ajouter marqueurs
    this.addMarkers();

    // Tracer itinéraire si pickup & dropoff définis
    if (this.pickup && this.dropoff) {
      this.drawRoute(this.pickup, this.dropoff);
    }
  }

  /** Nettoie la carte (marqueurs + ligne) */
  private clearMap(): void {
    this.markers.forEach((m) => this.map.removeLayer(m));
    this.markers = [];
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = undefined;
    }
  }

  /** Ajoute les marqueurs pickup & dropoff */
  private addMarkers(): void {
    const pickupIcon = L.divIcon({
      className: 'custom-marker pickup-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
    const dropoffIcon = L.divIcon({
      className: 'custom-marker dropoff-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    if (this.pickup) {
      const m = L.marker([this.pickup.lat, this.pickup.lng], { icon: pickupIcon }).addTo(this.map);
      if (this.pickup.label) m.bindPopup(this.pickup.label);
      this.markers.push(m);
    }

    if (this.dropoff) {
      const m = L.marker([this.dropoff.lat, this.dropoff.lng], { icon: dropoffIcon }).addTo(
        this.map
      );
      if (this.dropoff.label) m.bindPopup(this.dropoff.label);
      this.markers.push(m);
    }

    if (this.markers.length) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.2));
    }
  }

  /** Trace un itinéraire entre pickup et dropoff via OSRM */
  private drawRoute(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number }
  ): void {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            (c: number[]) => [c[1], c[0]] as [number, number]
          );
          this.routeLine = L.polyline(coords, { color: 'blue', weight: 4 }).addTo(this.map);
        }
      })
      .catch((err) => console.error('Erreur OSRM:', err));
  }

  /** Initialise la carte */
  private initMap(): void {
    this.map = L.map('map').setView([4.0511, 9.7679], 12);
    this.map.invalidateSize();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Icônes par défaut
    const pickupIcon = L.divIcon({
      className: 'custom-marker pickup-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
    const dropoffIcon = L.divIcon({
      className: 'custom-marker dropoff-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    // Marqueurs par défaut
    this.pickupMarker = L.marker([4.0511, 9.7679], { icon: pickupIcon, draggable: true })
      .addTo(this.map)
      .on('dragend', () => {
        const ll = this.pickupMarker.getLatLng();
        this.store.setPickup({ lat: ll.lat, lng: ll.lng, label: 'Pickup (drag)' });
      });

    this.dropoffMarker = L.marker([4.0561, 9.7679], { icon: dropoffIcon, draggable: true })
      .addTo(this.map)
      .on('dragend', () => {
        const ll = this.dropoffMarker.getLatLng();
        this.store.setDropoff({ lat: ll.lat, lng: ll.lng, label: 'Dropoff (drag)' });
      });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (!this.store.pickup()) {
        this.store.setPickup({ lat: e.latlng.lat, lng: e.latlng.lng, label: 'Pickup (map click)' });
      } else {
        this.store.setDropoff({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          label: 'Dropoff (map click)',
        });
      }
    });
  }
}
