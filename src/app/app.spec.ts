import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';
import { ToastService, ToastMessage } from './features/auth/services/toast';
import { Subject } from 'rxjs';
import { DestroyRef } from '@angular/core';

describe('App Component', () => {
  let component: App;
  let messages$: Subject<ToastMessage>;

  beforeEach(() => {
    messages$ = new Subject<ToastMessage>();

    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: ToastService, useValue: { messages$: messages$ } },
        { provide: DestroyRef, useValue: { onDestroy: () => {} } },
      ],
    });

    const fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('✅ devrait afficher et retirer un toast (durée personnalisée)', fakeAsync(() => {
    messages$.next({ text: 'Test Toast', duration: 1000 });
    expect(component.toasts.length).toBe(1); // this.toasts.push(msg)
    tick(1000); // exécute setTimeout → this.toasts.filter(...) couvert
    expect(component.toasts.length).toBe(0);
  }));

  it('✅ devrait utiliser la durée par défaut si aucune n’est précisée', fakeAsync(() => {
    messages$.next({ text: 'Sans durée' });
    expect(component.toasts.length).toBe(1); // this.toasts.push(msg)
    tick(3000); // exécute setTimeout avec msg.duration ?? 3000
    expect(component.toasts.length).toBe(0); // this.toasts.filter(...) couvert
  }));
});
