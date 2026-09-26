import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from './app';

describe('arranque de la aplicación', () => {
  it('muestra el login como primera pantalla', async () => {
    localStorage.clear();
    document.head.innerHTML = '<base href="/">';
    document.body.innerHTML = '<app-root></app-root>';

    const appRef = await bootstrapApplication(AppComponent, appConfig);
    await appRef.whenStable();

    expect(location.pathname).toBe('/login');
    expect(document.querySelector('app-login form')).toBeTruthy();

    appRef.destroy();
  });
});
