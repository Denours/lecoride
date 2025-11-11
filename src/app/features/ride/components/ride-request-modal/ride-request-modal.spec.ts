import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RideRequestModal } from './ride-request-modal';
import { VehicleOptions } from '../../models/vehicle-options.type';

describe('RideRequestModal', () => {
  let component: RideRequestModal;
  let fixture: ComponentFixture<RideRequestModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideRequestModal, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(RideRequestModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select a vehicle', () => {
    const option: VehicleOptions = { type: 'moto', label: 'Moto', icon: '🏍️', price: 500 };
    component.selectVehicle(option);
    expect(component.selectedVehicle).toBe('moto');
  });

  describe('canConfirm', () => {
    it('should return false if no pickup', () => {
      component.pickupLabel = null;
      component.dropoffLabel = 'Arrivée';
      component.selectedVehicle = 'moto';
      component.timeOption = 'now';
      expect(component.canConfirm()).toBeFalse();
    });

    it('should return false if no dropoff', () => {
      component.pickupLabel = 'Départ';
      component.dropoffLabel = null;
      component.selectedVehicle = 'moto';
      component.timeOption = 'now';
      expect(component.canConfirm()).toBeFalse();
    });

    it('should return false if no vehicle selected', () => {
      component.pickupLabel = 'Départ';
      component.dropoffLabel = 'Arrivée';
      component.selectedVehicle = null;
      component.timeOption = 'now';
      expect(component.canConfirm()).toBeFalse();
    });

    it('should return true for now option when all required fields set', () => {
      component.pickupLabel = 'Départ';
      component.dropoffLabel = 'Arrivée';
      component.selectedVehicle = 'moto';
      component.timeOption = 'now';
      expect(component.canConfirm()).toBeTrue();
    });

    it('should return false for schedule option if date/time missing', () => {
      component.pickupLabel = 'Départ';
      component.dropoffLabel = 'Arrivée';
      component.selectedVehicle = 'moto';
      component.timeOption = 'schedule';
      component.scheduledDate = null;
      component.scheduledTime = null;
      expect(component.canConfirm()).toBeFalse();
    });

    it('should return true for schedule option when date/time set', () => {
      component.pickupLabel = 'Départ';
      component.dropoffLabel = 'Arrivée';
      component.selectedVehicle = 'moto';
      component.timeOption = 'schedule';
      component.scheduledDate = '2025-11-04';
      component.scheduledTime = '12:00';
      expect(component.canConfirm()).toBeTrue();
    });
  });

  describe('confirmRide', () => {
    it('should not emit if canConfirm is false', () => {
      spyOn(component.toConfirm, 'emit');
      spyOn(component.toClose, 'emit');

      component.pickupLabel = null;
      component.confirmRide();

      expect(component.toConfirm.emit).not.toHaveBeenCalled();
      expect(component.toClose.emit).not.toHaveBeenCalled();
    });

    it('should emit ride and close when canConfirm is true (now)', () => {
      spyOn(component.toConfirm, 'emit');
      spyOn(component.toClose, 'emit');

      component.pickupLabel = 'Départ';
      component.dropoffLabel = 'Arrivée';
      component.selectedVehicle = 'moto';
      component.passengers = 2;
      component.baggage = true;
      component.ac = false;
      component.timeOption = 'now';

      component.confirmRide();

      expect(component.toConfirm.emit).toHaveBeenCalledWith({
        pickup: 'Départ',
        dropoff: 'Arrivée',
        vehicle: 'moto',
        passengers: 2,
        baggage: true,
        ac: false,
        when: 'now',
      });
      expect(component.toClose.emit).toHaveBeenCalled();
    });

    it('should emit ride and close when canConfirm is true (schedule)', () => {
      spyOn(component.toConfirm, 'emit');
      spyOn(component.toClose, 'emit');

      component.pickupLabel = 'Départ';
      component.dropoffLabel = 'Arrivée';
      component.selectedVehicle = 'moto';
      component.passengers = 1;
      component.baggage = false;
      component.ac = true;
      component.timeOption = 'schedule';
      component.scheduledDate = '2025-11-04';
      component.scheduledTime = '15:30';

      component.confirmRide();

      expect(component.toConfirm.emit).toHaveBeenCalledWith({
        pickup: 'Départ',
        dropoff: 'Arrivée',
        vehicle: 'moto',
        passengers: 1,
        baggage: false,
        ac: true,
        when: '2025-11-04 15:30',
      });
      expect(component.toClose.emit).toHaveBeenCalled();
    });
  });
});
