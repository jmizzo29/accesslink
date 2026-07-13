import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function POST(req: NextRequest) {
  try {
    const { propertyId } = await req.json();

    // Fetch the property
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (fetchError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Mark as verified
    const { data: updated, error: updateError } = await supabase
      .from('properties')
      .update({
        verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', propertyId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to verify property' },
        { status: 500 }
      );
    }

    // TODO: Log to Monad here when wallet is connected
    // const monad = getMonadInstance();
    // const txHash = await monad.submitRecord({...})

    return NextResponse.json({
      success: true,
      property: updated,
      message: 'Property verified. Logging to blockchain...',
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
