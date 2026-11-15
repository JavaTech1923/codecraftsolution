import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map, shareReplay, tap } from 'rxjs';
import { TeamMemberProfileResponse } from '../../core/models/content.models';
import { ContentApiService } from '../../core/services/content-api.service';

@Component({
  selector: 'app-team-expertise',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <section class="section-wrap section-space team-section">
      <div class="section-heading">
        <div>
          <div class="eyebrow">MEET THE TEAM</div>
          <h2>Experienced people. <span class="gradient-text">Real expertise.</span></h2>
        </div>
        <p>Get to know the engineers and specialists behind the work.</p>
      </div>

      @if (team$ | async; as members) {
        @if (members.length) {
          @let member = members[active() % members.length];
          <div
            class="member-carousel"
            (mouseenter)="pauseForPointer()"
            (mouseleave)="resumeForPointer()"
            (focusin)="pauseForFocus()"
            (focusout)="resumeForFocus($event)"
          >
            <article class="member-card" aria-live="off">
              <div class="member-photo">
                <span class="photo-fallback" aria-hidden="true">{{ initials(member.name) }}</span>
                <img
                  [src]="member.photoUrl"
                  [alt]="'Sample portrait of ' + member.name"
                  (error)="hideBrokenPhoto($event)"
                  loading="lazy"
                >
              </div>
              <div class="member-details">
                <span class="eyebrow">SENIOR TEAM MEMBER · SAMPLE PROFILE</span>
                <h3>{{ member.name }}</h3>
                @if (member.role) {
                  <p class="member-role">{{ member.role }}</p>
                }
                <div class="member-facts">
                  <span><strong>{{ member.experienceYears }} years</strong> experience</span>
                  <span>Current company <strong>{{ member.currentCompany }}</strong></span>
                </div>
                <h4>Tech stack</h4>
                <ul class="tech-stack">
                  @for (technology of member.techStack; track technology) {
                    <li>{{ technology }}</li>
                  }
                </ul>
              </div>
            </article>

            <div class="carousel-footer">
              <div class="team-controls">
                <button type="button" (click)="previous()" aria-label="Previous team member">←</button>
                <span aria-live="polite">{{ active() % members.length + 1 }} / {{ members.length }}</span>
                <button type="button" (click)="next()" aria-label="Next team member">→</button>
              </div>
              <div class="carousel-progress" aria-hidden="true">
                <span [style.width.%]="(active() % members.length + 1) / members.length * 100"></span>
              </div>
            </div>
          </div>
          <p class="demo-notice">Demo profiles and portraits are placeholders. Replace them with your team’s approved details before publishing.</p>
        } @else {
          <p class="team-empty">Team profiles are being prepared.</p>
        }
      }
    </section>
  `,
  styles: [`
    .member-carousel { max-width: 900px; margin: 0 auto; }
    .member-card { display: grid; grid-template-columns: minmax(230px, .8fr) 1.2fr; overflow: hidden; border: 1px solid var(--line); border-radius: 12px; background: linear-gradient(135deg, #0d1528, #080d1a); }
    .member-photo { position: relative; min-height: 340px; overflow: hidden; background: linear-gradient(145deg, #172440, #101729); }
    .member-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .member-photo img[hidden] { display: none; }
    .photo-fallback { display: grid; width: 100%; height: 100%; min-height: 340px; place-items: center; color: #b7c8e8; font: 500 64px var(--display); }
    .member-details { align-self: center; padding: 38px clamp(22px, 5vw, 56px); }
    .member-details .eyebrow { color: #7dddf0; font-size: 10px; letter-spacing: .12em; }
    .member-details h3 { margin: 12px 0 4px; font: 500 clamp(26px, 4vw, 38px) var(--display); letter-spacing: -.04em; }
    .member-role { margin: 0; color: #a8b5c9; }
    .member-facts { display: grid; gap: 9px; margin: 24px 0; color: #9ba6bc; font-size: 13px; }
    .member-facts strong { margin-right: 4px; color: #eef4ff; font-weight: 500; }
    .member-details h4 { margin: 0 0 10px; color: #dce7f8; font-size: 12px; font-weight: 500; }
    .tech-stack { display: flex; flex-wrap: wrap; gap: 7px; margin: 0; padding: 0; list-style: none; }
    .tech-stack li { padding: 5px 9px; border: 1px solid #ffffff18; border-radius: 20px; color: #bdc9dc; font-size: 11px; }
    .carousel-footer { display: flex; align-items: center; gap: 24px; margin-top: 18px; }
    .team-controls { display: flex; align-items: center; gap: 12px; color: #9ba6bc; font-size: 12px; }
    .team-controls button { display: grid; width: 36px; height: 36px; place-items: center; border: 1px solid var(--line); border-radius: 50%; color: #c8d3e2; background: transparent; cursor: pointer; }
    .team-controls button:hover, .team-controls button:focus-visible { border-color: #31d7f0; color: #fff; outline: none; }
    .carousel-progress { height: 2px; flex: 1; overflow: hidden; background: #ffffff14; }
    .carousel-progress span { display: block; height: 100%; background: linear-gradient(90deg, #31d7f0, #7c3aed); transition: width .3s ease; }
    .demo-notice, .team-empty { margin: 16px 0 0; color: #8290a8; font-size: 11px; text-align: center; }
    @media (max-width: 640px) {
      .member-card { grid-template-columns: 1fr; }
      .member-photo { min-height: 250px; max-height: 330px; }
      .photo-fallback { min-height: 250px; }
      .member-details { padding: 26px 22px 30px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .carousel-progress span { transition: none; }
    }
  `]
})
export class TeamExpertiseComponent implements OnInit, OnDestroy {
  private readonly content = inject(ContentApiService);
  private memberCount = 0;
  private intervalId: number | null = null;
  private pointerPaused = false;
  private focusPaused = false;

  readonly active = signal(0);
  readonly team$ = this.content.team().pipe(
    map((members) => members.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))),
    tap((members) => this.memberCount = members.length),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  ngOnInit(): void {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.intervalId = window.setInterval(() => {
      if (!this.pointerPaused && !this.focusPaused) this.next();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId !== null) window.clearInterval(this.intervalId);
  }

  next(): void {
    if (this.memberCount) this.active.update((index) => (index + 1) % this.memberCount);
  }

  previous(): void {
    if (this.memberCount) this.active.update((index) => (index - 1 + this.memberCount) % this.memberCount);
  }

  initials(name: string): string {
    return name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('');
  }

  hideBrokenPhoto(event: Event): void {
    (event.currentTarget as HTMLImageElement).hidden = true;
  }

  pauseForPointer(): void {
    this.pointerPaused = true;
  }

  resumeForPointer(): void {
    this.pointerPaused = false;
  }

  pauseForFocus(): void {
    this.focusPaused = true;
  }

  resumeForFocus(event: FocusEvent): void {
    const carousel = event.currentTarget as HTMLElement;
    this.focusPaused = event.relatedTarget instanceof Node && carousel.contains(event.relatedTarget);
  }
}
