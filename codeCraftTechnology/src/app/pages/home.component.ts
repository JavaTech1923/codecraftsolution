import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../core/services/seo.service';
import { ContentApiService } from '../core/services/content-api.service';
import { take } from 'rxjs';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { HeroComponent } from '../components/hero/hero.component';
import { TechnologyMarqueeComponent } from '../components/technology-marquee/technology-marquee.component';
import { ServicesComponent } from '../components/services/services.component';
import { CapabilitySectionComponent } from '../components/capability-section/capability-section.component';
import { ProcessTimelineComponent } from '../components/process-timeline/process-timeline.component';
import { CaseStudiesComponent } from '../components/case-studies/case-studies.component';
import { IndustriesComponent } from '../components/industries/industries.component';
import { TeamExpertiseComponent } from '../components/team-expertise/team-expertise.component';
import { TestimonialsComponent } from '../components/testimonials/testimonials.component';
import { ContactComponent } from '../components/contact/contact.component';
import { FooterComponent } from '../components/footer/footer.component';
@Component({ selector: 'app-home', standalone: true, imports: [NavbarComponent,HeroComponent,TechnologyMarqueeComponent,ServicesComponent,CapabilitySectionComponent,ProcessTimelineComponent,CaseStudiesComponent,IndustriesComponent,TeamExpertiseComponent,TestimonialsComponent,ContactComponent,FooterComponent], template: `<app-navbar/><main><app-hero/><app-technology-marquee/><app-services/><app-capability-section/><app-case-studies/><app-industries/><app-process-timeline/><app-team-expertise/><app-testimonials/><app-contact/></main><app-footer/>` })
export class HomeComponent implements OnInit, AfterViewInit {
 private readonly seo = inject(SeoService); private readonly content = inject(ContentApiService);
 ngOnInit(): void { this.content.settings().pipe(take(1)).subscribe(settings => { const url = globalThis.location?.origin ?? ''; const brand = `${settings.brandName}${settings.brandSuffix}`.trim(); const title = `${brand} — Engineering without limits`; this.seo.setPage(title, settings.tagline, url); this.seo.addOrganizationSchema(brand, url, settings.tagline); }); }
 ngAfterViewInit(): void { if (typeof IntersectionObserver === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.12 }); document.querySelectorAll('app-services,app-capability-section,app-case-studies,app-industries,app-process-timeline,app-team-expertise,app-testimonials,app-contact').forEach(section => { section.classList.add('reveal-on-scroll'); observer.observe(section); }); }
}
