export type SosStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface SosAlert {
  id?: number;           // clé autoIncrement
  userId?: string;
  message?: string;
  location?: string | null;
  timestamp: string;     // ISO
  status: SosStatus;
}