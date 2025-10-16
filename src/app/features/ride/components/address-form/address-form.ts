import { Component, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RideSearchStore } from '../../store/ride-search.store';
import { GeoService } from '../../services/geo';
import { AddressSuggestion } from '../../models/address-suggestion.type';

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
  @Output() requestRide = new EventEmitter<void>();
  canRequestRide = false;

  submitted = signal(false);
  suggestionsPickup: AddressSuggestion[] = [];
  suggestionsDropoff: AddressSuggestion[] = [];
  errorMessage: string | null = null;

  // Champs de formulaire
  addressForm = this.fb.group({
    pickup: ['', Validators.required],
    dropoff: ['', Validators.required],
  });

  // Signaux pour savoir si la valeur sélectionnée est valide
  private readonly pickupValid = signal(false);
  private readonly dropoffValid = signal(false);

  // Computed pour activer le bouton uniquement si les deux valeurs sont valides
  canSubmit = computed(() => this.pickupValid() && this.dropoffValid());

  // Recherche automatique
  searchPickup() {
    const q = this.addressForm.get('pickup')?.value || '';
    this.pickupValid.set(false); // reset validation à chaque saisie
    if (!q) {
      this.suggestionsPickup = [];
      return;
    }
    this.geo.autocomplete(q).subscribe((list) => {
      this.suggestionsPickup = list;
      this.errorMessage = list.length ? null : 'Aucun point de départ trouvé';
    });
  }

  searchDropoff() {
    const q = this.addressForm.get('dropoff')?.value || '';
    this.dropoffValid.set(false); // reset validation à chaque saisie
    if (!q) {
      this.suggestionsDropoff = [];
      return;
    }
    this.geo.autocomplete(q).subscribe((list) => {
      this.suggestionsDropoff = list;
      this.errorMessage = list.length ? null : 'Aucune destination trouvée';
    });
  }

  // Sélection de l'adresse
  selectPickup(item: AddressSuggestion) {
    this.addressForm.patchValue({ pickup: item.label });
    this.suggestionsPickup = [];
    this.store.setPickup({ lat: item.lat, lng: item.lng, label: item.label });
    this.pickupValid.set(true); // maintenant c'est valide
  }

  selectDropoff(item: AddressSuggestion) {
    this.addressForm.patchValue({ dropoff: item.label });
    this.suggestionsDropoff = [];
    this.store.setDropoff({ lat: item.lat, lng: item.lng, label: item.label });
    this.dropoffValid.set(true); // maintenant c'est valide
  }

  useMyPosition() {
    if (!navigator.geolocation) return alert('Géolocalisation non disponible');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.addressForm.patchValue({ pickup: 'Ma position (GPS)' });
        this.store.setPickup({ lat, lng, label: 'Position actuelle' });
        this.pickupValid.set(true);
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
    if (!pickup || !dropoff || !this.canSubmit()) {
      this.errorMessage = 'Veuillez choisir des adresses valides dans la liste';
      return;
    }
    this.errorMessage = null;
    console.log('Demande initiée', { pickup, dropoff });
  }

  // quand on clique :
  openRideRequestModal() {
    this.requestRide.emit();
  }

}
