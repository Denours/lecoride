import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ride-request-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <!-- WRAPPER scrollable -->
      <div
        class="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-6"
      >
        <!-- HEADER -->
        <div class="flex justify-between items-center top-0 bg-white pb-2">
          <h2 class="text-xl font-bold">Demander une course</h2>
          <button (click)="toClose.emit()" class="text-gray-500 hover:text-black">✖</button>
        </div>

        <!-- Résumé du trajet -->
        <div class="bg-gray-100 rounded-lg p-1">
          <p class="font-semibold">Résumé du trajet</p>
          <p>📍 Départ : {{ pickupLabel || 'Non défini' }}</p>
          <p>🏁 Arrivée : {{ dropoffLabel || 'Non défini' }}</p>
          <!-- <p class="text-sm text-gray-600">Distance estimée : {{ distanceKm }} km</p>
          <p class="text-sm text-gray-600">Durée estimée : {{ durationMin }} min</p> -->
        </div>

        <!-- Choix du véhicule -->
        <div>
          <p class="font-semibold mb-2">Moyen de transport</p>
          <div class="grid grid-cols-2 gap-3">
            <button
              *ngFor="let option of vehicleOptions"
              (click)="selectVehicle(option)"
              [class.border-blue-500]="selectedVehicle === option.type"
              class="border rounded-xl p-3 flex flex-col items-center hover:border-blue-400"
            >
              <span class="text-2xl">{{ option.icon }}</span>
              <span>{{ option.label }}</span>
              <span class="text-sm text-gray-600">{{ option.price }} FCFA</span>
            </button>
          </div>
        </div>

        <!-- Préférences -->
        <div>
          <p class="font-semibold mb-2">Préférences</p>
          <label class="block mb-2">
            👥 Passagers :
            <input
              type="number"
              min="1"
              max="4"
              [(ngModel)]="passengers"
              class="border rounded p-1 w-20 ml-2"
            />
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" [(ngModel)]="baggage" /> Bagages volumineux
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" [(ngModel)]="ac" /> Climatisation
          </label>
        </div>

        <!-- Planification -->
        <div>
          <p class="font-semibold mb-2">Quand partir ?</p>
          <label class="flex items-center gap-2">
            <input type="radio" name="timeOption" value="now" [(ngModel)]="timeOption" /> Maintenant
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" name="timeOption" value="schedule" [(ngModel)]="timeOption" />
            Programmer
          </label>

          <div *ngIf="timeOption === 'schedule'" class="mt-2 flex gap-2">
            <input type="date" [(ngModel)]="scheduledDate" class="border rounded p-1" />
            <input type="time" [(ngModel)]="scheduledTime" class="border rounded p-1" />
          </div>
        </div>

        <!-- Validation -->
        <button
          (click)="confirmRide()"
          [disabled]="!canConfirm()"
          class="bg-blue-600 text-white rounded-xl py-2 px-4 font-semibold hover:bg-blue-700 disabled:bg-gray-300"
        >
          Confirmer la course
        </button>
      </div>
    </div>
  `,
})
export class RideRequestModal {
  @Input() pickupLabel: string | null = null;
  @Input() dropoffLabel: string | null = null;
  @Input() distanceKm: number | null = null;
  @Input() durationMin: number | null = null;

  @Output() toClose = new EventEmitter<void>();
  @Output() toConfirm = new EventEmitter<any>();

  // Données internes
  vehicleOptions = [
    { type: 'moto', label: 'Moto-taxi', icon: '🏍️', price: 500 },
    { type: 'tricycle', label: 'Tricycle (Kéké)', icon: '🚜', price: 800 },
    { type: 'eco', label: 'Voiture économique', icon: '🚗', price: 1200 },
    { type: 'premium', label: 'Voiture premium', icon: '🚘', price: 2500 },
  ];
  selectedVehicle: string | null = null;

  passengers = 1;
  baggage = false;
  ac = false;

  timeOption: 'now' | 'schedule' = 'now';
  scheduledDate: string | null = null;
  scheduledTime: string | null = null;

  // Méthodes
  selectVehicle(option: any) {
    this.selectedVehicle = option.type;
  }

  canConfirm(): boolean {
    return !!(
      this.pickupLabel &&
      this.dropoffLabel &&
      this.selectedVehicle &&
      (this.timeOption === 'now' || (this.scheduledDate && this.scheduledTime))
    );
  }

  confirmRide() {
    if (!this.canConfirm()) return;

    this.toConfirm.emit({
      pickup: this.pickupLabel,
      dropoff: this.dropoffLabel,
      vehicle: this.selectedVehicle,
      passengers: this.passengers,
      baggage: this.baggage,
      ac: this.ac,
      when: this.timeOption === 'now' ? 'now' : `${this.scheduledDate} ${this.scheduledTime}`,
    });
    this.toClose.emit();
  }
}
