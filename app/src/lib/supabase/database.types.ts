/** Supabase row shapes — snake_case matches Postgres columns */

export type PropertyRow = {
  id: string;
  title: string;
  location: string;
  address: string | null;
  city: string | null;
  state: string | null;
  category: 'hotel' | 'airbnb' | 'airport';
  summary: string | null;
  description: string | null;
  price: number;
  rating: number;
  review_count: number;
  verified: boolean;
  lat: number | null;
  lng: number | null;
  photos: { url: string; alt: string }[] | null;
  wheelchair_ramp: boolean;
  roll_in_shower: boolean;
  elevator: boolean;
  wide_doorways: boolean;
  accessible_parking: boolean;
  accessible_restroom: boolean;
  accessible_entrance: boolean;
  lowered_bathroom: boolean;
  service_animals_allowed: boolean;
  ceiling_hoist: boolean;
  created_at: string;
  updated_at: string;
};

export type ReportRow = {
  id: string;
  property_id: string | null;
  issue_type: 'inaccurate_feature' | 'missing_access' | 'new_listing' | 'other';
  title: string | null;
  location: string | null;
  reporter_email: string | null;
  notes: string;
  wheelchair_ramp: boolean | null;
  roll_in_shower: boolean | null;
  elevator: boolean | null;
  wide_doorways: boolean | null;
  accessible_parking: boolean | null;
  accessible_restroom: boolean | null;
  accessible_entrance: boolean | null;
  lowered_bathroom: boolean | null;
  service_animals_allowed: boolean | null;
  ceiling_hoist: boolean | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: PropertyRow;
        Insert: Partial<PropertyRow> & Pick<PropertyRow, 'title' | 'location' | 'category'>;
        Update: Partial<PropertyRow>;
      };
      reports: {
        Row: ReportRow;
        Insert: Partial<ReportRow> & Pick<ReportRow, 'notes' | 'issue_type'>;
        Update: Partial<ReportRow>;
      };
    };
  };
};

export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
