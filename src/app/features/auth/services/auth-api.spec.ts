import { TestBed } from '@angular/core/testing';
import { AuthApi } from './auth-api';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { User } from '../models/user.type';

describe('AuthApi', () => {
  let service: AuthApi;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthApi, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthApi);
    http = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('verifyOtp should call HttpClient.post and return token', (done) => {
    const spy = spyOn(http, 'post').and.returnValue(of({ token: '123' }));

    service.verifyOtp('+237600000000', '123456').subscribe((res) => {
      expect(res.token).toBe('123');
      expect(spy).toHaveBeenCalledWith('/auth/signup/phone/verify-otp', {
        phone: '+237600000000',
        otp: '123456',
      });
      done();
    });
  });

  it('signupEmail should return ok', (done) => {
    service.signupEmail({ email: 'test@test.com', password: '123456' }).subscribe((res) => {
      expect(res.ok).toBeTrue();
      done();
    });
  });

  it('confirmEmail should call HttpClient.get and return token', (done) => {
    const spy = spyOn(http, 'get').and.returnValue(of({ token: 'abc' }));
    service.confirmEmail('abc123').subscribe((res) => {
      expect(res.token).toBe('abc');
      expect(spy).toHaveBeenCalledWith('/auth/signup/email/confirm?token=abc123');
      done();
    });
  });

  it('me should call HttpClient.get and return user', (done) => {
    const mockUser: User = {
      email: 'a@b.com',
      cgu: true,
      confirm: 'true',
      firstName: 'Test',
      lastName: 'User',
      marketing: false, // ajouté
      password: '123456', // ajouté
    };

    const spy = spyOn(http, 'get').and.returnValue(of(mockUser));

    service.me().subscribe((res) => {
      expect(res).toEqual(mockUser);
      expect(spy).toHaveBeenCalledWith('/me');
      done();
    });
  });
});
