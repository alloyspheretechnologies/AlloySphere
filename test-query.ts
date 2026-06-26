import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://uaadbvbguukcsseeyvbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWRidmJndXVrY3NzZWV5dmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMjg0ODcsImV4cCI6MjA5NTgwNDQ4N30.QngC810gDNv0k2psFDw_eYBBWZ4kAAcsdExRr0ENGoU'
);

async function testQuery() {
  const { data, error } = await supabase
    .from('pitch_requests')
    .select('*, investor:profiles!pitch_requests_investor_id_fkey(id, name, avatar_url, headline, role), startup:startups!pitch_requests_startup_id_fkey(id, name, slug)')
    .limit(1);

  console.log("Data:", data);
  console.log("Error:", error);
}

testQuery();
