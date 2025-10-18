import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RideHistoryPage } from './ride-history-page';
import { RideSearchStore } from '../store/ride-search.store';
import { ActivatedRoute, Router } from '@angular/router';

describe('RideHistoryPage', () => {
  let component: RideHistoryPage;
  let fixture: ComponentFixture<RideHistoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideHistoryPage],
      providers: [
        {
          provide: RideSearchStore,
          useValue: {
            pickup: () => null,
            dropoff: () => null,
            distance: () => 0,
            duration: () => 0,
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({}),
            serializeUrl: jasmine.createSpy('serializeUrl').and.returnValue('/stub-url'),
            events: of(), // <-- Important ! simule un Observable vide
          },
        },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RideHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
