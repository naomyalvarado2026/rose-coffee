import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to manually parse .env.local
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found.');
    return;
  }
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

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gqtatqekfrswvplemknc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not defined in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedLogos() {
  console.log('Seeding Rose Coffee SVG logos to storage and database...');

  // 1. Ensure bucket 'logos' exists
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
  if (bucketsErr) {
    console.error('Error listing buckets:', bucketsErr);
    process.exit(1);
  }

  const logosBucketExists = buckets.some((b) => b.name === 'logos');
  if (!logosBucketExists) {
    console.log("Bucket 'logos' does not exist, creating it...");
    const { error: createBucketErr } = await supabase.storage.createBucket('logos', {
      public: true,
      allowedMimeTypes: ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'],
    });
    if (createBucketErr) {
      console.error('Error creating bucket:', createBucketErr);
      process.exit(1);
    }
    console.log("Bucket 'logos' created successfully.");
  } else {
    console.log("Bucket 'logos' already exists.");
  }

  // 2. Read SVGs from local folder
  const logoDir = path.resolve(__dirname, '../src/assets/logo rose coffee');
  if (!fs.existsSync(logoDir)) {
    console.error(`Local directory ${logoDir} does not exist.`);
    process.exit(1);
  }

  const files = fs.readdirSync(logoDir).filter((file) => file.endsWith('.svg'));
  console.log(`Found ${files.length} SVG files to upload.`);

  // 3. Upload each SVG and insert database record
  for (const file of files) {
    const filePath = path.join(logoDir, file);
    const fileContent = fs.readFileSync(filePath);
    
    // Clean file name for storage path
    const sanitizedName = file.replace(/\s+/g, '_').toLowerCase();
    const storagePath = `general/${sanitizedName}`;

    console.log(`Uploading ${file} to storage path ${storagePath}...`);

    // Upload to storage
    const { error: uploadErr } = await supabase.storage
      .from('logos')
      .upload(storagePath, fileContent, {
        contentType: 'image/svg+xml',
        cacheControl: '31536000',
        upsert: true,
      });

    if (uploadErr) {
      console.error(`Failed to upload ${file}:`, uploadErr);
      continue;
    }

    // Determine variant from filename / default
    // We can distribute variants round-robin or parse keywords
    let variant = 'cuadrado';
    if (file.toLowerCase().includes('vertical') || file.toLowerCase().includes('apilado')) {
      variant = 'vertical';
    } else if (file.toLowerCase().includes('horizontal') || file.toLowerCase().includes('isologo')) {
      variant = 'horizontal';
    } else if (file.toLowerCase().includes('circular') || file.toLowerCase().includes('circulo')) {
      variant = 'circular';
    } else {
      // Just vary them round-robin to make the catalog look interesting
      const num = parseInt(file);
      if (!isNaN(num)) {
        const variantsList = ['cuadrado', 'circular', 'vertical', 'horizontal'];
        variant = variantsList[num % 4];
      }
    }

    // Determine color mode
    let colorMode = 'color';
    if (file.toLowerCase().includes('blanco') && file.toLowerCase().includes('negro')) {
      colorMode = 'blanco_y_negro';
    } else if (file.toLowerCase().includes('blanco')) {
      colorMode = 'blanco_solido';
    } else if (file.toLowerCase().includes('negro')) {
      colorMode = 'negro_solido';
    } else {
      const num = parseInt(file);
      if (!isNaN(num)) {
        const modesList = ['color', 'blanco_y_negro', 'blanco_solido', 'negro_solido'];
        colorMode = modesList[num % 4];
      }
    }

    // Check if record already exists in database
    const { data: existingLogo } = await supabase
      .from('logos')
      .select('id')
      .eq('storage_path', storagePath)
      .maybeSingle();

    if (existingLogo) {
      console.log(`Database record for ${file} already exists. Skipping database insert.`);
    } else {
      // Insert metadata into table
      const { error: insertErr } = await supabase
        .from('logos')
        .insert({
          variant,
          color_mode: colorMode,
          format: 'svg',
          storage_path: storagePath,
        });

      if (insertErr) {
        console.error(`Failed to insert database record for ${file}:`, insertErr);
      } else {
        console.log(`Successfully registered ${file} in database.`);
      }
    }
  }

  console.log('Seeding finished successfully.');
}

seedLogos();
