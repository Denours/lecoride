import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddressForm } from './address-form';
import { RideSearchStore } from '../../store/ride-search.store';
import { GeoService } from '../../services/geo';
import { of } from 'rxjs';
import { AddressSuggestion } from '../../models/address-suggestion.type';

describe('AddressForm', () => {
  let component: AddressForm;
  let fixture: ComponentFixture<AddressForm>;
  let geoServiceMock: jasmine.SpyObj<GeoService>;
  let storeMock: jasmine.SpyObj<RideSearchStore>;

  beforeEach(async () => {
    geoServiceMock = jasmine.createSpyObj('GeoService', ['autocomplete']);
    storeMock = jasmine.createSpyObj('RideSearchStore', [
      'setPickup',
      'setDropoff',
      'pickup',
      'dropoff',
    ]);

    await TestBed.configureTestingModule({
      imports: [AddressForm],
      providers: [
        { provide: GeoService, useValue: geoServiceMock },
        { provide: RideSearchStore, useValue: storeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // -----------------------------
  // 🧩 Computed test (canSubmit)
  // -----------------------------
  it('should compute canSubmit correctly', () => {
    expect(component.canSubmit()).toBeFalse();
    (component as any).pickupValid.set(true);
    (component as any).dropoffValid.set(true);
    expect(component.canSubmit()).toBeTrue();
  });

  // -----------------------------
  // 🚗 searchPickup()
  // -----------------------------
  it('should clear pickup suggestions when input is empty', () => {
    component.addressForm.patchValue({ pickup: '' });
    component.searchPickup();
    expect(component.suggestionsPickup).toEqual([]);
  });

  it('should populate pickup suggestions and clear error', () => {
    const mockSuggestions: AddressSuggestion[] = [{ label: 'Test', lat: 1, lng: 2 }];
    geoServiceMock.autocomplete.and.returnValue(of(mockSuggestions));

    component.addressForm.patchValue({ pickup: 'Paris' });
    component.searchPickup();

    expect(component.suggestionsPickup).toEqual(mockSuggestions);
    expect(component.errorMessage).toBeNull();
  });

  it('should set error message when no pickup found', () => {
    geoServiceMock.autocomplete.and.returnValue(of([]));
    component.addressForm.patchValue({ pickup: 'Unknown' });
    component.searchPickup();

    expect(component.errorMessage).toBe('Aucun point de départ trouvé');
  });

  // -----------------------------
  // 🎯 searchDropoff()
  // -----------------------------
  it('should clear dropoff suggestions when input is empty', () => {
    component.addressForm.patchValue({ dropoff: '' });
    component.searchDropoff();
    expect(component.suggestionsDropoff).toEqual([]);
  });

  it('should populate dropoff suggestions and clear error', () => {
    const mockSuggestions: AddressSuggestion[] = [{ label: 'Test', lat: 3, lng: 4 }];
    geoServiceMock.autocomplete.and.returnValue(of(mockSuggestions));

    component.addressForm.patchValue({ dropoff: 'Lyon' });
    component.searchDropoff();

    expect(component.suggestionsDropoff).toEqual(mockSuggestions);
    expect(component.errorMessage).toBeNull();
  });

  it('should set error message when no dropoff found', () => {
    geoServiceMock.autocomplete.and.returnValue(of([]));
    component.addressForm.patchValue({ dropoff: 'Vide' });
    component.searchDropoff();

    expect(component.errorMessage).toBe('Aucune destination trouvée');
  });

  // -----------------------------
  // 📍 selectPickup()
  // -----------------------------
  it('should select pickup and mark as valid', () => {
    const suggestion = { label: 'Start', lat: 5, lng: 6 };
    component.selectPickup(suggestion);

    expect(component.suggestionsPickup).toEqual([]);
    expect(storeMock.setPickup).toHaveBeenCalledWith(suggestion);
    expect((component as any).pickupValid()).toBeTrue();
  });

  // -----------------------------
  // 🏁 selectDropoff()
  // -----------------------------
  it('should select dropoff and mark as valid', () => {
    const suggestion = { label: 'End', lat: 7, lng: 8 };
    component.selectDropoff(suggestion);

    expect(component.suggestionsDropoff).toEqual([]);
    expect(storeMock.setDropoff).toHaveBeenCalledWith(suggestion);
    expect((component as any).dropoffValid()).toBeTrue();
  });

  // -----------------------------
  // 🗺 useMyPosition()
  // -----------------------------
  it('should alert if geolocation not available', () => {
    spyOn(globalThis, 'alert');
    // simulate absence of geolocation
    const mockGeolocation: Geolocation = {
      getCurrentPosition: jasmine
        .createSpy()
        .and.callFake((_success, error) =>
          error({ message: 'Géolocalisation non disponible' } as GeolocationPositionError)
        ),
      watchPosition: jasmine.createSpy(),
      clearWatch: jasmine.createSpy(),
    };
    spyOnProperty(navigator, 'geolocation', 'get').and.returnValue(mockGeolocation);

    component.useMyPosition();

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Impossible d'obtenir la position. Vérifiez les permissions."
    );
  });

  it('should use geolocation successfully', () => {
    const mockPosition = { coords: { latitude: 10, longitude: 20 } };
    const mockGeolocation: Geolocation = {
      getCurrentPosition: jasmine
        .createSpy()
        .and.callFake((success) => success(mockPosition as any)),
      watchPosition: jasmine.createSpy(),
      clearWatch: jasmine.createSpy(),
    };

    spyOnProperty(navigator, 'geolocation', 'get').and.returnValue(mockGeolocation);

    component.useMyPosition();

    expect(storeMock.setPickup).toHaveBeenCalledWith({
      lat: 10,
      lng: 20,
      label: 'Position actuelle',
    });
    expect((component as any).pickupValid()).toBeTrue();
  });

  it('should handle geolocation error', () => {
    const mockGeolocation: Geolocation = {
      getCurrentPosition: jasmine
        .createSpy()
        .and.callFake((_success, error) =>
          error({ code: 1, message: 'Permission denied' } as GeolocationPositionError)
        ),
      watchPosition: jasmine.createSpy(),
      clearWatch: jasmine.createSpy(),
    };

    spyOnProperty(navigator, 'geolocation', 'get').and.returnValue(mockGeolocation);
    spyOn(globalThis, 'alert');

    component.useMyPosition();

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Impossible d'obtenir la position. Vérifiez les permissions."
    );
  });

  // -----------------------------
  // ✅ onSubmit()
  // -----------------------------
  it('should show error message if invalid', () => {
    spyOn(console, 'log');
    storeMock.pickup.and.returnValue(null);
    storeMock.dropoff.and.returnValue(null);

    component.onSubmit();
    expect(component.errorMessage).toBe('Veuillez choisir des adresses valides dans la liste');
  });

  it('should submit successfully when valid', () => {
    spyOn(console, 'log');
    storeMock.pickup.and.returnValue({ lat: 1, lng: 2, label: 'A' });
    storeMock.dropoff.and.returnValue({ lat: 3, lng: 4, label: 'B' });
    (component as any).pickupValid.set(true);
    (component as any).dropoffValid.set(true);

    component.onSubmit();

    expect(component.errorMessage).toBeNull();
    expect(console.log).toHaveBeenCalled();
  });

  // -----------------------------
  // 🔘 openRideRequestModal()
  // -----------------------------
  it('should emit requestRide event', () => {
    spyOn(component.requestRide, 'emit');
    component.openRideRequestModal();
    expect(component.requestRide.emit).toHaveBeenCalled();
  });
});
