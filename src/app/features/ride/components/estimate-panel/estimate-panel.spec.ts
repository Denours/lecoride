import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstimatePanel } from './estimate-panel';
import { RideSearchStore, RidePoint } from '../../store/ride-search.store';

describe('EstimatePanel', () => {
  let component: EstimatePanel;
  let fixture: ComponentFixture<EstimatePanel>;
  let storeMock: jasmine.SpyObj<RideSearchStore>;

  beforeEach(async () => {
    storeMock = jasmine.createSpyObj('RideSearchStore', ['pickup', 'dropoff', 'setEstimate']);

    await TestBed.configureTestingModule({
      imports: [EstimatePanel],
      providers: [{ provide: RideSearchStore, useValue: storeMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(EstimatePanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set distance and price to 0 if pickup or dropoff is null', () => {
    storeMock.pickup.and.returnValue(null);
    storeMock.dropoff.and.returnValue(null);

    component['calculateEstimate']();

    expect(component.distanceKm()).toBe(0);
    expect(component.estimatedPrice()).toBe(0);
  });

  it('should calculate distance and price correctly', () => {
    const pickup: RidePoint = { lat: 0, lng: 0, label: 'Start' };
    const dropoff: RidePoint = { lat: 0, lng: 1, label: 'End' };

    storeMock.pickup.and.returnValue(pickup);
    storeMock.dropoff.and.returnValue(dropoff);

    spyOn(component.distanceChange, 'emit');
    spyOn(component.priceChange, 'emit');

    // Force la mise à jour des signaux
    component['pickup'].set(pickup);
    component['dropoff'].set(dropoff);

    component['calculateEstimate']();

    const distance = component.distanceKm();
    const price = component.estimatedPrice();

    expect(distance).toBeGreaterThan(0);

    const expectedPrice = Math.round(distance * 50 + 500);
    expect(price).toBe(expectedPrice);

    expect(component.distanceChange.emit).toHaveBeenCalledWith(distance);
    expect(component.priceChange.emit).toHaveBeenCalledWith(price);

    expect(storeMock.setEstimate).toHaveBeenCalledWith(distance, price);
  });

  it('getDistanceFromLatLonInKm should return correct Haversine distance', () => {
    const d = component['getDistanceFromLatLonInKm'](0, 0, 0, 1);
    expect(d).toBeCloseTo(111.19, 1); // distance approximative entre 0,0 et 0,1
  });

  it('deg2rad should convert degrees to radians', () => {
    const degrees = 180;
    const radians = component['deg2rad'](degrees);
    expect(radians).toBeCloseTo(Math.PI, 10); // 180° = π radians
  });
});
