import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    const location = searchParams.get('location');
    const zeroStepEntry = searchParams.get('zeroStepEntry') === 'true';
    const rollInShower = searchParams.get('rollInShower') === 'true';
    const wideDoors = searchParams.get('wideDoors') === 'true';
    const wavAvailable = searchParams.get('wavAvailable') === 'true';
    const elevatorAccess = searchParams.get('elevatorAccess') === 'true';

    let query = supabase
      .from('properties')
      .select('*')
      .eq('verified', true);

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (zeroStepEntry) query = query.eq('zero_step_entry', true);
    if (rollInShower) query = query.eq('roll_in_shower', true);
    if (wideDoors) query = query.eq('wide_doors', true);
    if (wavAvailable) query = query.eq('wav_available', true);
    if (elevatorAccess) query = query.eq('elevator_access', true);

    query = query.order('created_at', { ascending: false }).limit(50);

    const { data: properties, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to search properties' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: properties?.length || 0,
      properties: properties || [],
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
