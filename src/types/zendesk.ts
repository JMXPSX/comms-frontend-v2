export interface ZendeskComment {
  id: number;
  type: string;
  author_id: number;
  body: string;
  html_body: string;
  plain_body: string;
  public: boolean;
  attachments: ZendeskAttachment[];
  audit_id: number;
  via: ZendeskVia;
  created_at: string;
  metadata: {
    system?: {
      client?: string;
      ip_address?: string;
      location?: string;
      latitude?: number;
      longitude?: number;
    };
    custom?: Record<string, any>;
  };
}

export interface ZendeskAttachment {
  id: number;
  name: string;
  content_url: string;
  content_type: string;
  size: number;
  width?: number;
  height?: number;
  inline: boolean;
  deleted: boolean;
  malware_access_override: boolean;
  malware_scan_result: string;
  mapped_content_url: string;
  url: string;
  thumbnails?: ZendeskThumbnail[];
}

export interface ZendeskThumbnail {
  id: number;
  name: string;
  content_url: string;
  content_type: string;
  size: number;
  width: number;
  height: number;
  inline: boolean;
  deleted: boolean;
  malware_access_override: boolean;
  malware_scan_result: string;
  mapped_content_url: string;
  url: string;
}

export interface ZendeskVia {
  channel: string;
  source: {
    from?: Record<string, any>;
    to?: Record<string, any>;
    rel?: string;
  };
}

export interface ZendeskCommentsResponse {
  comments: ZendeskComment[];
  next_page: string | null;
  previous_page: string | null;
  count: number;
}

export interface ZendeskTicket {
  id: number;
  url: string;
  external_id: string | null;
  type: string | null;
  subject: string;
  raw_subject: string;
  description: string;
  priority: string | null;
  status: string;
  recipient: string | null;
  requester_id: number;
  submitter_id: number;
  assignee_id: number | null;
  organization_id: number | null;
  group_id: number | null;
  collaborator_ids: number[];
  follower_ids: number[];
  email_cc_ids: number[];
  forum_topic_id: number | null;
  problem_id: number | null;
  has_incidents: boolean;
  is_public: boolean;
  due_at: string | null;
  tags: string[];
  custom_fields: ZendeskCustomField[];
  satisfaction_rating: ZendeskSatisfactionRating | null;
  sharing_agreement_ids: number[];
  fields: ZendeskCustomField[];
  followup_ids: number[];
  brand_id: number;
  allow_channelback: boolean;
  allow_attachments: boolean;
  created_at: string;
  updated_at: string;
}

export interface ZendeskCustomField {
  id: number;
  value: string | number | boolean | null;
}

export interface ZendeskSatisfactionRating {
  id: number;
  score: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ZendeskTicketResponse {
  ticket: ZendeskTicket;
}

export interface ZendeskUser {
  id: number;
  url: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  time_zone: string;
  iana_time_zone: string;
  phone: string | null;
  shared_phone_number: string | null;
  photo?: {
    id: number;
    name: string;
    content_url: string;
    mapped_content_url: string;
    content_type: string;
    size: number;
    width: number;
    height: number;
    inline: boolean;
    deleted: boolean;
    malware_access_override: boolean;
    malware_scan_result: string;
    url: string;
    thumbnails: ZendeskThumbnail[];
  };
  locale_id: number;
  locale: string;
  organization_id: number | null;
  role: string;
  verified: boolean;
  external_id: string | null;
  tags: string[];
  alias: string | null;
  active: boolean;
  shared: boolean;
  shared_agent: boolean;
  last_login_at: string | null;
  two_factor_auth_enabled: boolean;
  signature: string | null;
  details: string | null;
  notes: string | null;
  role_type: number | null;
  custom_role_id: number | null;
  moderator: boolean;
  ticket_restriction: string | null;
  only_private_comments: boolean;
  restricted_agent: boolean;
  suspended: boolean;
  default_group_id: number | null;
  report_csv: boolean;
  user_fields: Record<string, any>;
}