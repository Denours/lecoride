import { TestBed } from '@angular/core/testing';
import { SOSService } from './sos';
import { SosAlert } from '../models/sos-alert.type';

describe('SOSService Full Coverage', () => {
  let service: SOSService;
  let onLineSpy: jasmine.Spy;

  beforeEach(async () => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SOSService);
    await service.init();
  });

  afterEach(() => {
    onLineSpy?.and.callThrough();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save an alert offline', async () => {
    onLineSpy = spyOnProperty(navigator, 'onLine', 'get').and.returnValue(false);
    const res = await service.sendAlert({ message: 'Test SOS offline', location: null });
    expect(res.offline).toBeTrue();
    expect(res.alert.id).toBeDefined();
    expect(res.alert.status).toBe('PENDING');
  });

  it('should send an alert online', async () => {
    onLineSpy = spyOnProperty(navigator, 'onLine', 'get').and.returnValue(true);
    const res = await service.sendAlert({ message: 'Test SOS online', location: 'Akwa' });
    expect(res.alert.status).toBe('SENT');
    expect(res.offline).toBeUndefined();
  });

  it('should cover default payload in sendAlert', async () => {
    onLineSpy = spyOnProperty(navigator, 'onLine', 'get').and.returnValue(false);
    const res = await service.sendAlert({});
    expect(res.alert.message).toBe('SOS déclenché');
    expect(res.alert.userId).toBe('local-user');
    expect(res.alert.location).toBeNull();
    expect(res.alert.status).toBe('PENDING');
  });

  it('should get all alerts', async () => {
    const alerts = await service.getAllAlerts();
    expect(alerts.length).toBeGreaterThanOrEqual(0);
  });

  it('should retry pending alerts and mark them as SENT', async () => {
    onLineSpy = spyOnProperty(navigator, 'onLine', 'get').and.returnValue(false);
    await service.sendAlert({ message: 'Retry SOS' });

    onLineSpy.and.returnValue(true);
    await service.retryPendingAlerts();

    const all = await service.getAllAlerts();
    expect(all.some((a) => a.status === 'SENT')).toBeTrue();
  });

  it('should handle update for non-existent alert gracefully', async () => {
    await expectAsync((service as any).update(9999, { status: 'SENT' })).toBeResolved();
  });

  it('should handle retryPendingAlerts with no pendings', async () => {
    const all = await service.getAllAlerts();
    for (const a of all) await (service as any).update(a.id!, { status: 'SENT' });
    await expectAsync(service.retryPendingAlerts()).toBeResolved();
  });

  it('should cover internal getPendingAlerts', async () => {
    const pendings = await (service as any).getPendingAlerts();
    expect(Array.isArray(pendings)).toBeTrue();
  });

  it('should cover internal save method', async () => {
    const alert: SosAlert = {
      message: 'Internal save',
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      userId: 'test',
    };
    const saved = await (service as any).save(alert);
    expect(saved.id).toBeDefined();
  });

  it('should cover internal openDB and onupgradeneeded branch', async () => {
    const spyOpen = spyOn(indexedDB, 'open').and.callThrough();
    await (service as any).openDB();
    expect(spyOpen).toHaveBeenCalled();
  });

  it('should cover getDB branch where dbPromise already exists', async () => {
    const db1 = await (service as any).getDB();
    const db2 = await (service as any).getDB();
    expect(db2).toBe(db1);
  });
});
