import { createClient } from '@/src/integrations/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's billing data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('billing_data')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      user,
      billingData: userData?.billing_data || null 
    })
  } catch (error) {
    console.error('Error in /api/user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 