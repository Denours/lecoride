import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { ToastService, ToastMessage } from './features/auth/services/toast';
import { of } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let component: App;
  let toastServiceMock: Partial<ToastService>;

  beforeEach(async () => {
    // Mock du service ToastService
    toastServiceMock = {
      messages$: of(), // aucun message initial
    };

    await TestBed.configureTestingModule({
      imports: [App, CommonModule, RouterOutlet],
      providers: [{ provide: ToastService, useValue: toastServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render router-outlet', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should display toast messages when ToastService emits', () => {
    // Ajouter un message manuellement pour tester l'affichage
    const testMsg: ToastMessage = { text: 'Test toast', duration: 1000 };
    component.toasts.push(testMsg);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const toastEl = compiled.querySelector('.toast');
    expect(toastEl).toBeTruthy();
    expect(toastEl?.textContent).toContain('Test toast');
  });
});
