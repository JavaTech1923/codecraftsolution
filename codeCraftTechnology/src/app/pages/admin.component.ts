import { Component, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { AdminApiService } from '../core/services/admin-api.service';
import { CreateEditorRequest, EditorUserResponse, LeadResponse, TeamMemberProfileResponse } from '../core/models/content.models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    @if (!auth.isAuthenticated()) {
      <main class="admin-login">
        <a class="brand" href="/"><span class="brand-mark">C</span><span>CODECRAFTSOLUTION</span></a>
        <form class="login-card" [formGroup]="loginForm" (ngSubmit)="login()">
          <div class="eyebrow">CODECRAFTSOLUTION / CONTROL ROOM</div>
          <h1>Welcome back.</h1>
          <p>Sign in to manage your digital experience.</p>
          <label>Work email<input type="email" formControlName="email" autocomplete="username"></label>
          <label>Password<input type="password" formControlName="password" autocomplete="current-password"></label>
          @if (error()) {
            <p class="admin-error">{{ error() }}</p>
          }
          <button class="button button-primary" [disabled]="loginForm.invalid || loading()">
            {{ loading() ? 'Signing in…' : 'Sign in' }} <span>↗</span>
          </button>
          <a href="/" class="admin-back">← Back to website</a>
        </form>
      </main>
    } @else {
      <div class="admin-shell">
        <aside class="admin-sidebar">
          <a class="brand" href="/"><span class="brand-mark">C</span><span>CODECRAFTSOLUTION</span></a>
          <span class="admin-side-label">WORKSPACE</span>
          <button (click)="select('overview')" [class.active]="selected() === 'overview'">◫ Overview</button>
          @for (item of availableContentTypes(); track item.key) {
            <button (click)="select(item.key)" [class.active]="selected() === item.key">{{ item.icon }} {{ item.label }}</button>
          }
          @if (auth.canManageLeads()) {
            <span class="admin-side-label">INBOUND</span>
            <button (click)="select('leads')" [class.active]="selected() === 'leads'">✉ Contact leads</button>
          }
        </aside>

        <main class="admin-main">
          <header class="admin-header">
            <div>
              <span class="eyebrow">CODECRAFTSOLUTION / CONTROL ROOM</span>
              <h1>{{ heading() }}</h1>
            </div>
            <div class="profile-menu" (click)="$event.stopPropagation()">
              <button
                class="profile-trigger"
                type="button"
                aria-label="Open account menu"
                aria-haspopup="true"
                [attr.aria-expanded]="profileMenuOpen()"
                (click)="toggleProfileMenu()"
              >
                <span class="profile-email">{{ auth.user()?.email }}</span>
                <span class="profile-avatar" aria-hidden="true">{{ auth.user()?.email?.charAt(0)?.toUpperCase() }}</span>
                <span class="profile-chevron" aria-hidden="true">{{ profileMenuOpen() ? '⌃' : '⌄' }}</span>
              </button>
              @if (profileMenuOpen()) {
                <div class="profile-dropdown">
                  <p class="profile-menu-email">{{ auth.user()?.email }}</p>
                  @if (auth.isSuperAdmin()) {
                    <button class="profile-menu-action" type="button" (click)="openUserAccess()">♙ User access</button>
                  }
                  <button class="profile-menu-action profile-menu-signout" type="button" (click)="logout()">↪ Sign out</button>
                </div>
              }
            </div>
          </header>

          @if (selected() === 'overview') {
            <div class="admin-welcome">
              <div class="admin-welcome-copy">
                <span class="eyebrow">YOUR DIGITAL EXPERIENCE</span>
                <h2>Make every detail<br><span class="gradient-text">count.</span></h2>
                <p>Keep your public story accurate, compelling, and unmistakably yours. Choose a section to manage, or start with your newest inquiries.</p>
                @if (auth.canManageLeads()) {
                  <button class="button button-primary" (click)="select('leads')">View contact leads <span>↗</span></button>
                }
              </div>
              <div class="admin-overview-art">✳<span>CONTENT<br>CONTROL</span></div>
            </div>
            @if (auth.canManageLeads()) {
              <button class="admin-link-card" (click)="select('leads')">
                <span><b>Contact leads</b><small>Review and update inbound opportunities</small></span>
                <i>↗</i>
              </button>
            } @else {
              <div class="admin-link-card">
                <span><b>Content editor</b><small>Choose an assigned section from the workspace menu.</small></span>
              </div>
            }
          } @else if (selected() === 'leads') {
            <section class="admin-panel">
              <div class="admin-panel-head">
                <div>
                  <h2>Project inquiries</h2>
                  <p>New opportunities submitted through your website.</p>
                </div>
                <button class="admin-refresh" (click)="loadLeads()">↻ Refresh</button>
              </div>

              @if (leads().length) {
                <div class="lead-list">
                  @for (lead of leads(); track lead.id) {
                    <article class="lead-row">
                      <div class="lead-identity">
                        <span class="lead-avatar">{{ lead.name.charAt(0) }}</span>
                        <div>
                          <strong>{{ lead.name }}</strong>
                          <span>{{ lead.company || 'Independent' }} · {{ lead.email }}</span>
                        </div>
                      </div>
                      <div class="lead-meta">
                        <strong>{{ lead.requiredService }}</strong>
                        <span>{{ lead.budget || 'Budget not set' }} · {{ lead.timeline || 'Timeline not set' }}</span>
                      </div>
                      <select [value]="lead.status" (change)="changeLead(lead, $event)">
                        <option>NEW</option>
                        <option>IN_PROGRESS</option>
                        <option>QUALIFIED</option>
                        <option>CLOSED</option>
                      </select>
                      <button class="lead-detail" (click)="openLead(lead)">View ↗</button>
                    </article>
                  }
                </div>
              } @else {
                <div class="admin-empty">No inquiries yet. New website submissions will appear here.</div>
              }
            </section>
          } @else if (selected() === 'team') {
            <section class="admin-panel team-admin-panel">
              <div class="admin-panel-head">
                <div>
                  <h2>Team roster</h2>
                  <p>Manage profiles shown on the public page. Keep at least 15 members, each with more than 5 years of experience.</p>
                </div>
                <button class="admin-refresh" (click)="loadTeamMembers()" [disabled]="loading()">↻ Reload</button>
              </div>

              @if (teamError()) {
                <p class="admin-error">{{ teamError() }}</p>
              }
              @if (teamSaveMessage()) {
                <p class="form-message success">{{ teamSaveMessage() }}</p>
              }

              <div class="team-roster-toolbar">
                <span>{{ teamMembers().length }} profiles</span>
                <button class="button button-primary" type="button" (click)="addTeamMember()" [disabled]="loading()">
                  Add team member <span>+</span>
                </button>
              </div>

              @if (teamFormVisible()) {
                <form class="team-profile-form" [formGroup]="teamForm" (ngSubmit)="saveTeamMember()">
                  <div class="team-form-grid">
                    <label>
                      Full name
                      <input type="text" formControlName="name" autocomplete="off">
                    </label>
                    <label>
                      Role
                      <input type="text" formControlName="role" autocomplete="organization-title">
                    </label>
                    <label class="team-form-wide">
                      Photo URL
                      <input type="text" formControlName="photoUrl" placeholder="https://... or /assets/team/photo.jpg" inputmode="url">
                      <small>Use an HTTPS image URL or a path under /assets/.</small>
                    </label>
                    <label>
                      Years of experience
                      <input type="number" formControlName="experienceYears" min="6" step="1">
                    </label>
                    <label>
                      Current company
                      <input type="text" formControlName="currentCompany">
                    </label>
                    <label class="team-form-wide">
                      Tech stack
                      <textarea formControlName="techStack" rows="2" placeholder="Angular, TypeScript, PostgreSQL"></textarea>
                      <small>Separate technologies with commas.</small>
                    </label>
                  </div>
                  @if (teamForm.invalid && teamForm.touched) {
                    <p class="admin-error">Complete every required field. Experience must be greater than 5 years.</p>
                  }
                  <div class="team-form-actions">
                    <button class="admin-refresh" type="button" (click)="cancelTeamEdit()">Cancel</button>
                    <button class="button button-primary" type="submit" [disabled]="teamForm.invalid || loading()">
                      {{ loading() ? 'Saving…' : editingTeamIndex() === null ? 'Add profile' : 'Save profile' }} <span>↗</span>
                    </button>
                  </div>
                </form>
              }

              @if (teamMembers().length) {
                <div class="team-roster-list">
                  @for (member of teamMembers(); track $index; let index = $index) {
                    <article class="team-admin-card">
                      <div class="team-admin-photo">
                        <span aria-hidden="true">{{ teamInitials(member.name) }}</span>
                        <img [src]="member.photoUrl" [alt]="member.name" (error)="hideTeamPhoto($event)" loading="lazy">
                      </div>
                      <div class="team-admin-details">
                        <strong>{{ member.name }}</strong>
                        <span>{{ member.role || 'Senior team member' }} · {{ member.experienceYears }} years</span>
                        <span>Current company: {{ member.currentCompany }}</span>
                        <div class="team-admin-stack">
                          @for (technology of member.techStack; track technology) {
                            <span>{{ technology }}</span>
                          }
                        </div>
                      </div>
                      <div class="team-admin-actions">
                        <button class="admin-refresh" type="button" (click)="editTeamMember(index)" [disabled]="loading()">Edit</button>
                        <button class="admin-refresh" type="button" (click)="removeTeamMember(index)" [disabled]="loading() || teamMembers().length <= 15" [attr.aria-label]="'Remove ' + member.name">
                          Remove
                        </button>
                      </div>
                    </article>
                  }
                </div>
              } @else if (!loading()) {
                <div class="admin-empty">No team profiles found.</div>
              }
            </section>
          } @else if (selected() === 'users') {
            <section class="admin-panel">
              <div class="admin-panel-head">
                <div>
                  <h2>Editor accounts</h2>
                  <p>Create normal users and choose exactly which content sections they can edit. Editors cannot manage users or contact leads.</p>
                </div>
                <button class="admin-refresh" type="button" (click)="loadEditors()" [disabled]="loading()">↻ Reload</button>
              </div>

              @if (editorError()) {
                <p class="admin-error">{{ editorError() }}</p>
              }
              @if (editorMessage()) {
                <p class="form-message success">{{ editorMessage() }}</p>
              }

              <div class="editor-management-grid">
                <form class="editor-create-form" [formGroup]="editorForm" (ngSubmit)="createEditor()">
                  <h3>Create a normal user</h3>
                  <label>
                    Email
                    <input type="email" formControlName="email" autocomplete="off">
                  </label>
                  <label>
                    Temporary password
                    <input type="password" formControlName="password" autocomplete="new-password">
                    <small>Use 14–72 characters. Share it securely with the new user.</small>
                  </label>
                  <fieldset>
                    <legend>Content access</legend>
                    @for (item of contentTypes; track item.key) {
                      <label class="editor-permission-option">
                        <input
                          type="checkbox"
                          [checked]="selectedEditorPermissions().includes(item.key)"
                          (change)="toggleEditorPermission(item.key, $event)"
                        >
                        {{ item.label }}
                      </label>
                    }
                  </fieldset>
                  @if (!selectedEditorPermissions().length) {
                    <p class="admin-error">Select at least one content section.</p>
                  }
                  <button class="button button-primary" type="submit" [disabled]="editorForm.invalid || !selectedEditorPermissions().length || loading()">
                    {{ loading() ? 'Creating…' : 'Create editor' }} <span>↗</span>
                  </button>
                </form>

                <div class="editor-list">
                  <h3>Existing normal users</h3>
                  @if (editorUsers().length) {
                    @for (editor of editorUsers(); track editor.id) {
                      <article class="editor-account-row">
                        <strong>{{ editor.email }}</strong>
                        <span>Can edit</span>
                        <div class="editor-permission-tags">
                          @for (key of editor.contentPermissions; track key) {
                            <span>{{ contentLabel(key) }}</span>
                          }
                        </div>
                      </article>
                    }
                  } @else if (!loading()) {
                    <div class="admin-empty">No normal users have been created yet.</div>
                  }
                </div>
              </div>
            </section>
          } @else {
            <section class="admin-panel">
              <div class="admin-panel-head">
                <div>
                  <h2>Edit {{ heading() }}</h2>
                  <p>Changes are published to the public site after saving.</p>
                </div>
                <button class="admin-refresh" (click)="loadContent()">↻ Reload</button>
              </div>

              @if (contentError()) {
                <p class="admin-error">{{ contentError() }}</p>
              }

              <textarea class="json-editor" [value]="editor()" (input)="editor.set(($any($event.target)).value)" spellcheck="false" aria-label="Content JSON editor"></textarea>

              @if (saveMessage()) {
                <p class="form-message success">{{ saveMessage() }}</p>
              }

              <button class="button button-primary" (click)="save()" [disabled]="loading()">
                {{ loading() ? 'Saving…' : 'Save changes' }} <span>↗</span>
              </button>
            </section>
          }
        </main>
      </div>
    }

    @if (focusedLead()) {
      <div class="lead-modal-backdrop" (click)="focusedLead.set(null)">
        <article class="lead-modal" (click)="$event.stopPropagation()">
          <button class="modal-close" (click)="focusedLead.set(null)">×</button>
          <div class="eyebrow">PROJECT INQUIRY</div>
          <h2>{{ focusedLead()?.name }}</h2>
          <p>{{ focusedLead()?.company }} · {{ focusedLead()?.email }} · {{ focusedLead()?.phone }}</p>
          <div class="lead-modal-tags">
            <span>{{ focusedLead()?.requiredService }}</span>
            <span>{{ focusedLead()?.budget || 'Budget TBD' }}</span>
            <span>{{ focusedLead()?.timeline || 'Timeline TBD' }}</span>
          </div>
          <p>{{ focusedLead()?.description }}</p>
        </article>
      </div>
    }
  `,
  styles: [`
    .profile-menu { position: relative; }
    .profile-trigger { display: flex; align-items: center; gap: 10px; padding: 5px 7px; border: 1px solid transparent; border-radius: 8px; color: #dce7f8; background: transparent; font: inherit; cursor: pointer; }
    .profile-trigger:hover, .profile-trigger[aria-expanded="true"] { border-color: var(--line); background: #0b1120; }
    .profile-trigger:focus-visible, .profile-menu-action:focus-visible { outline: 2px solid #31d7f0; outline-offset: 2px; }
    .profile-email { max-width: 220px; overflow: hidden; color: #a8b5c9; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
    .profile-avatar { display: grid; width: 34px; height: 34px; flex: 0 0 34px; place-items: center; border: 1px solid #31d7f055; border-radius: 50%; color: #d9fbff; background: #113044; font-size: 13px; font-weight: 600; }
    .profile-chevron { color: #8594ab; font-size: 12px; }
    .profile-dropdown { position: absolute; z-index: 20; top: calc(100% + 8px); right: 0; width: min(260px, calc(100vw - 32px)); padding: 8px; border: 1px solid var(--line); border-radius: 9px; background: #0b1120; box-shadow: 0 16px 40px #0009; }
    .profile-menu-email { overflow: hidden; margin: 4px 8px 8px; padding: 4px 0 10px; border-bottom: 1px solid var(--line); color: #8290a8; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
    .profile-menu-action { display: flex; width: 100%; align-items: center; gap: 9px; padding: 10px 9px; border: 0; border-radius: 5px; color: #dce7f8; background: transparent; font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
    .profile-menu-action:hover { background: #ffffff0d; }
    .profile-menu-signout { color: #ffb9bd; }
    .team-roster-toolbar, .team-form-actions, .team-admin-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .team-roster-toolbar { margin: 20px 0 16px; color: #a8b5c9; font-size: 12px; }
    .team-profile-form { margin-bottom: 20px; padding: 20px; border: 1px solid var(--line); border-radius: 9px; background: #0b1120a0; }
    .team-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .team-form-grid label { display: grid; gap: 6px; color: #cbd6e7; font-size: 12px; }
    .team-form-grid input, .team-form-grid textarea { width: 100%; padding: 10px 11px; border: 1px solid var(--line); border-radius: 5px; color: #f4f7ff; background: #070c18; font: inherit; }
    .team-form-grid input:focus, .team-form-grid textarea:focus { border-color: #31d7f0; outline: 1px solid #31d7f055; }
    .team-form-grid small { color: #8290a8; font-size: 10px; }
    .team-form-wide { grid-column: 1 / -1; }
    .team-form-actions { justify-content: flex-end; margin-top: 16px; }
    .team-roster-list { display: grid; gap: 10px; }
    .team-admin-card { display: grid; grid-template-columns: 58px minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: #0b1120a0; }
    .team-admin-photo { position: relative; width: 58px; height: 58px; overflow: hidden; border-radius: 6px; background: #172440; }
    .team-admin-photo > span { display: grid; width: 100%; height: 100%; place-items: center; color: #b7c8e8; font-size: 18px; }
    .team-admin-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .team-admin-photo img[hidden] { display: none; }
    .team-admin-details { display: grid; gap: 4px; min-width: 0; color: #9ba6bc; font-size: 11px; }
    .team-admin-details > strong { color: #f4f7ff; font-size: 14px; }
    .team-admin-stack { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 3px; }
    .team-admin-stack span { padding: 3px 7px; border: 1px solid #ffffff12; border-radius: 12px; color: #b7c8e8; font-size: 10px; }
    .team-admin-actions { justify-content: flex-end; }
    .team-admin-actions button:disabled { cursor: not-allowed; opacity: .45; }
    .editor-management-grid { display: grid; grid-template-columns: minmax(260px, .8fr) minmax(0, 1.2fr); gap: 20px; margin-top: 20px; }
    .editor-create-form, .editor-list { padding: 18px; border: 1px solid var(--line); border-radius: 9px; background: #0b1120a0; }
    .editor-create-form h3, .editor-list h3 { margin: 0 0 16px; color: #eef4ff; font: 500 17px var(--display); }
    .editor-create-form > label { display: grid; gap: 6px; margin-bottom: 14px; color: #cbd6e7; font-size: 12px; }
    .editor-create-form > label input { width: 100%; padding: 10px 11px; border: 1px solid var(--line); border-radius: 5px; color: #f4f7ff; background: #070c18; font: inherit; }
    .editor-create-form small { color: #8290a8; font-size: 10px; }
    .editor-create-form fieldset { display: grid; gap: 9px; margin: 16px 0; padding: 12px; border: 1px solid var(--line); border-radius: 6px; }
    .editor-create-form legend { padding: 0 5px; color: #dce7f8; font-size: 12px; }
    .editor-permission-option { display: flex; align-items: center; gap: 9px; color: #a8b5c9; font-size: 12px; }
    .editor-permission-option input { accent-color: #31d7f0; }
    .editor-account-row { display: grid; gap: 8px; padding: 13px 0; border-top: 1px solid var(--line); color: #9ba6bc; font-size: 11px; }
    .editor-account-row strong { color: #f4f7ff; font-size: 13px; }
    .editor-permission-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .editor-permission-tags span { padding: 4px 8px; border: 1px solid #ffffff12; border-radius: 12px; color: #b7c8e8; }
    @media (max-width: 680px) {
      .profile-email { display: none; }
      .team-form-grid { grid-template-columns: 1fr; }
      .team-form-wide { grid-column: auto; }
      .team-admin-card { grid-template-columns: 48px minmax(0, 1fr); align-items: start; }
      .team-admin-photo { width: 48px; height: 48px; }
      .team-admin-actions { grid-column: 2; justify-content: flex-start; }
      .editor-management-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminComponent {
  readonly auth = inject(AuthService);
  private readonly adminApi = inject(AdminApiService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly contentError = signal('');
  readonly saveMessage = signal('');
  readonly selected = signal('overview');
  readonly editor = signal('');
  readonly leads = signal<LeadResponse[]>([]);
  readonly focusedLead = signal<LeadResponse | null>(null);
  readonly teamMembers = signal<TeamMemberProfileResponse[]>([]);
  readonly teamError = signal('');
  readonly teamSaveMessage = signal('');
  readonly teamFormVisible = signal(false);
  readonly editingTeamIndex = signal<number | null>(null);
  readonly editorUsers = signal<EditorUserResponse[]>([]);
  readonly editorError = signal('');
  readonly editorMessage = signal('');
  readonly selectedEditorPermissions = signal<string[]>(['team']);
  readonly profileMenuOpen = signal(false);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  readonly teamForm = this.fb.group({
    name: ['', Validators.required],
    role: [''],
    photoUrl: ['', [Validators.required, Validators.pattern(/^(https:\/\/|\/assets\/)\S+$/)]],
    experienceYears: [6, [Validators.required, Validators.min(6)]],
    currentCompany: ['', Validators.required],
    techStack: ['', Validators.required]
  });

  readonly editorForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(72)]]
  });

  readonly contentTypes = [
    { key: 'hero', label: 'Hero & metrics', icon: '◈' },
    { key: 'services', label: 'Services', icon: '⌘' },
    { key: 'capabilities', label: 'Capabilities', icon: '✦' },
    { key: 'technologies', label: 'Technologies', icon: '✳' },
    { key: 'case-studies', label: 'Case studies', icon: '▤' },
    { key: 'testimonials', label: 'Testimonials', icon: '❝' },
    { key: 'industries', label: 'Industries', icon: '◉' },
    { key: 'process', label: 'Process timeline', icon: '⏱' },
    { key: 'team', label: 'Team members', icon: '◌' },
    { key: 'site-settings', label: 'Site settings', icon: '⚙' }
  ];

  heading(): string {
    return this.selected() === 'overview'
      ? 'Overview'
      : this.selected() === 'leads'
        ? 'Contact leads'
        : this.selected() === 'users'
          ? 'User access'
        : this.contentTypes.find((item) => item.key === this.selected())?.label ?? 'Manage content';
  }

  availableContentTypes() {
    return this.contentTypes.filter((item) => this.auth.canEditContent(item.key));
  }

  login(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.loginForm.getRawValue();
    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        if (this.auth.canManageLeads()) {
          this.selected.set('overview');
          this.loadLeads();
        } else {
          const firstSection = this.availableContentTypes()[0];
          if (firstSection) this.select(firstSection.key);
          else this.selected.set('overview');
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Sign in failed. Check your credentials or contact your administrator.');
      }
    });
  }

  select(key: string): void {
    if (key === 'leads' && !this.auth.canManageLeads()) return;
    if (key === 'users' && !this.auth.isSuperAdmin()) return;
    if (this.contentTypes.some((item) => item.key === key) && !this.auth.canEditContent(key)) return;
    this.selected.set(key);
    this.saveMessage.set('');
    if (key === 'users') {
      this.loadEditors();
      return;
    }
    if (key === 'leads') {
      this.loadLeads();
    } else if (key === 'team') {
      this.loadTeamMembers();
    } else if (key !== 'overview') {
      this.loadContent();
    }
  }

  loadEditors(): void {
    this.loading.set(true);
    this.editorError.set('');
    this.editorMessage.set('');
    this.adminApi.editors().subscribe({
      next: (editors) => {
        this.editorUsers.set(editors);
        this.loading.set(false);
      },
      error: () => {
        this.editorError.set('Could not load editor accounts. Check your super-admin access.');
        this.loading.set(false);
      }
    });
  }

  createEditor(): void {
    if (this.editorForm.invalid || !this.selectedEditorPermissions().length) return;
    const value = this.editorForm.getRawValue();
    const request: CreateEditorRequest = {
      email: value.email?.trim() ?? '',
      password: value.password ?? '',
      contentPermissions: this.selectedEditorPermissions()
    };
    this.loading.set(true);
    this.editorError.set('');
    this.editorMessage.set('');
    this.adminApi.createEditor(request).subscribe({
      next: (editor) => {
        this.editorUsers.update((editors) => [...editors, editor]);
        this.editorForm.reset({ email: '', password: '' });
        this.selectedEditorPermissions.set(['team']);
        this.editorMessage.set('Editor account created. Share the temporary password securely.');
        this.loading.set(false);
      },
      error: () => {
        this.editorError.set('Could not create the account. Check that the email is unique and the password is 14–72 characters.');
        this.loading.set(false);
      }
    });
  }

  toggleEditorPermission(key: string, event: Event): void {
    const selected = new Set(this.selectedEditorPermissions());
    if ((event.target as HTMLInputElement).checked) selected.add(key);
    else selected.delete(key);
    this.selectedEditorPermissions.set([...selected]);
  }

  contentLabel(key: string): string {
    return this.contentTypes.find((item) => item.key === key)?.label ?? key;
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen.update((open) => !open);
  }

  openUserAccess(): void {
    this.profileMenuOpen.set(false);
    this.select('users');
  }

  @HostListener('document:click')
  closeProfileMenuOnOutsideClick(): void {
    this.profileMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeProfileMenuOnEscape(): void {
    this.profileMenuOpen.set(false);
  }

  loadLeads(): void {
    this.adminApi.leads().subscribe({
      next: (items) => this.leads.set(items),
      error: () => this.error.set('Could not load contact leads. Please refresh.')
    });
  }

  loadContent(): void {
    this.loading.set(true);
    this.contentError.set('');
    this.adminApi.content(this.selected()).subscribe({
      next: (value) => {
        this.editor.set(JSON.stringify(value, null, 2));
        this.loading.set(false);
      },
      error: () => {
        this.contentError.set('Could not load this content. Check API connection and your admin role.');
        this.loading.set(false);
      }
    });
  }

  loadTeamMembers(): void {
    this.loading.set(true);
    this.teamError.set('');
    this.teamSaveMessage.set('');
    this.adminApi.content<TeamMemberProfileResponse[]>('team').subscribe({
      next: (members) => {
        this.teamMembers.set(members);
        this.loading.set(false);
      },
      error: () => {
        this.teamError.set('Could not load team profiles. Check the API connection and your admin role.');
        this.loading.set(false);
      }
    });
  }

  addTeamMember(): void {
    this.teamError.set('');
    this.teamSaveMessage.set('');
    this.editingTeamIndex.set(null);
    this.teamForm.reset({ name: '', role: '', photoUrl: '', experienceYears: 6, currentCompany: '', techStack: '' });
    this.teamFormVisible.set(true);
  }

  editTeamMember(index: number): void {
    const member = this.teamMembers()[index];
    this.teamError.set('');
    this.teamSaveMessage.set('');
    this.editingTeamIndex.set(index);
    this.teamForm.reset({
      name: member.name,
      role: member.role ?? '',
      photoUrl: member.photoUrl,
      experienceYears: member.experienceYears,
      currentCompany: member.currentCompany,
      techStack: member.techStack.join(', ')
    });
    this.teamFormVisible.set(true);
  }

  saveTeamMember(): void {
    if (this.teamForm.invalid) return;
    const value = this.teamForm.getRawValue();
    const techStack = (value.techStack ?? '').split(',').map((technology) => technology.trim()).filter(Boolean);
    if (!techStack.length) {
      this.teamError.set('Add at least one technology to the tech stack.');
      return;
    }

    const index = this.editingTeamIndex();
    const existing = this.teamMembers();
    const profile: TeamMemberProfileResponse = {
      name: value.name?.trim() ?? '',
      role: value.role?.trim() || undefined,
      photoUrl: value.photoUrl?.trim() ?? '',
      techStack,
      experienceYears: Number(value.experienceYears),
      currentCompany: value.currentCompany?.trim() ?? '',
      order: index === null ? existing.length + 1 : existing[index].order ?? index + 1
    };
    const updated = index === null
      ? [...existing, profile]
      : existing.map((member, memberIndex) => memberIndex === index ? profile : member);
    this.persistTeamMembers(updated);
  }

  removeTeamMember(index: number): void {
    const existing = this.teamMembers();
    if (existing.length <= 15) {
      this.teamError.set('At least 15 team profiles must remain.');
      return;
    }
    this.persistTeamMembers(existing.filter((_, memberIndex) => memberIndex !== index));
  }

  cancelTeamEdit(): void {
    this.teamFormVisible.set(false);
    this.editingTeamIndex.set(null);
    this.teamForm.reset({ name: '', role: '', photoUrl: '', experienceYears: 6, currentCompany: '', techStack: '' });
  }

  private persistTeamMembers(members: TeamMemberProfileResponse[]): void {
    this.loading.set(true);
    this.teamError.set('');
    this.teamSaveMessage.set('');
    this.adminApi.saveContent<TeamMemberProfileResponse[]>('team', members).subscribe({
      next: (saved) => {
        this.teamMembers.set(saved);
        this.loading.set(false);
        this.teamSaveMessage.set('Team roster saved.');
        this.cancelTeamEdit();
      },
      error: () => {
        this.loading.set(false);
        this.teamError.set('Could not save the roster. Each profile needs a photo, name, tech stack, company, and at least 6 years of experience.');
      }
    });
  }

  teamInitials(name: string): string {
    return name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('');
  }

  hideTeamPhoto(event: Event): void {
    (event.currentTarget as HTMLImageElement).hidden = true;
  }

  save(): void {
    try {
      const parsed: unknown = JSON.parse(this.editor());
      this.loading.set(true);
      this.contentError.set('');
      this.adminApi.saveContent(this.selected(), parsed).subscribe({
        next: (value) => {
          this.editor.set(JSON.stringify(value, null, 2));
          this.loading.set(false);
          this.saveMessage.set('Your changes have been saved.');
        },
        error: () => {
          this.loading.set(false);
          this.contentError.set('Save failed. Check the content format and permissions.');
        }
      });
    } catch {
      this.contentError.set('The editor contains invalid JSON. Correct it before saving.');
    }
  }

  changeLead(lead: LeadResponse, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.adminApi.updateLead(lead.id, status).subscribe({
      next: (updated) => this.leads.update((items) => items.map((item) => item.id === updated.id ? updated : item)),
      error: () => this.error.set('Lead status could not be updated.')
    });
  }

  openLead(lead: LeadResponse): void {
    this.focusedLead.set(lead);
  }

  logout(): void {
    this.profileMenuOpen.set(false);
    this.selected.set('overview');
    this.auth.logout();
  }
}
