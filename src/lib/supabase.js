import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const supabaseUrl =
  SUPABASE_URL || 'https://yoofymmuweehqxingnlg.supabase.co';
const supabaseAnonKey =
  SUPABASE_ANON_KEY ||
  'sb_publishable_z9t9QKn3AdqUxrtBCT6DcA_PMPscTwV';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
