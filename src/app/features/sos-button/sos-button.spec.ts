import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withRouterConfig } from '@angular/router';
import { SOSButton } from './sos-button';
import { SOSService } from '../ride/services/sos';

describe('SOSButton', () => {
  let component: SOSButton;
  let fixture: ComponentFixture<SOSButton>;
  let sosServiceSpy: jasmine.SpyObj<SOSService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('SOSService', ['sendAlert']);

    await TestBed.configureTestingModule({
      imports: [SOSButton],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([], withRouterConfig({ onSameUrlNavigation: 'reload' })),
        { provide: SOSService, useValue: spy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SOSButton);
    component = fixture.componentInstance;
    sosServiceSpy = TestBed.inject(SOSService) as jasmine.SpyObj<SOSService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not send if already sending', fakeAsync(async () => {
    component.isSending.set(true);
    await component.sendSOS();
    expect(sosServiceSpy.sendAlert).not.toHaveBeenCalled();
  }));

  it('should send SOS successfully', fakeAsync(async () => {
    // On passe un objet complet avec alert
    sosServiceSpy.sendAlert.and.resolveTo({
      offline: false,
      alert: { userId: 'local-user', timestamp: new Date().toISOString(), status: 'PENDING' },
    });

    // Vibrate retourne boolean, donc renvoyer true pour mock
    spyOn(navigator, 'vibrate').and.callFake(() => true);

    await component.sendSOS();
    expect(component.success()).toBeTrue();
    expect(component.error()).toBeFalse();
    expect(component.isSending()).toBeFalse();

    tick(3000);
    expect(component.success()).toBeFalse();
    expect(component.error()).toBeFalse();
  }));

  it('should handle offline SOS', fakeAsync(async () => {
    sosServiceSpy.sendAlert.and.resolveTo({
      offline: true,
      alert: { userId: 'local-user', timestamp: new Date().toISOString(), status: 'SENT' },
    });

    await component.sendSOS();
    expect(component.success()).toBeFalse();
    expect(component.error()).toBeFalse();
  }));

  it('should handle error during sendSOS', fakeAsync(async () => {
    sosServiceSpy.sendAlert.and.rejectWith(new Error('fail'));
    await component.sendSOS();
    expect(component.success()).toBeFalse();
    expect(component.error()).toBeTrue();

    tick(3000);
    expect(component.success()).toBeFalse();
    expect(component.error()).toBeFalse();
  }));
});
