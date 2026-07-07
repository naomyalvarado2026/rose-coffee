import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// read .env
const envPath = path.resolve(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';

envFile.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  // Try an empty insert to see ALL missing not-null constraints at once
  // or query the DB directly if possible. Since we only have anon key, we can't query information_schema directly easily via postgrest.
  // Instead, let's just try to insert and catch the error.
  
  let payload = {
    page: 'brand_presentation',
    section: 'test_section'
  };

  const { error: e1 } = await supabase.from('page_contents').insert(payload);
  console.log("Error 1:", e1);
}

checkSchema();
