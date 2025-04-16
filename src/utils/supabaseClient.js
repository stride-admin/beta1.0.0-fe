// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://phcekkbagbfhgyhfseis.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoY2Vra2JhZ2JmaGd5aGZzZWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDQ3MDcyOCwiZXhwIjoyMDYwMDQ2NzI4fQ.kImSV3i4cwodCy-9MjRMuShGRLfNskAhOhuv_Gj2qoU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
