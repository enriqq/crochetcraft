import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our schema
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  status: 'Disponible' | 'Agotado' | 'Bajo pedido';
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  name: string;
  brand: string;
  color: string;
  type: 'acrílico' | 'algodón' | 'lana' | 'mixto';
  quantity: number;
  unit: 'gramos' | 'madejas' | 'metros';
  cost: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_contact: string;
  product_name: string;
  description: string;
  delivery_date: string;
  payment_status: 'Pendiente' | 'Anticipo' | 'Liquidado';
  progress_status: 'Sin empezar' | 'Tejiendo' | 'Terminado' | 'Entregado';
  price: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Abbreviation {
  code: string;
  name: string;
  description: string;
}

export interface PatternMaterial {
  name: string;
  quantity: string;
  notes?: string;
}

export interface Pattern {
  id: string;
  title: string;
  hook_size: string;
  yarn_type: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  description: string;
  image_url: string;
  notes: string;
  links: { title: string; url: string }[];
  gauge?: string;
  measurements?: string;
  abbreviations: Abbreviation[];
  pattern_materials: PatternMaterial[];
  created_at: string;
  updated_at: string;
}

export interface PatternSection {
  id: string;
  pattern_id: string;
  name: string;
  instructions: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface PatternRound {
  id: string;
  section_id: string;
  round_number: number;
  instruction: string;
  stitch_count: number;
  is_completed: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface PriceCalculation {
  id: string;
  product_name: string;
  material_cost: number;
  labor_hours: number;
  hourly_rate: number;
  margin_percentage: number;
  final_price: number;
  saved_to_inventory: boolean;
  created_at: string;
}

export interface CustomStitchCounter {
  id: string;
  name: string;
  abbr: string;
  count: number;
  color: string;
}

export interface Counter {
  id: string;
  name: string;
  current_round: number;
  target_rounds: number;
  notes: string;
  color: string;
  pb_count: number;
  aum_count: number;
  dism_count: number;
  cad_count: number;
  total_stitches: number;
  custom_counters: CustomStitchCounter[];
  created_at: string;
  updated_at: string;
}

export interface CrochetStitch {
  id: string;
  name: string;
  abbr: string;
  name_es: string;
  name_en_us: string;
  name_en_uk: string;
  description: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  uses: string;
  video_url: string;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}
