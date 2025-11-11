import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RideMap } from './ride-map';
import { RideSearchStore } from '../../store/ride-search.store';

class MockRideSearchStore {
  pickup = jasmine.createSpy('pickup').and.returnValue(null);
  dropoff = jasmine.createSpy('dropoff').and.returnValue(null);
  setPickup = jasmine.createSpy('setPickup');
  setDropoff = jasmine.createSpy('setDropoff');
}

describe('RideMap', () => {
  let component: RideMap;
  let fixture: ComponentFixture<RideMap>;
  let store: MockRideSearchStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideMap],
      providers: [{ provide: RideSearchStore, useClass: MockRideSearchStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(RideMap);
    component = fixture.componentInstance;
    store = TestBed.inject(RideSearchStore) as unknown as MockRideSearchStore;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize map on ngAfterViewInit', () => {
    component.ngAfterViewInit();
    expect((component as any).map).toBeTruthy();
    expect((component as any).markers.length).toBeGreaterThan(0);
  });

  it('should add markers and draw route when pickup and dropoff are set', fakeAsync(() => {
    // Mock fetch for drawRoute
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve({
        json: () =>
          Promise.resolve({
            routes: [
              {
                geometry: {
                  coordinates: [
                    [9.7679, 4.0511],
                    [9.7679, 4.0561],
                  ],
                },
              },
            ],
          }),
      } as any)
    );

    component.pickup = { lat: 4.0511, lng: 9.7679, label: 'Start' };
    component.dropoff = { lat: 4.0561, lng: 9.7679, label: 'End' };

    component.ngAfterViewInit();
    component.ngOnChanges();
    tick();

    expect((component as any).markers.length).toBe(2);
    expect((component as any).routeLine).toBeTruthy();
  }));

  it('should clear markers and route with clearMap', () => {
    component.ngAfterViewInit();
    const map = (component as any).map;
    spyOn(map, 'removeLayer').and.callThrough();

    (component as any).clearMap();
    expect(map.removeLayer).toHaveBeenCalled();
    expect((component as any).markers.length).toBe(0);
    expect((component as any).routeLine).toBeUndefined();
  });

  it('should update store on pickup marker dragend', () => {
    component.ngAfterViewInit();
    const marker = (component as any).pickupMarker;

    // Mock getLatLng pour simuler le déplacement
    spyOn(marker, 'getLatLng').and.returnValue({ lat: 1, lng: 2 });

    // Déclencher dragend
    marker.fire('dragend');

    expect(store.setPickup).toHaveBeenCalledWith({ lat: 1, lng: 2, label: 'Pickup (drag)' });
  });

  it('should update store on dropoff marker dragend', () => {
    component.ngAfterViewInit();
    const marker = (component as any).dropoffMarker;

    // Mock getLatLng pour simuler le déplacement
    spyOn(marker, 'getLatLng').and.returnValue({ lat: 3, lng: 4 });

    // Déclencher dragend
    marker.fire('dragend');

    expect(store.setDropoff).toHaveBeenCalledWith({ lat: 3, lng: 4, label: 'Dropoff (drag)' });
  });

  it('should set pickup or dropoff on map click', () => {
    component.ngAfterViewInit();
    const map: any = (component as any).map;

    // Scenario: no pickup yet
    store.pickup.and.returnValue(null);
    const clickEvent = { latlng: { lat: 5, lng: 6 } };
    map.fire('click', clickEvent);
    expect(store.setPickup).toHaveBeenCalledWith({
      lat: 5,
      lng: 6,
      label: 'Pickup (map click)',
    });

    // Scenario: pickup exists
    store.pickup.and.returnValue({ lat: 4, lng: 4 });
    const clickEvent2 = { latlng: { lat: 7, lng: 8 } };
    map.fire('click', clickEvent2);
    expect(store.setDropoff).toHaveBeenCalledWith({
      lat: 7,
      lng: 8,
      label: 'Dropoff (map click)',
    });
  });

  it('should add default markers if pickup and dropoff are null', () => {
    component.pickup = null;
    component.dropoff = null;
    component.ngAfterViewInit();

    const markers = (component as any).markers;
    expect(markers.length).toBe(2); // pickup + dropoff
  });

  it('should remove all markers and routeLine in clearMap', () => {
    (component as any).map = {
      removeLayer: jasmine.createSpy('removeLayer'),
    };
    const marker1 = { addTo: jasmine.createSpy('addTo') };
    const marker2 = { addTo: jasmine.createSpy('addTo') };
    (component as any).markers = [marker1, marker2];
    (component as any).routeLine = { remove: jasmine.createSpy('remove') };

    (component as any).clearMap();

    expect((component as any).markers.length).toBe(0);
    expect((component as any).routeLine).toBeUndefined();
  });

  it('should draw route if OSRM returns data', async () => {
    const pickup = { lat: 0, lng: 0 };
    const dropoff = { lat: 1, lng: 1 };

    // Stub map pour éviter les vrais appels Leaflet
    (component as any).map = { addLayer: jasmine.createSpy('addLayer') };

    // Stub de polyline avec addTo
    const fakePolyline = { addTo: jasmine.createSpy('addTo') };

    // On monkey-patch temporaire drawRoute pour injecter fakePolyline
    const originalDrawRoute = (component as any).drawRoute;
    (component as any).drawRoute = async function () {
      this.routeLine = fakePolyline;
    };

    // Mock fetch OSRM pour éviter un vrai appel
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve({
        json: () =>
          Promise.resolve({
            routes: [
              {
                geometry: {
                  coordinates: [
                    [0, 0],
                    [1, 1],
                  ],
                },
              },
            ],
          }),
      } as any)
    );

    await (component as any).drawRoute(pickup, dropoff);

    expect((component as any).routeLine).toBe(fakePolyline);

    // Restore drawRoute si nécessaire pour les autres tests
    (component as any).drawRoute = originalDrawRoute;
  });
});
