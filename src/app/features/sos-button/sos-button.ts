import { Component, signal, inject } from '@angular/core';
import { SOSService } from '../ride/services/sos';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sos-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sos-button.html',
  styleUrls: ['./sos-button.scss'],
})
export class SOSButton {
  private readonly sosService = inject(SOSService);

  isSending = signal(false);
  success = signal(false);
  error = signal(false);

  async sendSOS(): Promise<void> {
    if (this.isSending()) return;

    this.isSending.set(true);
    this.success.set(false);
    this.error.set(false);

    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    const payload = {
      userId: 'local-user',
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await this.sosService.sendAlert(payload);
      if (res.offline) {
        this.showToast('📴 Mode hors ligne : alerte enregistrée localement.');
      } else {
        this.success.set(true);
        this.showToast('✅ Alerte envoyée avec succès !');
      }
    } catch (err) {
      console.error('Erreur SOS:', err);
      this.error.set(true);
      this.showToast('❌ Échec de l’envoi (réessai automatique).');
    } finally {
      this.isSending.set(false);
      setTimeout(() => {
        this.success.set(false);
        this.error.set(false);
      }, 3000);
    }
  }

  private showToast(message: string): void {
    const div = document.createElement('div');
    div.textContent = message;
    div.className =
      'fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded shadow-lg z-[9999]';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }
}
