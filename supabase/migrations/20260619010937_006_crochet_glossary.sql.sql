/*
  # Crochet Glossary - Stitch Dictionary

  A comprehensive encyclopedia of crochet stitches and techniques
  with multilingual terminology support.
*/

CREATE TABLE IF NOT EXISTS crochet_stitches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  abbr text NOT NULL,
  name_es text,
  name_en_us text,
  name_en_uk text,
  description text NOT NULL,
  difficulty text NOT NULL DEFAULT 'Fácil',
  uses text DEFAULT '',
  video_url text DEFAULT '',
  is_custom boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_difficulty CHECK (difficulty IN ('Fácil', 'Intermedio', 'Avanzado'))
);

-- Enable RLS
ALTER TABLE crochet_stitches ENABLE ROW LEVEL SECURITY;

-- Public access
CREATE POLICY "Allow public access to crochet_stitches" ON crochet_stitches FOR ALL USING (true) WITH CHECK (true);

-- Insert standard crochet stitches
INSERT INTO crochet_stitches (name, abbr, name_es, name_en_us, name_en_uk, description, difficulty, uses) VALUES
-- Basic Stitches
('Punto Bajo', 'pb', 'Punto Bajo', 'Single Crochet', 'Double Crochet', 
 'Introduce el gancho, saca hebra (2 lazadas), saca hebra y pasa por las 2 lazadas.', 
 'Fácil', 'Bases de amigurumis, bordes firmes, tejidos compactos'),
 
('Punto Alto', 'pa', 'Punto Alto', 'Double Crochet', 'Treble Crochet', 
 'Lazada, introduce, saca hebra (3 lazadas), saca y pasa por 2, saca y pasa por 2.', 
 'Fácil', 'Puntos altos, mantas, tejidos con textura'),

('Punto Medio Alto', 'pma', 'Punto Medio Alto', 'Half Double Crochet', 'Half Treble Crochet', 
 'Lazada, introduce, saca hebra (3 lazadas), saca y pasa por las 3 lazadas de una vez.', 
 'Fácil', 'Transición entre puntos bajos y altos, mantas ligeras'),

('Punto Alto Doble', 'pad', 'Punto Alto Doble', 'Treble Crochet', 'Double Treble', 
 '2 lazadas, introduce, saca hebra, pasa por 2 de 2 en 2 hasta completar.', 
 'Intermedio', 'Puntos muy altos, diseños abiertos, bordados'),

('Cadeneta', 'cad', 'Cadeneta', 'Chain', 'Chain', 
 'Lazada y pasa el gancho por el punto para crear una cadena base.', 
 'Fácil', 'Base para todos los tejidos, espacios, bordes'),

('Punto Enano', 'pe', 'Punto Enano', 'Slip Stitch', 'Slip Stitch', 
 'Introduce el gancho, saca hebra y pasa directamente por el punto y la lazada del gancho.', 
 'Fácil', 'Cerrar vueltas, unir colores, bordes invisibles'),

('Punto Raso', 'pr', 'Punto Raso', 'Slip Stitch', 'Slip Stitch', 
 'Igual que punto enano, se usa para desplazarse sin aumentar altura del tejido.', 
 'Fácil', 'Moverse entre puntos sin añadir altura, cerrar trabajos'),

-- Special Stitches
('Anillo Mágico', 'am', 'Anillo Mágico', 'Magic Ring', 'Magic Loop', 
 'Haz un circulo con la hebra, trabaja puntos dentro del circulo y tira del extremo para cerrar.', 
 'Intermedio', 'Inicio de amigurumis, projets circulares sin hueco central'),

('Aumento', 'aum', 'Aumento', 'Increase', 'Increase', 
 'Trabaja 2 puntos en el mismo punto de la vuelta anterior.', 
 'Fácil', 'Amigurumis, expansiones tejido alfa, formas circulares'),

('Disminución', 'dis', 'Disminución', 'Decrease', 'Decrease', 
 'Inserta en 2 puntos consecutivos con lazada y haz punto único que los une.', 
 'Fácil', 'Amigurumis, reducir puntos, formas cerradas'),

('Disminución Invisible', 'disi', 'Disminución Invisible', 'Invisible Decrease', 'Invisible Decrease', 
 'Inserta solo en la hebra trasera de 2 puntos, haz punto único para un cierre casi invisible.', 
 'Intermedio', 'Amigurumis, detalles sin marcas visibles'),

('Punto Piña', 'pp', 'Punto Piña', 'Bobble Stitch', 'Bobble Stitch', 
 '5 pa incompletos en mismo punto, lazada y cierra todos juntos creando relieve.', 
 'Intermedio', 'Texturas 3D, decoraciones, puntos decorativos'),

('Punto Palomita', 'palm', 'Punto Palomita', 'Puff Stitch', 'Puff Stitch', 
 'Lazadas repetidas en mismo espacio, cierra todas juntas para crear efecto pomposo.', 
 'Intermedio', 'Texturas suaves, mantas, bufandas con volumen'),

('Popcorn', 'pop', 'Popcorn', 'Popcorn Stitch', 'Popcorn Stitch', 
 '5 pa completos en mismo punto, retira gancho, inserta en primero, pasa ultimo y cierra.', 
 'Intermedio', 'Texturas 3D prominentes, flores decorativas'),

('Punto Cangrejo', 'pc', 'Punto Cangrejo', 'Crab Stitch', 'Crab Stitch', 
 'Teje puntos bajos de izquierda a derecha (al revés) creando borde trenzado.', 
 'Fácil', 'Bordes decorativos, acabados firmes'),

('Punto V', 'pv', 'Punto V', 'V-Stitch', 'V-Stitch', 
 'Pa, cad, pa en mismo espacio formando una V.', 
 'Fácil', 'Diseños abiertos, mantas caladas, puntos con espacio'),

('Punto Abanico', 'pab', 'Punto Abanico', 'Shell Stitch', 'Shell', 
 '5 o mas pa en mismo espacio creando forma de abanico.', 
 'Fácil', 'Bordes ornamentados, diseños calados'),

('Punto Racimo', 'prac', 'Punto Racimo', 'Cluster Stitch', 'Cluster Stitch', 
 'Varios pa incompletos en diferentes puntos, cierra todos con lazada final.', 
 'Intermedio', 'Texturas densas, diseños geométricos'),

('Punto Cruzado', 'pcru', 'Punto Cruzado', 'Crossed Stitch', 'Cross Stitch', 
 'Saltar un punto, pa en siguiente, pa en punto saltado creando X.', 
 'Intermedio', 'Texturas entrelazadas, diseños con cruce'),

('Punto Bajo en Relieve', 'pbr', 'Punto Bajo en Relieve', 'Front Post Single Crochet', 'Front Post Double Crochet', 
 'Inserta alrededor de la varilla frontal del punto, trabaja punto normal.', 
 'Intermedio', 'Texturas en relieve, ribbing, bordes elásticos'),

('Punto Bajo Releve Inverso', 'pbri', 'Punto Bajo Releve Inverso', 'Back Post Single Crochet', 'Back Post Double Crochet', 
 'Inserta alrededor de la varilla trasera del punto, trabaja punto normal.', 
 'Intermedio', 'Texturas en relieve invertido, ribbing reversible'),
 
('Punto Alto en Relieve', 'par', 'Punto Alto en Relieve', 'Front Post Double Crochet', 'Front Post Treble', 
 'Lazada, inserta de frente alrededor de varilla del punto, completa como pa.', 
 'Intermedio', 'Cableados, texturas 3D, diseños de ribbing'),

('Punto Alto Releve Inverso', 'pari', 'Punto Alto Releve Inverso', 'Back Post Double Crochet', 'Back Post Treble', 
 'Lazada, inserta por detras alrededor de varilla del punto, completa como pa.', 
 'Intermedio', 'Cableados, texturas invertidas, patrones con relieve'),

-- Advanced Techniques
('Cadeneta Base Sin Cadenetas', 'cbsc', 'Cadeneta Base Sin Cadenetas', 'Foundation Single Crochet', 'Foundation Double Crochet', 
 'Crea cadeneta y punto en un solo movimiento, sin cadena base inicial.', 
 'Intermedio', 'Bases elásticas, evitar cadenetas tensas, inicio flexible'),

('Cadeneta Base Punto Alto', 'cbpa', 'Cadeneta Base Punto Alto', 'Foundation Double Crochet', 'Foundation Treble Crochet', 
 'Crea cadeneta y punto alto en un solo paso para base elástica de pa.', 
 'Intermedio', 'Bases para mantas de pa, bordes sin tensión'),

('Jasmine Stitch', 'jas', 'Jasmine Stitch', 'Jasmine Stitch', 'Jasmine Stitch', 
 'Agrupa 5 puntos especiales en forma estrellada, patron decorativo floral.', 
 'Avanzado', 'Mantas decorativas, detalles florales, diseños únicos'),

('Punto Mosaico', 'pmos', 'Punto Mosaico', 'Mosaic Crochet', 'Mosaic Crochet', 
 'Tecnica de dos colores trabajando solo en filas alternadas sobre espacios.', 
 'Avanzado', 'Diseños geométricos, mantas con patrones, proyectos multi-color'),

('Tunecino', 'tun', 'Tunecino', 'Tunisian Crochet', 'Tunisian Crochet', 
 'Tecnica especial con gancho alargado, mantiene todos los puntos en la vuelta.', 
 'Avanzado', 'Tejidos densos tipo tejido, mantas, prendas con textura tejida');
