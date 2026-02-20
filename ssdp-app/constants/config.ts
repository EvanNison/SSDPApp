// API and service configuration
export const config = {
  // Supabase — replace with actual values when project is created
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',

  // WordPress REST API
  wpApiBase: 'https://ssdp.org/wp-json/wp/v2',

  // WooCommerce (needs API keys — deferred to Release 3)
  wcApiBase: 'https://ssdp.org/wp-json/wc/v3',

  // App metadata
  appName: 'SSDP',
  appVersion: '1.0.0',
  supportUrl: 'https://ssdp.org/contact',
  privacyUrl: 'https://ssdp.org/app-privacy',
} as const;

// Role hierarchy (higher index = more access)
export const ROLE_HIERARCHY = [
  'guest',
  'registered',
  'ambassador',
  'committee_member',
  'committee_chair',
  'board',
  'staff',
  'admin',
] as const;

export type UserRole = (typeof ROLE_HIERARCHY)[number];

export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(requiredRole);
}
