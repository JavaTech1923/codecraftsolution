import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CapabilityResponse, CaseStudyResponse, ContactRequest, ContactResponse, HeroResponse, IndustryResponse, ProcessStepResponse, ServiceResponse, TeamMemberProfileResponse, TechnologyResponse, TestimonialResponse } from '../models/content.models';
import { SiteSettingsResponse } from '../models/site-settings.model';

@Injectable({ providedIn: 'root' })
export class ContentApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;
  private readonly siteSettings$ = this.http.get<SiteSettingsResponse>(`${this.base}/site-settings`).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  hero(): Observable<HeroResponse> { return this.http.get<HeroResponse>(`${this.base}/hero`); }
  services(): Observable<ServiceResponse[]> { return this.http.get<ServiceResponse[]>(`${this.base}/services`); }
  technologies(): Observable<TechnologyResponse[]> { return this.http.get<TechnologyResponse[]>(`${this.base}/technologies`); }
  caseStudies(): Observable<CaseStudyResponse[]> { return this.http.get<CaseStudyResponse[]>(`${this.base}/case-studies`); }
  industries(): Observable<IndustryResponse[]> { return this.http.get<IndustryResponse[]>(`${this.base}/industries`); }
  testimonials(): Observable<TestimonialResponse[]> { return this.http.get<TestimonialResponse[]>(`${this.base}/testimonials`); }
  capabilities(): Observable<CapabilityResponse[]> { return this.http.get<CapabilityResponse[]>(`${this.base}/capabilities`); }
  team(): Observable<TeamMemberProfileResponse[]> { return this.http.get<TeamMemberProfileResponse[]>(`${this.base}/team`); }
  settings(): Observable<SiteSettingsResponse> { return this.siteSettings$; }
  process(): Observable<ProcessStepResponse[]> { return this.http.get<ProcessStepResponse[]>(`${this.base}/process`); }
  submitContact(payload: ContactRequest): Observable<ContactResponse> { return this.http.post<ContactResponse>(`${this.base}/contact`, payload); }
}

// Resource-specific injectable API facades keep component dependencies explicit.
@Injectable({ providedIn: 'root' }) export class HeroApiService { private readonly api = inject(ContentApiService); getHero() { return this.api.hero(); } }
@Injectable({ providedIn: 'root' }) export class ServiceApiService { private readonly api = inject(ContentApiService); getServices() { return this.api.services(); } getCapabilities() { return this.api.capabilities(); } }
@Injectable({ providedIn: 'root' }) export class TechnologyApiService { private readonly api = inject(ContentApiService); getTechnologies() { return this.api.technologies(); } }
@Injectable({ providedIn: 'root' }) export class CaseStudyApiService { private readonly api = inject(ContentApiService); getCaseStudies() { return this.api.caseStudies(); } }
@Injectable({ providedIn: 'root' }) export class ContactApiService { private readonly api = inject(ContentApiService); submit(payload: ContactRequest) { return this.api.submitContact(payload); } }
