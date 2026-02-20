// TypeScript types matching the Supabase schema

export type UserRole =
  | 'guest'
  | 'registered'
  | 'ambassador'
  | 'committee_member'
  | 'committee_chair'
  | 'board'
  | 'staff'
  | 'admin';

export type CourseTrack = 'drug_education' | 'internal_onboarding';

export type NewsTag = 'event' | 'urgent' | 'policy' | 'win' | 'course';

export type NotificationType = 'urgent' | 'course' | 'event' | 'points' | 'system';

export type AgreementStatus = 'submitted' | 'approved' | 'rejected';

export type MenuLinkType = 'screen' | 'external' | 'webview';

export type MenuSection = 'account' | 'ssdp' | 'support';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  chapter_id: string | null;
  points: number;
  bio: string | null;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  name: string;
  university: string | null;
  city: string | null;
  state: string | null;
  total_points: number;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  track: CourseTrack | null;
  duration_minutes: number | null;
  module_count: number;
  hero_image_url: string | null;
  required_role: string;
  sort_order: number;
  is_published: boolean;
  partner_name: string | null;
  points_bonus: number;
  created_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  content_markdown: string | null;
  video_url: string | null;
  video_duration: string | null;
  sort_order: number;
  points_reward: number;
  created_at: string;
}

export interface Quiz {
  id: string;
  module_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  points_reward: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  current_module: number;
  completed_modules: string[];
  quiz_scores: Record<string, number>;
  completed_at: string | null;
  points_earned: number;
}

export interface AmbassadorAgreement {
  id: string;
  user_id: string;
  commitments: string[] | null;
  status: AgreementStatus;
  reviewer_id: string | null;
  signed_at: string;
  reviewed_at: string | null;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string | null;
  required_role: string;
  is_chapter_channel: boolean;
  chapter_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: NotificationType;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ActionAlert {
  id: string;
  title: string;
  description: string | null;
  bill_number: string | null;
  call_to_action: string | null;
  target_contact: string | null;
  points_reward: number;
  is_active: boolean;
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  body: string | null;
  excerpt: string | null;
  tag: NewsTag | null;
  image_url: string | null;
  external_url: string | null;
  source: 'admin' | 'wordpress';
  wp_post_id: number | null;
  is_published: boolean;
  published_at: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string | null;
  link_type: MenuLinkType;
  link_value: string | null;
  required_role: string;
  section: MenuSection;
  sort_order: number;
  is_visible: boolean;
}

export interface PointsLogEntry {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  source_type: string | null;
  source_id: string | null;
  created_at: string;
}
