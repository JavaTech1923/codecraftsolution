import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../models/content.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly stored = signal<LoginResponse | null>(this.readSession());
  readonly user = computed(() => this.stored()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.stored()?.accessToken);
  readonly isSuperAdmin = computed(() => this.user()?.roles.includes('SUPER_ADMIN') ?? false);
  readonly canManageLeads = computed(() => {
    const roles = this.user()?.roles ?? [];
    return roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
  });

  canEditContent(key: string): boolean {
    const user = this.user();
    return !!user && (
      user.roles.includes('ADMIN')
      || user.roles.includes('SUPER_ADMIN')
      || (user.contentPermissions ?? []).includes(key)
    );
  }

  login(email: string, password: string) { return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password }).pipe(tap(session => { sessionStorage.setItem('aether_session', JSON.stringify(session)); this.stored.set(session); })); }
  logout(): void { sessionStorage.removeItem('aether_session'); this.stored.set(null); }
  token(): string | null { return this.stored()?.accessToken ?? null; }
  private readSession(): LoginResponse | null { try { return JSON.parse(sessionStorage.getItem('aether_session') ?? 'null') as LoginResponse | null; } catch { return null; } }
}
