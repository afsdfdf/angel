const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://onfplwhsmtvmkssyisot.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnBsd2hzbXR2bWtzc3lpc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjM3NzksImV4cCI6MjA2MjAzOTc3OX0.HwC1mqTWDtwOCDm1zufyyA9Xrg2pgVOElxx2JX9z9Bs'
);

(async () => {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log('users:', data, error);
})(); 