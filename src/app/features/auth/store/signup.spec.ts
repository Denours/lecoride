import { TestBed } from '@angular/core/testing';
import { SignupStore } from './signup.store';

describe('SignupStore', () => {
  let store: SignupStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(SignupStore);

    // Nettoyage pour tests indépendants
    store.clearOtpAttempts();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('setStep should update step', () => {
    store.setStep('phone');
    expect(store.getState().step).toBe('phone');
  });

  it('setPhone should update phone', () => {
    store.setPhone('+237600000000');
    expect(store.getState().phone).toBe('+237600000000');
  });

  it('startLoading should set loading true and clear error', () => {
    store.setError('error');
    store.startLoading();
    const state = store.getState();
    expect(state.loading).toBeTrue();
    expect(state.error).toBeUndefined();
  });

  it('stopLoading should set loading false', () => {
    store.startLoading();
    store.stopLoading();
    expect(store.getState().loading).toBeFalse();
  });

  it('setError should update error', () => {
    store.setError('Test error');
    expect(store.getState().error).toBe('Test error');
  });

  it('incOtpAttempt should increment attempts and block after 3', () => {
    store.clearOtpAttempts();
    store.incOtpAttempt();
    store.incOtpAttempt();
    expect(store.getState().otpAttempts).toBe(2);
    expect(store.getState().lockUntil).toBeNull();

    store.incOtpAttempt();
    const state = store.getState();
    expect(state.otpAttempts).toBe(3);
    expect(state.lockUntil).toBeGreaterThan(Date.now());
  });

  it('clearOtpAttempts should reset attempts and lockUntil', () => {
    store.incOtpAttempt();
    store.clearOtpAttempts();
    const state = store.getState();
    expect(state.otpAttempts).toBe(0);
    expect(state.lockUntil).toBeNull();
  });

  it('requestOtp should return success for +237', (done) => {
    store.requestOtp('+237600000000').subscribe(res => {
      expect(res.success).toBeTrue();
      expect(res.message).toContain('succès');
      done();
    });
  });

  it('requestOtp should return failure for other numbers', (done) => {
    store.requestOtp('+123456').subscribe(res => {
      expect(res.success).toBeFalse();
      expect(res.message).toContain('Numéro invalide');
      done();
    });
  });

  it('getState should return current state', () => {
    store.setStep('email');
    expect(store.getState().step).toBe('email');
  });

  it('setEmail and email getter should work', () => {
    store.setEmail('test@test.com');
    expect(store.email).toBe('test@test.com');
  });
});
