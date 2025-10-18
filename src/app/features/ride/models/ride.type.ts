export interface Ride {
  id?: string; // généré par le backend
  pickup: string | null;
  dropoff: string | null;
  vehicle: string | null;
  passengers: number;
  baggage: boolean;
  ac: boolean;
  when: string; // date ou 'now'
  distance?: number | null;
  price?: number;
  isPaid?: boolean;
}
