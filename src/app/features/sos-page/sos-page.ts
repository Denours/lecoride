// src/app/features/ride/pages/sos-page.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SOSService } from '../ride/services/sos';
import { SosAlert } from '../ride/models/sos-alert.type';
import { Logo } from '../logo/logo';
import { SOSButton } from '../sos-button/sos-button';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-sos-page',
  standalone: true,
  imports: [CommonModule, Logo, RouterLink, SOSButton],
  template: `
    <app-logo />
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Historique des alertes SOS</h1>
      <button
        routerLink="/ride/search"
        class="hover:text-blue-800 transition text-slate-800 text-start border border-green-400 bg-green-200 rounded-lg w-60 p-1 mb-2"
      >
        ← Retour à l'espace réservation
      </button>
      <p class="text-gray-600 mb-6">
        Voici la liste de vos alertes envoyées (même hors connexion).
      </p>

      <ul>
        @for (a of alerts(); track a.id) {
        <li class="border rounded-xl p-3 mb-2 bg-gray-50">
          <p><strong>📅</strong> {{ a.timestamp | date : 'short' }}</p>
          <!-- <p><strong>📍</strong> {{ a.location ?? 'Non renseignée' }}</p> -->
          <p><strong>État :</strong> {{ a.status }}</p>
        </li>
        } @empty {
        <p class="text-gray-400">Aucune alerte enregistrée.</p>
        }
      </ul>

      <h2 class="text-xl font-semibold mt-6 mb-2">Conseils de sécurité</h2>
      <ul class="list-disc ml-6 text-gray-700">
        <li>Restez calme et cherchez un lieu sûr.</li>
        <li>Prévenez vos proches si possible.</li>
        <li>Utilisez le bouton SOS uniquement en cas d’urgence.</li>
      </ul>
    </div>
    <app-sos-button />
  `,
})
export class SOSPage implements OnInit {
  private readonly sosService = inject(SOSService);
  alerts = signal<SosAlert[]>([]);

  ngOnInit(): void {
    // Ne retourne pas Promise directement — on déclenche la charge asynchrone
    void this.loadAlerts();
  }

  private async loadAlerts(): Promise<void> {
    const list = await this.sosService.getAllAlerts();
    this.alerts.set(list);
  }
}
