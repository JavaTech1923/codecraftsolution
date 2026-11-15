import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { TechnologyApiService } from '../../core/services/content-api.service';
@Component({ selector: 'app-technology-marquee', standalone: true, imports: [AsyncPipe], template: `<section class="tech-band"><div class="tech-label">OUR TECHNOLOGY ECOSYSTEM</div>@if (technologies$ | async; as technologies) {<div class="marquee-window"><div class="marquee-track">@for (tech of technologies; track tech.id) {<span class="tech-item"><span class="tech-glyph">✳</span>{{tech.name}}</span>} @for (tech of technologies; track 'dup-'+tech.id) {<span class="tech-item" aria-hidden="true"><span class="tech-glyph">✳</span>{{tech.name}}</span>}</div></div>}</section>` })
export class TechnologyMarqueeComponent { readonly technologies$ = inject(TechnologyApiService).getTechnologies(); }
