export interface PaymentMetaData {
  id: string; // identifiant unique du paiement
  userId: string; // identifiant de l'utilisateur ayant effectué le paiement
  tripId: string; // identifiant du trajet réservé

  amount: number; // montant total du paiement
  currency: string; // ex: 'XAF', 'USD', 'EUR'

  method: 'MOMO' | 'OM' | 'CARD' | 'PAYPAL'; // méthode de paiement (MTN, Orange, Carte, etc.)
  status: 'PENDING' | 'SUCCESS' | 'FAILED'; // statut du paiement

  transactionRef: string; // référence unique du paiement
  timestamp: string; // date ISO du paiement, ex: '2025-10-10T10:15:00Z'

  // ✅ Métadonnées supplémentaires pour simulation ou suivi
  description?: string; // ex: 'Paiement de la réservation du trajet Douala - Yaoundé'
  phoneNumber?: string; // numéro de téléphone utilisé pour le paiement (utile pour MOMO/OM)
  cardLast4?: string; // 4 derniers chiffres de la carte, s'il y a lieu
  isRefunded?: boolean; // indicateur de remboursement
  refundDate?: string; // date du remboursement si applicable
}
