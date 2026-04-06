import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Controleer of de URL een geldige HTTP/HTTPS URL is om crashes te voorkomen
const isValidUrl = (url: string) => {
  try {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  } catch {
    return false;
  }
};

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
  console.warn('⚠️ Supabase configuratie ontbreekt of is ongeldig. Recepten worden niet opgeslagen in de database.');
}

// Initialiseer de client alleen als de gegevens geldig zijn, anders gebruiken we een 'null' proxy
export const supabase = (supabaseUrl && isValidUrl(supabaseUrl) && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
