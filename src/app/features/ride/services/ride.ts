import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ride } from '../models/ride.type';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RideService {
  private readonly apiUrl = 'http://localhost:3000/rides'; // à adapter selon ton backend

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Ride[]> {
    return this.http.get<Ride[]>(this.apiUrl);
  }

  getById(id: string): Observable<Ride> {
    return this.http.get<Ride>(`${this.apiUrl}/${id}`);
  }

  create(ride: Ride): Observable<Ride> {
    return this.http.post<Ride>(this.apiUrl, ride);
  }

  update(id: string, ride: Partial<Ride>): Observable<Ride> {
    return this.http.patch<Ride>(`${this.apiUrl}/${id}`, ride);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
