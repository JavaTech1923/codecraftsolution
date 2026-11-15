import { AsyncPipe } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService } from '../../core/services/content-api.service';
@Component({ selector: 'app-navbar', standalone: true, imports: [RouterLink, AsyncPipe], template: `
<header class="site-nav" [class.scrolled]="scrolled()"><a class="brand" routerLink="/" aria-label="Company home"><span class="brand-mark">✳</span>@if (settings$ | async; as settings) {<span>{{settings.brandName}}<span class="brand-light">{{settings.brandSuffix}}</span></span>}</a><button class="menu-toggle" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen()" aria-label="Toggle navigation"><i class="pi" [class.pi-bars]="!menuOpen()" [class.pi-times]="menuOpen()"></i></button>@if (settings$ | async; as settings) {<nav [class.open]="menuOpen()">@for (item of settings.navigation; track item.label) { <a [href]="item.href" (click)="closeMenu()">{{item.label}}</a> }</nav>}<a class="nav-cta" href="#contact">Let's talk <span>↗</span></a></header>
` })
export class NavbarComponent { readonly settings$ = inject(ContentApiService).settings(); readonly menuOpen = signal(false); readonly scrolled = signal(false); @HostListener('window:scroll') onScroll(): void { this.scrolled.set(window.scrollY > 24); } toggleMenu(): void { this.menuOpen.set(!this.menuOpen()); } closeMenu(): void { this.menuOpen.set(false); } }
