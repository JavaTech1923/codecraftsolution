import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
@Injectable({ providedIn: 'root' })
export class SeoService {
 private readonly title = inject(Title); private readonly meta = inject(Meta); private readonly document = inject(DOCUMENT);
 setPage(title: string, description: string, url: string): void { this.title.setTitle(title); this.meta.updateTag({name:'description',content:description}); this.meta.updateTag({property:'og:title',content:title}); this.meta.updateTag({property:'og:description',content:description}); this.meta.updateTag({property:'og:url',content:url}); this.meta.updateTag({name:'twitter:title',content:title}); this.meta.updateTag({name:'twitter:description',content:description}); this.meta.updateTag({name:'twitter:card',content:'summary_large_image'}); let canonical=this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]'); if(!canonical){canonical=this.document.createElement('link');canonical.rel='canonical';this.document.head.appendChild(canonical);} canonical.href=url; }
 addOrganizationSchema(name: string, url: string, description: string): void { const script=this.document.getElementById('organization-schema') ?? this.document.createElement('script'); script.id='organization-schema'; script.setAttribute('type','application/ld+json'); script.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Organization',name,url,description,knowsAbout:['Software engineering','Cloud architecture','DevOps','Quality engineering']}); this.document.head.appendChild(script); }
}
