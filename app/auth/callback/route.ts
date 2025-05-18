import { createClient } from '@/app/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const userType = requestUrl.searchParams.get('userType') || 'instructor';
  
  if (code) {
    const supabase = createClient();
    
    try {
      // 1. Exchange the code for a session
      const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error('No user in session');
      
      // 2. Get the user's current metadata
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      // 3. Prepare user metadata
      const currentMetadata = user?.user_metadata || {};
      const shouldUpdateMetadata = !currentMetadata.user_type || currentMetadata.user_type !== userType;
      
      if (shouldUpdateMetadata) {
        // 4. Update user metadata with the user type
        const userMetadata = user?.user_metadata || {};
        const updateData: Record<string, any> = {
          ...currentMetadata,
          user_type: userType,
          // Preserve existing name or use one from Google
          name: currentMetadata.name || userMetadata.name || userMetadata.full_name || ''
        };
        
        const { error: updateError } = await supabase.auth.updateUser({
          data: updateData
        });
        
        if (updateError) throw updateError;
      }
      
      // 5. Redirect to the appropriate dashboard
      const redirectPath = `/${userType}/dashboard`;
      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
      
    } catch (error) {
      console.error('Error in auth callback:', error);
      // Redirect to login with error message
      const loginUrl = new URL('/auth/login', requestUrl.origin);
      loginUrl.searchParams.set('error', 'Failed to sign in. Please try again.');
      return NextResponse.redirect(loginUrl);
    }
  }

  // If there's no code, redirect to login
  const loginUrl = new URL('/auth/login', requestUrl.origin);
  loginUrl.searchParams.set('error', 'Invalid authentication code');
  return NextResponse.redirect(loginUrl);
}
