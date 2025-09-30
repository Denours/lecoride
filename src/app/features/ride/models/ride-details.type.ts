export interface RideDetails {
  pickup: string | null;
  dropoff: string | null;
  vehicle: string | null;
  passengers: number;
  baggage: boolean;
  ac: boolean;
  when: string;
}
