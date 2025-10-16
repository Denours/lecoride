import { RideService } from './ride';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Ride } from '../models/ride.type';

describe('RideService', () => {
  let service: RideService;
  let httpMock: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpMock = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    service = new RideService(httpMock);
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('devrait récupérer tous les trajets', () => {
    const mockRides: Ride[] = [
      {
        id: '1',
        pickup: 'Biyem-Assi',
        dropoff: 'Mokolo',
        vehicle: 'moto',
        passengers: 1,
        baggage: false,
        ac: false,
        price: 1500, // <-- ici
        when: 'now',
        isPaid: false,
      },
      {
        id: '2',
        pickup: 'Bonamoussadi',
        dropoff: 'Akwa',
        vehicle: 'eco',
        passengers: 2,
        baggage: true,
        ac: true,
        price: 2500, // <-- ici
        when: '2025-10-16 12:00',
        isPaid: true,
      },
    ];

    httpMock.get.and.returnValue(of(mockRides));

    service.getAll().subscribe((rides) => {
      expect(rides.length).toBe(2);
      expect(rides).toEqual(mockRides);
    });

    expect(httpMock.get).toHaveBeenCalledWith('http://localhost:3000/rides');
  });

  it('devrait récupérer un trajet par ID', () => {
    const mockRide: Ride = {
      id: '1',
      pickup: 'A',
      dropoff: 'B',
      vehicle: 'moto',
      passengers: 1,
      baggage: false,
      ac: false,
      price: 1000,
      when: 'now',
      isPaid: false,
    };

    httpMock.get.and.returnValue(of(mockRide));

    service.getById('1').subscribe((ride) => {
      expect(ride).toEqual(mockRide);
    });

    expect(httpMock.get).toHaveBeenCalledWith('http://localhost:3000/rides/1');
  });

  it('devrait créer un trajet', () => {
    const newRide: Ride = {
      id: '3',
      pickup: 'C',
      dropoff: 'D',
      vehicle: 'tricycle',
      passengers: 1,
      baggage: false,
      ac: false,
      price: 2000,
      when: 'now',
      isPaid: false,
    };

    httpMock.post.and.returnValue(of(newRide));

    service.create(newRide).subscribe((ride) => {
      expect(ride).toEqual(newRide);
    });

    expect(httpMock.post).toHaveBeenCalledWith('http://localhost:3000/rides', newRide);
  });

  it('devrait mettre à jour un trajet', () => {
    const id = '1';
    const updateData = { price: 1800 };

    httpMock.patch.and.returnValue(of({ ...updateData, id }));

    service.update(id, updateData).subscribe((ride) => {
      expect(ride.price).toBe(1800);
    });

    expect(httpMock.patch).toHaveBeenCalledWith(`http://localhost:3000/rides/${id}`, updateData);
  });

  it('devrait supprimer un trajet', () => {
    const id = '2';

    httpMock.delete.and.returnValue(of(void 0));

    service.delete(id).subscribe((res) => {
      expect(res).toBeUndefined();
    });

    expect(httpMock.delete).toHaveBeenCalledWith(`http://localhost:3000/rides/${id}`);
  });
});
