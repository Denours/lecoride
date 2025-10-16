export interface Ride {
  id?: string; // généré par le backend
  pickup: string;
  dropoff: string;
  vehicle: string;
  passengers: number;
  baggage: boolean;
  ac: boolean;
  when: string; // date ou 'now'
  distance?: number;
  price?: number;
  isPaid: boolean;
}
