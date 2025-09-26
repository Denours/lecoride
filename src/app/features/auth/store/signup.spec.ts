import { TestBed } from '@angular/core/testing';

import { SignupStore } from './signup.store';

describe('Signup', () => {
  let service: SignupStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignupStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
