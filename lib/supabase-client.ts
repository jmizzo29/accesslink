import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface AccessibilityFilters {
  location?: string;
  zeroStepEntry?: boolean;
  rollInShower?: boolean;
  wideDoors?: boolean;
  wavAvailable?: boolean;
  elevatorAccess?: boolean;
}

export async function searchListings(filters: AccessibilityFilters) {
  try {
    let query = supabase.from('properties').select('*');

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.zeroStepEntry) {
      query = query.eq('zero_step_entry', true);
    }

    if (filters.rollInShower) {
      query = query.eq('roll_in_shower', true);
    }

    if (filters.wideDoors) {
      query = query.eq('wide_doors', true);
    }

    if (filters.wavAvailable) {
      query = query.eq('wav_available', true);
    }

    if (filters.elevatorAccess) {
      query = query.eq('elevator_access', true);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Search error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Search exception:', error);
    return [];
  }
}

export async function submitReport(data: {
  title: string;
  location: string;
  notes: string;
  zero_step_entry: boolean;
  roll_in_shower: boolean;
  wide_doors: boolean;
  wav_available: boolean;
  elevator_access: boolean;
}) {
  try {
    const { data: inserted, error } = await supabase
      .from('properties')
      .insert([
        {
          title: data.title,
          location: data.location,
          description: data.notes,
          zero_step_entry: data.zero_step_entry,
          roll_in_shower: data.roll_in_shower,
          wide_doors: data.wide_doors,
          wav_available: data.wav_available,
          elevator_access: data.elevator_access,
          verified: false,
          verified_on_chain: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Submit error:', error);
      throw error;
    }

    return inserted?.[0];
  } catch (error) {
    console.error('Submit exception:', error);
    throw error;
  }
}

export async function getPropertyById(id: string) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
