export interface NavigationLink { label: string; href: string; }
export interface SiteSettingsResponse { brandName: string; brandSuffix: string; tagline: string; email: string; copyright: string; navigation: NavigationLink[]; footerServices: string[]; footerExplore: string[]; contactServiceOptions: string[]; budgetOptions: string[]; timelineOptions: string[]; }
