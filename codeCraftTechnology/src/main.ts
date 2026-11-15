import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { appRoutes } from './app/app.routes';
import { authInterceptor } from './app/core/services/auth.interceptor';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, { providers: [provideAnimationsAsync(), provideHttpClient(withInterceptors([authInterceptor])), provideRouter(appRoutes), providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } })] }).catch(error => console.error(error));
