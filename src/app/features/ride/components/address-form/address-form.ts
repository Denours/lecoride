import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RideSearchStore } from '../../store/ride-search.store';
import { GeoService } from '../../services/geo';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-form.html',
  styleUrls: ['./address-form.scss'],
})
export class AddressForm {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(RideSearchStore);
  private readonly geo = inject(GeoService);

  submitted = signal(false);
  suggestionsPickup: any[] = [];
  suggestionsDropoff: any[] = [];
  errorMessage: string | null = null; // pour messages généraux

  addressForm = this.fb.group({
    pickup: ['', Validators.required],
    dropoff: ['', Validators.required],
  });

  // recherche automatique des adresses
  searchPickup() {
    const q = this.addressForm.get('pickup')?.value || '';
    if (!q) {
      this.suggestionsPickup = [];
      return;
    }
    this.geo.autocomplete(q).subscribe((list) => {
      if (!list.length) {
        this.errorMessage = 'Aucun point de départ trouvé pour cette saisie.';
      } else {
        this.errorMessage = null;
      }
      this.suggestionsPickup = list;
    });
  }

  searchDropoff() {
    const q = this.addressForm.get('dropoff')?.value || '';
    if (!q) {
      this.suggestionsDropoff = [];
      return;
    }
    this.geo.autocomplete(q).subscribe((list) => {
      if (!list.length) {
        this.errorMessage = "Aucun point d'arrivée trouvé pour cette saisie.";
      } else {
        this.errorMessage = null;
      }
      this.suggestionsDropoff = list;
    });
  }

  selectPickup(item: any) {
    this.addressForm.patchValue({ pickup: item.label });
    this.suggestionsPickup = [];
    this.store.setPickup({ lat: item.lat, lng: item.lng, label: item.label });
  }

  selectDropoff(item: any) {
    this.addressForm.patchValue({ dropoff: item.label });
    this.suggestionsDropoff = [];
    this.store.setDropoff({ lat: item.lat, lng: item.lng, label: item.label });
  }

  useMyPosition() {
    if (!navigator.geolocation) return alert('Géolocalisation non disponible');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.addressForm.patchValue({ pickup: 'Ma position (GPS)' });
        this.store.setPickup({ lat, lng, label: 'Position actuelle' });
      },
      (err) => {
        console.error(err);
        alert("Impossible d'obtenir la position. Vérifiez les permissions.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  onSubmit() {
    this.submitted.set(true);
    const pickup = this.store.pickup();
    const dropoff = this.store.dropoff();

    if (!pickup) {
      this.errorMessage = 'Veuillez renseigner un point de départ valide.';
      return;
    }

    if (!dropoff) {
      this.errorMessage = 'Veuillez renseigner une destination valide.';
      return;
    }

    if (pickup.lat === dropoff.lat && pickup.lng === dropoff.lng) {
      this.errorMessage = 'Le point de départ et la destination ne peuvent pas être identiques.';
      return;
    }

    if (this.addressForm.valid && pickup && dropoff) {
      this.errorMessage = null;
      console.log('Demande initiée (frontend mock)', { pickup, dropoff });
    }
  }
}
