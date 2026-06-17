import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  });
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAnonWrite() {
  console.log('Testing insert on page_contents with anon key...');
  const { data, error } = await supabase
    .from('page_contents')
    .insert({
      id: 'test_anon_id',
      page: 'contact',
      section: 'test',
      name: 'Test',
      order_index: 999,
      section_type: 'custom',
      title: 'Test Title',
      subtitle: 'Test Subtitle'
    })
    .select();

  if (error) {
    console.error('INSERT failed:', error.message);
  } else {
    console.log('INSERT succeeded:', data);
    const { error: delError } = await supabase
      .from('page_contents')
      .delete()
      .eq('id', 'test_anon_id');
    console.log('DELETE result:', delError ? delError.message : 'success');
  }
}

checkAnonWrite();
