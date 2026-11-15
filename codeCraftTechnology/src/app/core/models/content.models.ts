export interface HeroMetric { label: string; value: string; order: number; }
export interface HeroResponse { eyebrow: string; headline: string; subheadline: string; primaryAction: string; secondaryAction: string; metrics: HeroMetric[]; }
export interface TechnologyResponse { id: number; name: string; category: string; logoUrl?: string; order: number; }
export interface ServiceResponse { id: number; title: string; slug: string; description: string; technologies: string[]; icon: string; order: number; }
export interface CapabilityResponse { title: string; description: string; skills: string[]; percentage: number; order: number; }
export interface ProcessStepResponse { title: string; description: string; duration: string; order: number; }
export interface CaseStudyResult { label: string; value: string; }
export interface CaseStudyResponse { id: number; title: string; industry: string; challenge: string; solution: string; technologies: string[]; results: CaseStudyResult[]; order: number; }
export interface IndustryResponse { id: number; name: string; description: string; icon: string; order: number; }
export interface TestimonialResponse { id: number; quote: string; clientName: string; clientRole: string; company: string; companyLogoUrl?: string; rating: number; order: number; }
export interface TeamMemberProfileResponse { name: string; role?: string; photoUrl: string; techStack: string[]; experienceYears: number; currentCompany: string; order?: number; }
export interface ContactRequest { name: string; company: string; email: string; phone?: string; requiredService: string; budget?: string; timeline?: string; description: string; }
export interface ContactResponse { id: number; status: string; createdAt: string; }
export interface ApiError { message: string; details?: Record<string, string>; }
export interface AdminUser { id: number; email: string; roles: string[]; contentPermissions: string[]; }
export interface LoginResponse { accessToken: string; tokenType: 'Bearer'; expiresIn: number; user: AdminUser; }
export interface LeadResponse extends ContactRequest { id: number; status: string; createdAt: string; }
export interface EditorUserResponse { id: number; email: string; contentPermissions: string[]; }
export interface CreateEditorRequest { email: string; password: string; contentPermissions: string[]; }
