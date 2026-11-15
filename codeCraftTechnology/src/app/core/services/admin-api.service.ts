import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateEditorRequest, EditorUserResponse, LeadResponse } from '../models/content.models';
@Injectable({ providedIn: 'root' })
export class AdminApiService {
 private readonly http = inject(HttpClient); private readonly base = `${environment.apiBaseUrl}/admin`;
 leads() { return this.http.get<LeadResponse[]>(`${this.base}/leads`); }
 content<T = unknown>(key: string): Observable<T> { return this.http.get<T>(`${this.base}/content/${key}`); }
 saveContent<T = unknown>(key: string, value: unknown): Observable<T> { return this.http.put<T>(`${this.base}/content/${key}`, value); }
 updateLead(id: number, status: string) { return this.http.patch<LeadResponse>(`${this.base}/leads/${id}`, { status }); }
 editors() { return this.http.get<EditorUserResponse[]>(`${this.base}/editors`); }
 createEditor(payload: CreateEditorRequest) { return this.http.post<EditorUserResponse>(`${this.base}/editors`, payload); }
 updateEditorPermissions(id: number, contentPermissions: string[]) { return this.http.put<EditorUserResponse>(`${this.base}/editors/${id}/permissions`, { contentPermissions }); }
}
