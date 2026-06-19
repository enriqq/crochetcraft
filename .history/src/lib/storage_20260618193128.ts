import { supabase } from './supabase';
import type { Product, Material, Order, Pattern, PatternSection, PatternRound, PriceCalculation, Abbreviation, PatternMaterial, Counter, CustomStitchCounter, CrochetStitch } from './supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'crochet_products',
  MATERIALS: 'crochet_materials',
  ORDERS: 'crochet_orders',
  PATTERNS: 'crochet_patterns',
  PATTERN_SECTIONS: 'crochet_pattern_sections',
  PATTERN_ROUNDS: 'crochet_pattern_rounds',
  PRICE_CALCULATIONS: 'crochet_price_calculations',
  COUNTERS: 'crochet_counters',
  CROCHET_STITCHES: 'crochet_stitches',
};

// Standard crochet abbreviations
const STANDARD_ABBREVIATIONS: Abbreviation[] = [
  { code: 'pb', name: 'Punto Bajo', description: 'Punto bajo o medio punto' },
  { code: 'pa', name: 'Punto Alto', description: 'Punto alto o medio punto alto' },
  { code: 'pma', name: 'Punto Medio Alto', description: 'Punto medio alto' },
  { code: 'pa2', name: 'Punto Alto Doble', description: 'Punto alto doble o vareta doble' },
  { code: 'cad', name: 'Cadeneta', description: 'Cadeneta o cadena' },
  { code: 'pe', name: 'Punto Enano', description: 'Punto enano o punto deslizado' },
  { code: 'am', name: 'Anillo Mágico', description: 'Anillo mágico o círculo mágico' },
  { code: 'aum', name: 'Aumento', description: 'Aumento (2 puntos en el mismo espacio)' },
  { code: 'dis', name: 'Disminución', description: 'Disminución (2 puntos juntos)' },
  { code: 'pa2j', name: 'Puntos Altos 2 Juntos', description: 'Dos puntos alto tejidos juntos' },
  { code: 'pr', name: 'Punto Raso', description: 'Punto raso o punto deslizado' },
  { code: 'pf', name: 'Punto Piña', description: 'Punto piña o punto popcorn' },
  { code: 'pg', name: 'Punto Abultado', description: 'Punto abultado o punto bobble' },
  { code: 'vta', name: 'Vuelta', description: 'Vuelta o vuelta en circular' },
  { code: 'det', name: 'Detrás', description: 'Tejer por detrás del punto' },
  { code: 'del', name: 'Delante', description: 'Tejer por delante del punto' },
  { code: '*', name: 'Repetir', description: 'Repetir instrucciones entre asteriscos' },
  { code: '()', name: 'Total puntos', description: 'Número total de puntos al final de la vuelta' },
  { code: '[]', name: 'Talla', description: 'Instrucciones para talla específica' },
];

class StorageManager {
  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.error('Error fetching products from Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return stored ? JSON.parse(stored) : [];
  }

  async saveProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const now = new Date().toISOString();
    const newProduct = { ...product, id: crypto.randomUUID(), created_at: now, updated_at: now } as Product;
    try {
      const { error } = await supabase.from('products').insert([newProduct]);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving product to Supabase:', error);
    }
    const stored = await this.getProducts();
    stored.unshift(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(stored));
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const now = new Date().toISOString();
    try {
      const { error } = await supabase.from('products').update({ ...updates, updated_at: now }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating product in Supabase:', error);
    }
    const stored = await this.getProducts();
    const index = stored.findIndex(p => p.id === id);
    if (index !== -1) {
      stored[index] = { ...stored[index], ...updates, updated_at: now };
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(stored));
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product from Supabase:', error);
    }
    const stored = await this.getProducts();
    const filtered = stored.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  }

  // Materials
  async getMaterials(): Promise<Material[]> {
    try {
      const { data, error } = await supabase.from('materials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.error('Error fetching materials from Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    return stored ? JSON.parse(stored) : [];
  }

  async saveMaterial(material: Omit<Material, 'id' | 'created_at' | 'updated_at'>): Promise<Material> {
    const now = new Date().toISOString();
    const newMaterial = { ...material, id: crypto.randomUUID(), created_at: now, updated_at: now } as Material;
    try {
      const { error } = await supabase.from('materials').insert([newMaterial]);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving material to Supabase:', error);
    }
    const stored = await this.getMaterials();
    stored.unshift(newMaterial);
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(stored));
    return newMaterial;
  }

  async updateMaterial(id: string, updates: Partial<Material>): Promise<void> {
    const now = new Date().toISOString();
    try {
      const { error } = await supabase.from('materials').update({ ...updates, updated_at: now }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating material in Supabase:', error);
    }
    const stored = await this.getMaterials();
    const index = stored.findIndex(m => m.id === id);
    if (index !== -1) {
      stored[index] = { ...stored[index], ...updates, updated_at: now };
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(stored));
    }
  }

  async deleteMaterial(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting material from Supabase:', error);
    }
    const stored = await this.getMaterials();
    const filtered = stored.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(filtered));
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('delivery_date', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.error('Error fetching orders from Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return stored ? JSON.parse(stored) : [];
  }

  async saveOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const now = new Date().toISOString();
    const newOrder = { ...order, id: crypto.randomUUID(), created_at: now, updated_at: now } as Order;
    try {
      const { error } = await supabase.from('orders').insert([newOrder]);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving order to Supabase:', error);
    }
    const stored = await this.getOrders();
    stored.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(stored));
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    const now = new Date().toISOString();
    try {
      const { error } = await supabase.from('orders').update({ ...updates, updated_at: now }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating order in Supabase:', error);
    }
    const stored = await this.getOrders();
    const index = stored.findIndex(o => o.id === id);
    if (index !== -1) {
      stored[index] = { ...stored[index], ...updates, updated_at: now };
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(stored));
    }
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting order from Supabase:', error);
    }
    const stored = await this.getOrders();
    const filtered = stored.filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filtered));
  }

  // Patterns
  async getPatterns(): Promise<Pattern[]> {
    try {
      const { data, error } = await supabase.from('patterns').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.error('Error fetching patterns from Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.PATTERNS);
    return stored ? JSON.parse(stored) : [];
  }

  async savePattern(pattern: Omit<Pattern, 'id' | 'created_at' | 'updated_at'>): Promise<Pattern> {
    const now = new Date().toISOString();
    const newPattern = { ...pattern, id: crypto.randomUUID(), created_at: now, updated_at: now } as Pattern;
    try {
      const { error } = await supabase.from('patterns').insert([newPattern]);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving pattern to Supabase:', error);
    }
    const stored = await this.getPatterns();
    stored.unshift(newPattern);
    localStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(stored));
    return newPattern;
  }

  async updatePattern(id: string, updates: Partial<Pattern>): Promise<void> {
    const now = new Date().toISOString();
    try {
      const { error } = await supabase.from('patterns').update({ ...updates, updated_at: now }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating pattern in Supabase:', error);
    }
    const stored = await this.getPatterns();
    const index = stored.findIndex(p => p.id === id);
    if (index !== -1) {
      stored[index] = { ...stored[index], ...updates, updated_at: now };
      localStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(stored));
    }
  }

  async deletePattern(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('patterns').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting pattern from Supabase:', error);
    }
    const stored = await this.getPatterns();
    const filtered = stored.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(filtered));
  }

  // Pattern Sections
  async getPatternSections(patternId: string): Promise<PatternSection[]> {
    try {
      const { data, error } = await supabase.from('pattern_sections').select('*').eq('pattern_id', patternId).order('order', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.error('Error fetching pattern sections from Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.PATTERN_SECTIONS);
    const allSections: PatternSection[] = stored ? JSON.parse(stored) : [];
    return allSections.filter(s => s.pattern_id === patternId).sort((a, b) => a.order - b.order);
  }

  async savePatternSection(section: Omit<PatternSection, 'id' | 'created_at' | 'updated_at'>): Promise<PatternSection> {
    const now = new Date().toISOString();
    const newSection = { ...section, id: crypto.randomUUID(), created_at: now, updated_at: now } as PatternSection;
    try {
      const { error } = await supabase.from('pattern_sections').insert([newSection]);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving pattern section to Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.PATTERN_SECTIONS);
    const allSections: PatternSection[] = stored ? JSON.parse(stored) : [];
    allSections.push(newSection);
    localStorage.setItem(STORAGE_KEYS.PATTERN_SECTIONS, JSON.stringify(allSections));
    return newSection;
  }

  async updatePatternSection(id: string, updates: Partial<PatternSection>): Promise<void> {
    const now = new Date().toISOString();
    try {
      const { error } = await supabase.from('pattern_sections').update({ ...updates, updated_at: now }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating pattern section in Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.PATTERN_SECTIONS);
    const allSections: PatternSection[] = stored ? JSON.parse(stored) : [];
    const index = allSections.findIndex(s => s.id === id);
    if (index !== -1) {
      allSections[index] = { ...allSections[index], ...updates, updated_at: now };
      localStorage.setItem(STORAGE_KEYS.PATTERN_SECTIONS, JSON.stringify(allSections));
    }
  }

  async deletePatternSection(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('pattern_sections').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting pattern section from Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.PATTERN_SECTIONS);
    const allSections: PatternSection[] = stored ? JSON.parse(stored) : [];
    const filtered = allSections.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.PATTERN_SECTIONS, JSON.stringify(filtered));
  }

  // Pattern Rounds
  async getPatternRounds(sectionId: string): Promise<PatternRound[]> {
    try {
      const { data, error } = await supabase.from('pattern_rounds').select('*').eq('section_id', sectionId).order('round_number', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.error('Error fetching pattern rounds from Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.PATTERN_ROUNDS);
    const allRounds: PatternRound[] = stored ? JSON.parse(stored) : [];
    return allRounds.filter(r => r.section_id === sectionId).sort((a, b) => a.round_number - b.round_number);
  }

  async savePatternRound(round: Omit<PatternRound, 'id' | 'created_at' | 'updated_at'>): Promise<PatternRound> {
    const now = new Date().toISOString();
    const newRound = { ...round, id: crypto.randomUUID(), created_at: now, updated_at: now } as PatternRound;
    try {
      const { error } = await supabase.from('pattern_rounds').insert([newRound]);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving pattern round to Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.PATTERN_ROUNDS);
    const allRounds: PatternRound[] = stored ? JSON.parse(stored) : [];
    allRounds.push(newRound);
    localStorage.setItem(STORAGE_KEYS.PATTERN_ROUNDS, JSON.stringify(allRounds));
    return newRound;
  }

  async updatePatternRound(id: string, updates: Partial<PatternRound>): Promise<void> {
    const now = new Date().toISOString();
    try {
      const { error } = await supabase.from('pattern_rounds').update({ ...updates, updated_at: now }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating pattern round in Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.PATTERN_ROUNDS);
    const allRounds: PatternRound[] = stored ? JSON.parse(stored) : [];
    const index = allRounds.findIndex(r => r.id === id);
    if (index !== -1) {
      allRounds[index] = { ...allRounds[index], ...updates, updated_at: now };
      localStorage.setItem(STORAGE_KEYS.PATTERN_ROUNDS, JSON.stringify(allRounds));
    }
  }

  async toggleRoundComplete(id: string, isCompleted: boolean): Promise<void> {
    await this.updatePatternRound(id, { is_completed: isCompleted });
  }

  async deletePatternRound(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('pattern_rounds').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting pattern round from Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.PATTERN_ROUNDS);
    const allRounds: PatternRound[] = stored ? JSON.parse(stored) : [];
    const filtered = allRounds.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.PATTERN_ROUNDS, JSON.stringify(filtered));
  }

  async saveRoundsBatch(rounds: Omit<PatternRound, 'id' | 'created_at' | 'updated_at'>[]): Promise<PatternRound[]> {
    const now = new Date().toISOString();
    const newRounds = rounds.map(r => ({
      ...r,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    })) as PatternRound[];

    try {
      const { error } = await supabase.from('pattern_rounds').insert(newRounds);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving rounds batch to Supabase:', error);
    }

    const stored = localStorage.getItem(STORAGE_KEYS.PATTERN_ROUNDS);
    const allRounds: PatternRound[] = stored ? JSON.parse(stored) : [];
    allRounds.push(...newRounds);
    localStorage.setItem(STORAGE_KEYS.PATTERN_ROUNDS, JSON.stringify(allRounds));

    return newRounds;
  }

  // Price Calculations
  async savePriceCalculation(calc: Omit<PriceCalculation, 'id' | 'created_at'>): Promise<PriceCalculation> {
    const now = new Date().toISOString();
    const newCalc = { ...calc, id: crypto.randomUUID(), created_at: now } as PriceCalculation;
    try {
      const { error } = await supabase.from('price_calculations').insert([newCalc]);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving price calculation to Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.PRICE_CALCULATIONS);
    const allCalcs: PriceCalculation[] = stored ? JSON.parse(stored) : [];
    allCalcs.unshift(newCalc);
    localStorage.setItem(STORAGE_KEYS.PRICE_CALCULATIONS, JSON.stringify(allCalcs));
    return newCalc;
  }

  getStandardAbbreviations(): Abbreviation[] {
    return STANDARD_ABBREVIATIONS;
  }

  async seedMockData(): Promise<void> {
    const products = await this.getProducts();
    const materials = await this.getMaterials();
    const orders = await this.getOrders();
    const patterns = await this.getPatterns();

    if (products.length === 0 && materials.length === 0 && orders.length === 0 && patterns.length === 0) {
      await this.seedProducts();
      await this.seedMaterials();
      await this.seedOrders();
      await this.seedPatterns();
    }
  }

  private async seedProducts(): Promise<void> {
    /*const mockProducts = [
      { name: 'Amigurumi de Oso Panda', description: 'Tierno osito panda tejido a mano con lana de algodón', category: 'Amigurumi', quantity: 5, price: 45.00, status: 'Disponible' as const },
      { name: 'Ramo de Rosas Tejidas', description: 'Hermoso ramo de 7 rosas en tonos pastel', category: 'Ramo', quantity: 2, price: 65.00, status: 'Disponible' as const },
      { name: 'Llavero de Gatito', description: 'Llavero adorable de gatito con ojos de seguridad', category: 'Llavero', quantity: 12, price: 18.00, status: 'Disponible' as const },
      { name: 'Amigurumi de Conejito', description: 'Conejito suave con vestido tejido', category: 'Amigurumi', quantity: 0, price: 42.00, status: 'Agotado' as const },
      { name: 'Cojín Decorativo Floral', description: 'Cojín con aplicaciones de flores tejidas', category: 'Hogar', quantity: 3, price: 55.00, status: 'Disponible' as const },
      { name: 'Amigurumi de León', description: 'León valiente con melena exuberante', category: 'Amigurumi', quantity: 2, price: 50.00, status: 'Bajo pedido' as const },
      { name: 'Topper de Torta', description: 'Número 1 decorativo para tortas', category: 'Topper', quantity: 8, price: 25.00, status: 'Disponible' as const },
      { name: 'Bufanda de Ondas', description: 'Bufanda elegante en degradé de colores', category: 'Accesorios', quantity: 1, price: 38.00, status: 'Disponible' as const },
    ];

    for (const product of mockProducts) {
      await this.saveProduct(product);
    }*/
  }

  private async seedMaterials(): Promise<void> {
    const mockMaterials = [
      { name: 'Hilo de Algodón', brand: 'Hilaza', color: 'Rosa Pastel', type: 'algodón' as const, quantity: 500, unit: 'gramos' as const, cost: 12.50 },
      { name: 'Hilo Acrílico Premium', brand: 'YarnArt', color: 'Verde Menta', type: 'acrílico' as const, quantity: 800, unit: 'gramos' as const, cost: 18.00 },
      { name: 'Lana Merino', brand: 'Drops', color: 'Natural Beige', type: 'lana' as const, quantity: 300, unit: 'gramos' as const, cost: 25.00 },
      { name: 'Hilo de Algodón', brand: 'Hilaza', color: 'Azul Cielo', type: 'algodón' as const, quantity: 350, unit: 'gramos' as const, cost: 12.50 },
      { name: 'Hilo Multicolor', brand: 'YarnArt', color: 'Arcoíris', type: 'acrílico' as const, quantity: 2, unit: 'madejas' as const, cost: 22.00 },
      { name: 'Ojos de Seguridad', brand: 'Amigurumi Eyes', color: 'Negro', type: 'mixto' as const, quantity: 50, unit: 'metros' as const, cost: 15.00 },
      { name: 'Relleno de Fibra', brand: 'Poly-Fil', color: 'Blanco', type: 'mixto' as const, quantity: 1000, unit: 'gramos' as const, cost: 8.00 },
      { name: 'Agujas de Ganchillo', brand: 'Clover', color: 'Aluminio', type: 'mixto' as const, quantity: 5, unit: 'metros' as const, cost: 12.00 },
    ];

    for (const material of mockMaterials) {
      await this.saveMaterial(material);
    }
  }

  private async seedOrders(): Promise<void> {
    const today = new Date();
    const mockOrders = [
      { customer_name: 'María García', customer_contact: 'maria@email.com', product_name: 'Amigurumi de Jirafa Personalizado', description: 'Jirafa con collar de corazones, colores cálidos', delivery_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], payment_status: 'Anticipo' as const, progress_status: 'Tejiendo' as const, price: 55.00, notes: 'Cliente quiere que el collar sea removible' },
      { customer_name: 'Carlos Pérez', customer_contact: '311-234-5678', product_name: 'Set de 5 Llaveros', description: '5 llaveros de animales diferentes para regalo', delivery_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], payment_status: 'Pendiente' as const, progress_status: 'Sin empezar' as const, price: 75.00, notes: 'Se necesita para cumpleaños el 15' },
      { customer_name: 'Ana Martínez', customer_contact: 'ana.m@gmail.com', product_name: 'Ramo de Girasoles', description: 'Ramo de 12 girasoles tejidos para decoración', delivery_date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], payment_status: 'Liquidado' as const, progress_status: 'Terminado' as const, price: 85.00, notes: 'Para entregar mañana antes del mediodía' },
      { customer_name: 'Roberto Gómez', customer_contact: '456-789-0123', product_name: 'Amigurumi de Dragón', description: 'Dragón de fantasia con alas detalladas', delivery_date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], payment_status: 'Liquidado' as const, progress_status: 'Tejiendo' as const, price: 70.00, notes: 'Espera pacientemente, no hay urgencia' },
    ];

    for (const order of mockOrders) {
      await this.saveOrder(order);
    }
  }

  private async seedPatterns(): Promise<void> {
    // Pattern 1: Amigurumi de León
    const lionPattern = await this.savePattern({
      title: 'Amigurumi de León',
      hook_size: '3.5mm',
      yarn_type: 'Algodón (Sport/DK)',
      difficulty: 'Intermedio',
      description: 'León tierno con melena exuberante y detalles adorables. Perfecto para regalar o decorar el cuarto de los más pequeños.',
      notes: 'Para un acabado más suave, usar hilo de algodón mercerizado. Rellenar firmemente para que mantenga la forma.',
      gauge: '8 pb = 2.5 cm (1 pulgada); 8 filas = 2.5 cm',
      measurements: 'Altura final: aproximadamente 15 cm (sentado)',
      abbreviations: STANDARD_ABBREVIATIONS.filter(abbr =>
          ['pb', 'aum', 'dis', 'cad', 'am', '*', '()'].includes(abbr.code)
      ),
      pattern_materials: [
        { name: 'Hilo de algodón', quantity: '100g', notes: 'Color amarillo/dorado para el cuerpo' },
        { name: 'Hilo de algodón', quantity: '50g', notes: 'Color marrón para la melena' },
        { name: 'Hilo negro', quantity: 'poco', notes: 'Para bordar la nariz y boca' },
        { name: 'Ojos de seguridad', quantity: '2 pares', notes: '10mm o 12mm' },
        { name: 'Relleno de fibra', quantity: '100g', notes: 'Polyfil o similar' },
      ],
      links: [
        { title: 'Tutorial YouTube - Melena', url: 'https://youtube.com/example' },
        { title: 'Pinterest - Inspiración', url: 'https://pinterest.com/example' },
      ],
    });

    // Sections and rounds for León
    const headSection = await this.savePatternSection({
      pattern_id: lionPattern.id,
      name: 'Cabeza',
      instructions: 'Comenzar con anillo mágico. Tejer en espiral, marcar el inicio de cada vuelta.',
      order: 1,
    });

    const headRounds = [
      { section_id: headSection.id, round_number: 1, instruction: '6 pb en anillo mágico (6)', stitch_count: 6, is_completed: false },
      { section_id: headSection.id, round_number: 2, instruction: '*1 aum* en cada punto (12)', stitch_count: 12, is_completed: false },
      { section_id: headSection.id, round_number: 3, instruction: '*1 pb, 1 aum* repetir 6 veces (18)', stitch_count: 18, is_completed: false },
      { section_id: headSection.id, round_number: 4, instruction: '*1 pb en 2 pts, 1 aum* repetir 6 veces (24)', stitch_count: 24, is_completed: false },
      { section_id: headSection.id, round_number: 5, instruction: '*1 pb en 3 pts, 1 aum* repetir 6 veces (30)', stitch_count: 30, is_completed: false },
      { section_id: headSection.id, round_number: 6, instruction: '*1 pb en 4 pts, 1 aum* repetir 6 veces (36)', stitch_count: 36, is_completed: false },
      { section_id: headSection.id, round_number: 7, instruction: '*1 pb en 5 pts, 1 aum* repetir 6 veces (42)', stitch_count: 42, is_completed: false },
      { section_id: headSection.id, round_number: 8, instruction: '1 pb en cada punto (42)', stitch_count: 42, is_completed: false },
      { section_id: headSection.id, round_number: 9, instruction: '1 pb en cada punto (42)', stitch_count: 42, is_completed: false },
      { section_id: headSection.id, round_number: 10, instruction: 'Colocar ojos de seguridad entre vueltas 8-9, separados por 8 puntos', stitch_count: 42, is_completed: false },
      { section_id: headSection.id, round_number: 11, instruction: '1 pb en cada punto (42)', stitch_count: 42, is_completed: false },
      { section_id: headSection.id, round_number: 12, instruction: '*1 pb en 5 pts, 1 dis* repetir 6 veces (36)', stitch_count: 36, is_completed: false },
      { section_id: headSection.id, round_number: 13, instruction: '*1 pb en 4 pts, 1 dis* repetir 6 veces (30)', stitch_count: 30, is_completed: false },
      { section_id: headSection.id, round_number: 14, instruction: 'Rellenar la cabeza firmemente', stitch_count: 30, is_completed: false },
    ];
    await this.saveRoundsBatch(headRounds);

    const maneSection = await this.savePatternSection({
      pattern_id: lionPattern.id,
      name: 'Melena',
      instructions: 'Unir hebras de lana marrón alrededor de la cabeza para crear la melena exuberante. Usar técnica de "fluff" o bucles.',
      order: 2,
    });

    const maneRounds = [
      { section_id: maneSection.id, round_number: 1, instruction: 'Cortar hebras de 10cm de lana marrón', stitch_count: 0, is_completed: false, notes: 'Necesitarás aproximadamente 100 hebras' },
      { section_id: maneSection.id, round_number: 2, instruction: 'Doblar hebra por la mitad, insertar gancho en punto, tirar del lazo', stitch_count: 0, is_completed: false },
      { section_id: maneSection.id, round_number: 3, instruction: 'Continuar alrededor de la cabeza, detrás de los ojos', stitch_count: 0, is_completed: false },
      { section_id: maneSection.id, round_number: 4, instruction: 'Cubrir 3-4 filas para melena completa', stitch_count: 0, is_completed: false },
      { section_id: maneSection.id, round_number: 5, instruction: 'Cepillar ligeramente para dar volumen', stitch_count: 0, is_completed: false },
    ];
    await this.saveRoundsBatch(maneRounds);

    const bodySection = await this.savePatternSection({
      pattern_id: lionPattern.id,
      name: 'Cuerpo',
      instructions: 'Tejer en espiral sin cerrar vueltas. Rellenar gradualmente.',
      order: 3,
    });

    const bodyRounds = [
      { section_id: bodySection.id, round_number: 1, instruction: '6 pb en anillo mágico (6)', stitch_count: 6, is_completed: false },
      { section_id: bodySection.id, round_number: 2, instruction: '*1 aum* en cada punto (12)', stitch_count: 12, is_completed: false },
      { section_id: bodySection.id, round_number: 3, instruction: '*1 pb, 1 aum* repetir 6 veces (18)', stitch_count: 18, is_completed: false },
      { section_id: bodySection.id, round_number: 4, instruction: '*1 pb en 2 pts, 1 aum* repetir 6 veces (24)', stitch_count: 24, is_completed: false },
      { section_id: bodySection.id, round_number: 5, instruction: '*1 pb en 3 pts, 1 aum* repetir 6 veces (30)', stitch_count: 30, is_completed: false },
      { section_id: bodySection.id, round_number: 6, instruction: '1 pb en cada punto (30)', stitch_count: 30, is_completed: false },
      { section_id: bodySection.id, round_number: 7, instruction: '1 pb en cada punto (30)', stitch_count: 30, is_completed: false },
      { section_id: bodySection.id, round_number: 8, instruction: '1 pb en cada punto (30) - comenzar a rellenar', stitch_count: 30, is_completed: false },
      { section_id: bodySection.id, round_number: 9, instruction: '1 pb en cada punto (30)', stitch_count: 30, is_completed: false },
      { section_id: bodySection.id, round_number: 10, instruction: '*1 pb en 3 pts, 1 dis* repetir 6 veces (24)', stitch_count: 24, is_completed: false },
      { section_id: bodySection.id, round_number: 11, instruction: '*1 pb en 2 pts, 1 dis* repetir 6 veces (18)', stitch_count: 18, is_completed: false },
      { section_id: bodySection.id, round_number: 12, instruction: 'Rellenar firmemente, cerrar con punto enano', stitch_count: 18, is_completed: false },
    ];
    await this.saveRoundsBatch(bodyRounds);

    const legsSection = await this.savePatternSection({
      pattern_id: lionPattern.id,
      name: 'Patas (hacer 4)',
      instructions: 'Tejer 4 patas iguales. Rellenar firmemente. Coser al cuerpo.',
      order: 4,
    });

    const legsRounds = [
      { section_id: legsSection.id, round_number: 1, instruction: '6 pb en anillo mágico (6)', stitch_count: 6, is_completed: false },
      { section_id: legsSection.id, round_number: 2, instruction: '*1 aum* en cada punto (12)', stitch_count: 12, is_completed: false },
      { section_id: legsSection.id, round_number: 3, instruction: '*1 pb, 1 aum* repetir 6 veces (18)', stitch_count: 18, is_completed: false },
      { section_id: legsSection.id, round_number: 4, instruction: '*1 pb en 2 pts, 1 dis* repetir 6 veces (12)', stitch_count: 12, is_completed: false, notes: 'Aquí se forma la pezuña' },
      { section_id: legsSection.id, round_number: 5, instruction: '1 pb en cada punto (12)', stitch_count: 12, is_completed: false },
      { section_id: legsSection.id, round_number: 6, instruction: '1 pb en cada punto (12)', stitch_count: 12, is_completed: false },
      { section_id: legsSection.id, round_number: 7, instruction: 'Rellenar y dejar cola larga para coser', stitch_count: 12, is_completed: false },
    ];
    await this.saveRoundsBatch(legsRounds);

    const tailSection = await this.savePatternSection({
      pattern_id: lionPattern.id,
      name: 'Cola',
      instructions: 'Cola con punta de brush para efecto peludo. Similar a la melena.',
      order: 5,
    });

    const tailRounds = [
      { section_id: tailSection.id, round_number: 1, instruction: '6 pb en anillo mágico (6) - luego hacer cadena de 15', stitch_count: 6, is_completed: false },
      { section_id: tailSection.id, round_number: 2, instruction: 'Insertar hebras de lana marrón en la punta', stitch_count: 0, is_completed: false },
      { section_id: tailSection.id, round_number: 3, instruction: 'Cepillar para crear efecto de brush', stitch_count: 0, is_completed: false },
      { section_id: tailSection.id, round_number: 4, instruction: 'Coser al cuerpo en la parte trasera', stitch_count: 0, is_completed: false },
    ];
    await this.saveRoundsBatch(tailRounds);

    const assemblySection = await this.savePatternSection({
      pattern_id: lionPattern.id,
      name: 'Ensamblaje Final',
      instructions: 'Unir todas las piezas y dar los acabados finales.',
      order: 6,
    });

    const assemblyRounds = [
      { section_id: assemblySection.id, round_number: 1, instruction: 'Coser cabeza al cuerpo, centrada', stitch_count: 0, is_completed: false },
      { section_id: assemblySection.id, round_number: 2, instruction: 'Coser las 4 patas en posición de sentado', stitch_count: 0, is_completed: false, notes: 'Las patas delanteras más juntas' },
      { section_id: assemblySection.id, round_number: 3, instruction: 'Bordar nariz y boca con hilo negro', stitch_count: 0, is_completed: false },
      { section_id: assemblySection.id, round_number: 4, instruction: 'Pegar o coser la melena si es necesario', stitch_count: 0, is_completed: false },
      { section_id: assemblySection.id, round_number: 5, instruction: 'Insertar cola en la parte trasera', stitch_count: 0, is_completed: false },
      { section_id: assemblySection.id, round_number: 6, instruction: 'Revisar y ajustar relleno final', stitch_count: 0, is_completed: false },
    ];
    await this.saveRoundsBatch(assemblyRounds);

    // Pattern 2: Ramo de Girasoles
    const sunflowerPattern = await this.savePattern({
      title: 'Ramo de Girasoles',
      hook_size: '4.0mm',
      yarn_type: 'Algodón (Worsted/Aran)',
      difficulty: 'Intermedio',
      description: 'Girasoles realistas con pétalos tridimensionales. Perfectos para decoración o regalos eternos.',
      notes: 'Usar alambre floral para los tallos. Combinar girasoles de diferentes tamaños para un ramo más natural.',
      gauge: '6 pb = 2.5 cm (1 pulgada)',
      measurements: 'Cada flor: 12-15 cm de diámetro; Tallo: 25-30 cm',
      abbreviations: STANDARD_ABBREVIATIONS.filter(abbr =>
        ['pb', 'pa', 'cad', 'pe', 'am', '*', '()'].includes(abbr.code)
      ),
      pattern_materials: [
        { name: 'Hilo de algodón amarillo', quantity: '200g', notes: 'Para los pétalos' },
        { name: 'Hilo de algodón marrón', quantity: '100g', notes: 'Para el centro' },
        { name: 'Hilo verde', quantity: '100g', notes: 'Para hojas y tallos' },
        { name: 'Alambre floral', quantity: '12 varas', notes: 'Calibre 18-20' },
        { name: 'Cinta floral verde', quantity: '1 rollo', notes: 'Para forrar tallos' },
      ],
      links: [
        { title: 'Video Tutorial', url: 'https://youtube.com/sunflower-example' },
      ],
    });

    const centerSection = await this.savePatternSection({
      pattern_id: sunflowerPattern.id,
      name: 'Centro de la Flor',
      instructions: 'Centro marrón en relieve. Trabajado en espiral.',
      order: 1,
    });

    const centerRounds = [
      { section_id: centerSection.id, round_number: 1, instruction: '6 pb en anillo mágico (6)', stitch_count: 6, is_completed: false },
      { section_id: centerSection.id, round_number: 2, instruction: '*1 aum* en cada punto (12)', stitch_count: 12, is_completed: false },
      { section_id: centerSection.id, round_number: 3, instruction: '*1 pb, 1 aum* repetir 6 veces (18)', stitch_count: 18, is_completed: false },
      { section_id: centerSection.id, round_number: 4, instruction: '*1 pb en 2 pts, 1 aum* repetir 6 veces (24)', stitch_count: 24, is_completed: false },
      { section_id: centerSection.id, round_number: 5, instruction: '*1 pb en 3 pts, 1 aum* repetir 6 veces (30)', stitch_count: 30, is_completed: false },
      { section_id: centerSection.id, round_number: 6, instruction: 'Solo en lazo trasero: 1 pb en cada punto (30)', stitch_count: 30, is_completed: false, notes: 'Esto crea el borde para unir pétalos luego' },
      { section_id: centerSection.id, round_number: 7, instruction: '1 pb en cada punto en ambos lazos (30)', stitch_count: 30, is_completed: false },
      { section_id: centerSection.id, round_number: 8, instruction: '*1 pb en 3 pts, 1 dis* repetir 6 veces (24)', stitch_count: 24, is_completed: false },
      { section_id: centerSection.id, round_number: 9, instruction: 'Rellenar ligeramente, comenzar a insertar alambre', stitch_count: 24, is_completed: false },
      { section_id: centerSection.id, round_number: 10, instruction: 'Cerrar con punto enano, dejar cola larga', stitch_count: 24, is_completed: false },
    ];
    await this.saveRoundsBatch(centerRounds);

    const petalsSection = await this.savePatternSection({
      pattern_id: sunflowerPattern.id,
      name: 'Pétalos (hacer 18-24)',
      instructions: 'Tejer pétalos individuales y coser alrededor del centro. Pueden ser una o dos capas.',
      order: 2,
    });

    const petalsRounds = [
      { section_id: petalsSection.id, round_number: 1, instruction: 'Cad 11', stitch_count: 11, is_completed: false },
      { section_id: petalsSection.id, round_number: 2, instruction: 'Comenzar en 2da cad: 1 pb, 2 pma, 3 pa, 2 pma, 1 pb', stitch_count: 9, is_completed: false },
      { section_id: petalsSection.id, round_number: 3, instruction: 'Cad 1, girar: 1 pb en cada punto, pe al final', stitch_count: 9, is_completed: false },
      { section_id: petalsSection.id, round_number: 4, instruction: 'Dejar cola larga para coser', stitch_count: 9, is_completed: false, notes: 'Cada pétalo mide aproximadamente 5cm' },
      { section_id: petalsSection.id, round_number: 5, instruction: 'Coser pétalos en el lazo trasero de la vuelta 6 del centro', stitch_count: 0, is_completed: false },
      { section_id: petalsSection.id, round_number: 6, instruction: 'Para segunda capa: repetir en el lazo frontal de vuelta 6', stitch_count: 0, is_completed: false },
    ];
    await this.saveRoundsBatch(petalsRounds);

    const stemSection = await this.savePatternSection({
      pattern_id: sunflowerPattern.id,
      name: 'Tallo',
      instructions: 'Tejer alrededor del alambre floral forrado.',
      order: 3,
    });

    const stemRounds = [
      { section_id: stemSection.id, round_number: 1, instruction: 'Cad 6, unir con pe', stitch_count: 6, is_completed: false },
      { section_id: stemSection.id, round_number: 2, instruction: '1 pb en cada punto, en espiral', stitch_count: 6, is_completed: false, notes: 'Repetir hasta altura deseada (25-30cm)' },
      { section_id: stemSection.id, round_number: 3, instruction: 'Insertar alambre floral y rellenar ligeramente', stitch_count: 6, is_completed: false },
      { section_id: stemSection.id, round_number: 4, instruction: 'Coser al centro de la flor', stitch_count: 0, is_completed: false },
    ];
    await this.saveRoundsBatch(stemRounds);

    const leavesSection = await this.savePatternSection({
      pattern_id: sunflowerPattern.id,
      name: 'Hojas (hacer 2 por flor)',
      instructions: 'Hojas en dos tamaños para variedad.',
      order: 4,
    });

    const leavesRounds = [
      { section_id: leavesSection.id, round_number: 1, instruction: 'Cad 9 (hoja pequeña) o 13 (hoja grande)', stitch_count: 9, is_completed: false },
      { section_id: leavesSection.id, round_number: 2, instruction: '1 pb en 2da cad, *1 aum, 1 pb* al centro, 3 pb en último punto', stitch_count: 10, is_completed: false },
      { section_id: leavesSection.id, round_number: 3, instruction: 'Girar y trabajar el otro lado en espejo', stitch_count: 10, is_completed: false },
      { section_id: leavesSection.id, round_number: 4, instruction: 'Cad 1 como tallo, coser al tallo principal', stitch_count: 0, is_completed: false },
    ];
    await this.saveRoundsBatch(leavesRounds);

    // Pattern 3: Amigurumi de Gato (Easy beginner pattern)
    const catPattern = await this.savePattern({
      title: 'Amigurumi de Gato Básico',
      hook_size: '3.0mm',
      yarn_type: 'Algodón (Sport)',
      difficulty: 'Fácil',
      description: 'Gatito básico perfecto para principiantes. Ideal para practicar aumentos y disminuciones.',
      notes: 'Puedes personalizar los colores para hacer gatitos de diferentes razas.',
      gauge: '10 pb = 2.5 cm (1 pulgada)',
      measurements: 'Altura: 12-15 cm',
      abbreviations: STANDARD_ABBREVIATIONS.filter(abbr =>
        ['pb', 'aum', 'dis', 'cad', 'am', '*', '()'].includes(abbr.code)
      ),
      pattern_materials: [
        { name: 'Hilo de algodón', quantity: '100g', notes: 'Color principal' },
        { name: 'Hilo contrastante', quantity: '20g', notes: 'Para orejas y detalles' },
        { name: 'Ojos de seguridad', quantity: '1 par', notes: '8mm' },
        { name: 'Relleno', quantity: '80g', notes: 'Fibra de polyfil' },
      ],
      links: [
        { title: 'Tutorial paso a paso', url: 'https://youtube.com/cat-tutorial' },
      ],
    });

    const catHead = await this.savePatternSection({
      pattern_id: catPattern.id,
      name: 'Cabeza y Cuerpo',
      instructions: 'Se tejen juntos en una sola pieza para simplificar.',
      order: 1,
    });

    const catHeadRounds = [
      { section_id: catHead.id, round_number: 1, instruction: '6 pb en anillo mágico (6)', stitch_count: 6, is_completed: false },
      { section_id: catHead.id, round_number: 2, instruction: '*1 aum* en cada punto (12)', stitch_count: 12, is_completed: false },
      { section_id: catHead.id, round_number: 3, instruction: '*1 pb, 1 aum* repetir (18)', stitch_count: 18, is_completed: false },
      { section_id: catHead.id, round_number: 4, instruction: '*1 pb en 2 pts, 1 aum* repetir (24)', stitch_count: 24, is_completed: false },
      { section_id: catHead.id, round_number: 5, instruction: '*1 pb en 3 pts, 1 aum* repetir (30)', stitch_count: 30, is_completed: false },
      { section_id: catHead.id, round_number: 6, instruction: '1 pb en cada punto (30)', stitch_count: 30, is_completed: false },
      { section_id: catHead.id, round_number: 7, instruction: '1 pb en cada punto (30) - insertar ojos', stitch_count: 30, is_completed: false, notes: 'Ojos entre vueltas 6-7, 6 pts separados' },
      { section_id: catHead.id, round_number: 8, instruction: '*1 pb en 3 pts, 1 dis* repetir (24)', stitch_count: 24, is_completed: false },
      { section_id: catHead.id, round_number: 9, instruction: '*1 pb en 2 pts, 1 dis* repetir (18)', stitch_count: 18, is_completed: false, notes: 'Comenzar a rellenar' },
    ];
    await this.saveRoundsBatch(catHeadRounds);

    const catEars = await this.savePatternSection({
      pattern_id: catPattern.id,
      name: 'Orejas (hacer 2)',
      instructions: 'Triángulos simples para orejas de gato.',
      order: 2,
    });

    const catEarRounds = [
      { section_id: catEars.id, round_number: 1, instruction: '4 pb en anillo mágico (4)', stitch_count: 4, is_completed: false },
      { section_id: catEars.id, round_number: 2, instruction: '*1 pb, 1 aum* repetir (6)', stitch_count: 6, is_completed: false },
      { section_id: catEars.id, round_number: 3, instruction: '*1 pb en 2 pts, 1 aum* repetir (8)', stitch_count: 8, is_completed: false },
      { section_id: catEars.id, round_number: 4, instruction: 'Dejar cola para coser, coser a la cabeza', stitch_count: 8, is_completed: false },
    ];
    await this.saveRoundsBatch(catEarRounds);

    const catLegs = await this.savePatternSection({
      pattern_id: catPattern.id,
      name: 'Patas (hacer 4)',
      instructions: 'Patas simples y delgadas.',
      order: 3,
    });

    const catLegRounds = [
      { section_id: catLegs.id, round_number: 1, instruction: '6 pb en anillo mágico (6)', stitch_count: 6, is_completed: false },
      { section_id: catLegs.id, round_number: 2, instruction: '1 pb en cada punto (6) - repetir 4 filas más', stitch_count: 6, is_completed: false },
      { section_id: catLegs.id, round_number: 3, instruction: 'Rellenar ligeramente, coser al cuerpo', stitch_count: 6, is_completed: false },
    ];
    await this.saveRoundsBatch(catLegRounds);

    const catTail = await this.savePatternSection({
      pattern_id: catPattern.id,
      name: 'Cola',
      instructions: 'Cola delgada y larga.',
      order: 4,
    });

    const catTailRounds = [
      { section_id: catTail.id, round_number: 1, instruction: '6 pb en anillo mágico (6)', stitch_count: 6, is_completed: false },
      { section_id: catTail.id, round_number: 2, instruction: '1 pb en cada punto (6) - repetir hasta 20-25 filas', stitch_count: 6, is_completed: false },
      { section_id: catTail.id, round_number: 3, instruction: 'Disminuir a 4 pts, cerrar, coser al cuerpo', stitch_count: 4, is_completed: false },
    ];
    await this.saveRoundsBatch(catTailRounds);
  }

  // General Counters
  async getCounters(): Promise<Counter[]> {
    try {
      const { data, error } = await supabase.from('counters').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.error('Error fetching counters from Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.COUNTERS);
    return stored ? JSON.parse(stored) : [];
  }

  async saveCounter(counter: Omit<Counter, 'id' | 'created_at' | 'updated_at'>): Promise<Counter> {
    const now = new Date().toISOString();
    const newCounter = { ...counter, id: crypto.randomUUID(), created_at: now, updated_at: now } as Counter;
    try {
      const { error } = await supabase.from('counters').insert([newCounter]);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving counter to Supabase:', error);
    }
    const stored = await this.getCounters();
    stored.push(newCounter);
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(stored));
    return newCounter;
  }

  async updateCounter(id: string, updates: Partial<Counter>): Promise<void> {
    const now = new Date().toISOString();
    try {
      const { error } = await supabase.from('counters').update({ ...updates, updated_at: now }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating counter in Supabase:', error);
    }
    const stored = await this.getCounters();
    const index = stored.findIndex(c => c.id === id);
    if (index !== -1) {
      stored[index] = { ...stored[index], ...updates, updated_at: now };
      localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(stored));
    }
  }

  async incrementCounter(id: string, delta: number = 1, resetStitches: boolean = false): Promise<void> {
    const counters = await this.getCounters();
    const counter = counters.find(c => c.id === id);
    if (!counter) return;

    const newRound = Math.max(0, counter.current_round + delta);
    const updates: Partial<Counter> = { current_round: newRound };

    // Auto-reset stitch counters when incrementing row
    if (resetStitches && delta > 0) {
      updates.pb_count = 0;
      updates.aum_count = 0;
      updates.dism_count = 0;
      updates.cad_count = 0;
      updates.total_stitches = 0;
      // Also reset custom counters
      const customCounters = counter.custom_counters || [];
      updates.custom_counters = customCounters.map(c => ({ ...c, count: 0 }));
    }

    await this.updateCounter(id, updates);
  }

  async incrementStitchCounter(id: string, stitchType: 'pb_count' | 'aum_count' | 'dism_count' | 'cad_count', delta: number = 1): Promise<void> {
    const counters = await this.getCounters();
    const counter = counters.find(c => c.id === id);
    if (!counter) return;

    const newValue = Math.max(0, (counter[stitchType] || 0) + delta);
    const newTotal = Math.max(0, (counter.total_stitches || 0) + delta);

    await this.updateCounter(id, {
      [stitchType]: newValue,
      total_stitches: newTotal,
    });
  }

  // Custom counter methods
  async addCustomCounter(id: string, customCounter: Omit<CustomStitchCounter, 'id' | 'count'>): Promise<void> {
    const counters = await this.getCounters();
    const counter = counters.find(c => c.id === id);
    if (!counter) return;

    const newCounter: CustomStitchCounter = {
      id: crypto.randomUUID(),
      name: customCounter.name,
      abbr: customCounter.abbr,
      count: 0,
      color: customCounter.color,
    };

    const customCounters = counter.custom_counters || [];
    await this.updateCounter(id, {
      custom_counters: [...customCounters, newCounter],
    });
  }

  async incrementCustomCounter(id: string, customCounterId: string, delta: number = 1): Promise<void> {
    const counters = await this.getCounters();
    const counter = counters.find(c => c.id === id);
    if (!counter) return;

    const customCounters = counter.custom_counters || [];
    const updatedCounters = customCounters.map(c => {
      if (c.id === customCounterId) {
        return { ...c, count: Math.max(0, c.count + delta) };
      }
      return c;
    });

    const customCounter = customCounters.find(c => c.id === customCounterId);
    const newTotal = Math.max(0, (counter.total_stitches || 0) + delta);

    await this.updateCounter(id, {
      custom_counters: updatedCounters,
      total_stitches: newTotal,
    });
  }

  async deleteCustomCounter(id: string, customCounterId: string): Promise<void> {
    const counters = await this.getCounters();
    const counter = counters.find(c => c.id === id);
    if (!counter) return;

    const customCounters = counter.custom_counters || [];
    const filteredCounters = customCounters.filter(c => c.id !== customCounterId);

    await this.updateCounter(id, {
      custom_counters: filteredCounters,
    });
  }

  async resetStitchCounters(id: string): Promise<void> {
    const counters = await this.getCounters();
    const counter = counters.find(c => c.id === id);
    if (!counter) return;

    const customCounters = counter.custom_counters || [];
    const resetCustomCounters = customCounters.map(c => ({ ...c, count: 0 }));

    await this.updateCounter(id, {
      pb_count: 0,
      aum_count: 0,
      dism_count: 0,
      cad_count: 0,
      total_stitches: 0,
      custom_counters: resetCustomCounters,
    });
  }

  async resetCounter(id: string): Promise<void> {
    await this.updateCounter(id, { current_round: 0 });
  }

  async deleteCounter(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('counters').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting counter from Supabase:', error);
    }
    const stored = await this.getCounters();
    const filtered = stored.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(filtered));
  }

  // Crochet Stitches (Glossary)
  async getCrochetStitches(): Promise<CrochetStitch[]> {
    try {
      const { data, error } = await supabase.from('crochet_stitches').select('*').order('name', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CROCHET_STITCHES, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.error('Error fetching crochet stitches from Supabase:', error);
    }
    const stored = localStorage.getItem(STORAGE_KEYS.CROCHET_STITCHES);
    return stored ? JSON.parse(stored) : [];
  }

  async saveCrochetStitch(stitch: Omit<CrochetStitch, 'id' | 'created_at' | 'updated_at' | 'is_custom'>): Promise<CrochetStitch> {
    const now = new Date().toISOString();
    const newStitch: CrochetStitch = {
      ...stitch,
      id: crypto.randomUUID(),
      is_custom: true,
      created_at: now,
      updated_at: now,
    };

    try {
      const { error } = await supabase.from('crochet_stitches').insert([newStitch]);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving crochet stitch to Supabase:', error);
    }

    const stored = await this.getCrochetStitches();
    stored.push(newStitch);
    localStorage.setItem(STORAGE_KEYS.CROCHET_STITCHES, JSON.stringify(stored));
    return newStitch;
  }

  async updateCrochetStitch(id: string, updates: Partial<CrochetStitch>): Promise<void> {
    const now = new Date().toISOString();
    try {
      const { error } = await supabase.from('crochet_stitches').update({ ...updates, updated_at: now }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating crochet stitch in Supabase:', error);
    }
    const stored = await this.getCrochetStitches();
    const index = stored.findIndex(s => s.id === id);
    if (index !== -1) {
      stored[index] = { ...stored[index], ...updates, updated_at: now };
      localStorage.setItem(STORAGE_KEYS.CROCHET_STITCHES, JSON.stringify(stored));
    }
  }

  async deleteCrochetStitch(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('crochet_stitches').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting crochet stitch from Supabase:', error);
    }
    const stored = await this.getCrochetStitches();
    const filtered = stored.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.CROCHET_STITCHES, JSON.stringify(filtered));
  }
}

export const storage = new StorageManager();
