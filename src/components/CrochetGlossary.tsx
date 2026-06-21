import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  X,
  Edit2,
  Trash2,
  Play,
  ExternalLink,
  Globe,
  ChevronDown,
  ChevronUp,
  Star,
  Filter,
  Hash,
  Video,
  Sparkles,
} from 'lucide-react';
import { storage } from '../lib/storage';
import type { CrochetStitch } from '../lib/supabase';
import Swal from 'sweetalert2';

type TerminologyLang = 'es' | 'en_us' | 'en_uk';

const DIFFICULTY_COLORS = {
  'Fácil': 'bg-green-100 text-green-700 border-green-200',
  'Intermedio': 'bg-amber-100 text-amber-700 border-amber-200',
  'Avanzado': 'bg-red-100 text-red-700 border-red-200',
};

const DIFFICULTY_STARS = {
  'Fácil': 1,
  'Intermedio': 2,
  'Avanzado': 3,
};

const LANG_LABELS = {
  es: { label: 'Español', flag: 'ES' },
  en_us: { label: 'English (US)', flag: 'US' },
  en_uk: { label: 'English (UK)', flag: 'UK' },
};

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  background: '#f9fafb',
  iconColor: '#6b8273', // Verde Sage Pastel
  customClass: {
    popup: 'rounded-xl shadow-md font-sans border border-sage-100 text-gray-800'
  }
});

function CrochetGlossary() {
  const [stitches, setStitches] = useState<CrochetStitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [terminology, setTerminology] = useState<TerminologyLang>('es');
  const [expandedStitch, setExpandedStitch] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStitch, setEditingStitch] = useState<CrochetStitch | null>(null);

  useEffect(() => {
    loadStitches();
  }, []);

  const loadStitches = async () => {
    setLoading(true);
    const data = await storage.getCrochetStitches();
    setStitches(data);
    setLoading(false);
  };

  const filteredStitches = useMemo(() => {
    return stitches.filter((stitch) => {
      const matchesSearch = searchQuery === '' ||
        stitch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stitch.abbr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stitch.name_es?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stitch.name_en_us?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stitch.name_en_uk?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stitch.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty = selectedDifficulty === 'all' || stitch.difficulty === selectedDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [stitches, searchQuery, selectedDifficulty]);

  const groupedStitches = useMemo(() => {
    const groups: { [key: string]: CrochetStitch[] } = {
      'Puntos básicos': [],
      'Puntos especiales': [],
      'Técnicas avanzadas': [],
      'Personalizados': [],
    };

    filteredStitches.forEach((stitch) => {
      if (stitch.is_custom) {
        groups['Personalizados'].push(stitch);
      } else if (['pb', 'pa', 'pma', 'pad', 'cad', 'pe', 'pr'].includes(stitch.abbr)) {
        groups['Puntos básicos'].push(stitch);
      } else if (['am', 'aum', 'dis', 'disi', 'pp', 'palm', 'pop', 'pc', 'pv', 'pab', 'prac', 'pcru', 'pbr', 'pbri', 'par', 'pari'].includes(stitch.abbr)) {
        groups['Puntos especiales'].push(stitch);
      } else {
        groups['Técnicas avanzadas'].push(stitch);
      }
    });

    return groups;
  }, [filteredStitches]);

  const getDisplayName = (stitch: CrochetStitch): string => {
    switch (terminology) {
      case 'es':
        return stitch.name_es || stitch.name;
      case 'en_us':
        return stitch.name_en_us || stitch.name;
      case 'en_uk':
        return stitch.name_en_uk || stitch.name;
      default:
        return stitch.name;
    }
  };

  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const handleDelete = async (id: string) => {
    // Alerta de confirmación estilizada con SweetAlert2
    const result = await Swal.fire({
      title: '¿Eliminar este punto?',
      text: 'Esta acción no se puede deshacer y borrará permanentemente este punto personalizado del diccionario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6b8273', // Verde Sage Pastel
      cancelButtonColor: '#9ca3af',  // Gris neutro
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#f9fafb',
      customClass: {
        popup: 'rounded-2xl font-sans',
      }
    });

    // Si el usuario cancela, detenemos la operación
    if (!result.isConfirmed) return;

    // Si confirma, se ejecuta el borrado e inicialización estándar
    await storage.deleteCrochetStitch(id);
    loadStitches();

    // Feedback visual de éxito
    Swal.fire({
      title: '¡Eliminado!',
      text: 'El punto ha sido removido de tu diccionario.',
      icon: 'success',
      confirmButtonColor: '#6b8273',
      customClass: {
        popup: 'rounded-2xl',
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diccionario de puntos</h1>
          <p className="text-gray-600 mt-1">Enciclopedia interactiva de puntos y técnicas de crochet</p>
        </div>
        <button
          onClick={() => {
            setEditingStitch(null);
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo punto</span>
        </button>
      </div>

      {/* Terminology Toggle */}
      <div className="card p-4 bg-gradient-to-r from-sky-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-600" />
            <span className="text-sm font-medium text-gray-700">Terminología:</span>
          </div>
          <div className="flex gap-2">
            {(Object.keys(LANG_LABELS) as TerminologyLang[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setTerminology(lang)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  terminology === lang
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {LANG_LABELS[lang].label}
              </button>
            ))}
          </div>
        </div>
        {terminology !== 'es' && (
          <p className="text-xs text-gray-500 mt-2 italic">
            Mostrando terminología en {LANG_LABELS[terminology].label}
          </p>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar puntos por nombre, abreviatura o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">Todas las dificultades</option>
              <option value="Fácil">Fácil</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
          <span>{filteredStitches.length} puntos encontrados</span>
          <span>|</span>
          <span>{stitches.filter(s => s.is_custom).length} personalizados</span>
        </div>
      </div>

      {/* Stitches by Category */}
      {filteredStitches.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border-2 border-dashed border-sage-200">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-2">No se encontraron puntos</p>
          <p className="text-sm mb-4">Intenta con otros términos o agrega un nuevo punto</p>
          <button
            onClick={() => {
              setEditingStitch(null);
              setShowAddModal(true);
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Punto
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedStitches).map(([category, categoryStitches]) => {
            if (categoryStitches.length === 0) return null;

            return (
              <div key={category}>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  {category === 'Personalizados' ? (
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Hash className="w-5 h-5 text-sage-600" />
                  )}
                  {category}
                  <span className="text-sm font-normal text-gray-500">
                    ({categoryStitches.length})
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryStitches.map((stitch) => {
                    const isExpanded = expandedStitch === stitch.id;

                    return (
                      <div
                        key={stitch.id}
                        className="card border border-gray-200 hover:border-sage-300 transition-all overflow-hidden"
                      >
                        {/* Card Header */}
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => setExpandedStitch(isExpanded ? null : stitch.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-gray-900">{getDisplayName(stitch)}</h3>
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-mono">
                                  {stitch.abbr}
                                </span>
                                {stitch.is_custom && (
                                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                    Custom
                                  </span>
                                )}
                                {stitch.video_url && (
                                  <Video className="w-4 h-4 text-red-500" />
                                )}
                              </div>

                              {/* Terminology Equivalence */}
                              {terminology === 'es' && stitch.name_en_us && (
                                <p className="text-xs text-gray-400 mt-1">
                                  EN: {stitch.name_en_us}
                                  {stitch.name_en_uk && stitch.name_en_uk !== stitch.name_en_us && (
                                    <span> / UK: {stitch.name_en_uk}</span>
                                  )}
                                </p>
                              )}
                              {terminology === 'en_us' && stitch.name_es && (
                                <p className="text-xs text-gray-400 mt-1">
                                  ES: {stitch.name_es}
                                </p>
                              )}
                              {terminology === 'en_uk' && stitch.name_es && (
                                <p className="text-xs text-gray-400 mt-1">
                                  ES: {stitch.name_es}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Difficulty Stars */}
                              <div className="flex gap-0.5">
                                {[1, 2, 3].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= DIFFICULTY_STARS[stitch.difficulty]
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>

                              <span className={`text-xs px-2 py-1 rounded-full border ${DIFFICULTY_COLORS[stitch.difficulty]}`}>
                                {stitch.difficulty}
                              </span>

                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Preview Description */}
                          {!isExpanded && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {stitch.description}
                            </p>
                          )}
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">
                            {/* Description */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-1">Descripcion</h4>
                              <p className="text-sm text-gray-600">{stitch.description}</p>
                            </div>

                            {/* Uses */}
                            {stitch.uses && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">Usos Comunes</h4>
                                <p className="text-sm text-gray-600">{stitch.uses}</p>
                              </div>
                            )}

                            {/* Video */}
                            {stitch.video_url && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                  <Video className="w-4 h-4 text-red-500" />
                                  Video tutorial
                                </h4>
                                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                  <iframe
                                    src={getYouTubeEmbedUrl(stitch.video_url) || ''}
                                    title={`Tutorial: ${stitch.name}`}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="text-xs text-gray-400">
                                {stitch.is_custom ? 'Punto personalizado' : 'Punto standard'}
                              </div>
                              <div className="flex gap-2">
                                {stitch.video_url && (
                                  <a
                                    href={stitch.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-icon text-gray-500 hover:text-red-600"
                                    title="Abrir en YouTube"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                                {stitch.is_custom && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingStitch(stitch);
                                        setShowAddModal(true);
                                      }}
                                      className="btn-icon text-gray-500 hover:text-sage-600"
                                      title="Editar"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(stitch.id);
                                      }}
                                      className="btn-icon text-gray-500 hover:text-red-600"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <StitchModal
          stitch={editingStitch}
          terminology={terminology}
          onClose={() => {
            setShowAddModal(false);
            setEditingStitch(null);
          }}
          onSave={async (stitchData) => {
            if (editingStitch) {
              await storage.updateCrochetStitch(editingStitch.id, stitchData);
              Toast.fire({ icon: 'success', title: 'Punto actualizado con éxito' });
            } else {
              await storage.saveCrochetStitch(stitchData as Omit<CrochetStitch, 'id' | 'created_at' | 'updated_at' | 'is_custom'>);
              Toast.fire({ icon: 'success', title: 'Nuevo punto agregado al diccionario' });
            }
            loadStitches();
            setShowAddModal(false);
            setEditingStitch(null);
          }}
        />
      )}
    </div>
  );
}

// Stitch Modal Component
interface StitchModalProps {
  stitch: CrochetStitch | null;
  terminology: TerminologyLang;
  onClose: () => void;
  onSave: (data: Partial<CrochetStitch>) => void;
}

function StitchModal({ stitch, terminology, onClose, onSave }: StitchModalProps) {
  const [formData, setFormData] = useState({
    name: stitch?.name || '',
    abbr: stitch?.abbr || '',
    name_es: stitch?.name_es || '',
    name_en_us: stitch?.name_en_us || '',
    name_en_uk: stitch?.name_en_uk || '',
    description: stitch?.description || '',
    difficulty: stitch?.difficulty || 'Fácil',
    uses: stitch?.uses || '',
    video_url: stitch?.video_url || '',
  });
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (formData.video_url) {
      const match = formData.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&]+)/);
      if (match) {
        setVideoPreview(`https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`);
      }
    } else {
      setVideoPreview(null);
    }
  }, [formData.video_url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-sage-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {stitch ? 'Editar punto' : 'Nuevo punto personalizado'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre principal *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Ej: Punto Alto Doble"
                required
              />
            </div>
            <div>
              <label className="label">Abreviatura *</label>
              <input
                type="text"
                value={formData.abbr}
                onChange={(e) => setFormData({ ...formData, abbr: e.target.value.toLowerCase() })}
                className="input-field"
                placeholder="Ej: pad"
                maxLength={8}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Max 8 caracteres</p>
            </div>
          </div>

          {/* Terminology Section */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-semibold text-gray-700">Equivalencias de terminología</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label text-xs">Español (ES)</label>
                <input
                  type="text"
                  value={formData.name_es}
                  onChange={(e) => setFormData({ ...formData, name_es: e.target.value })}
                  className="input-field"
                  placeholder="Nombre en español"
                />
              </div>
              <div>
                <label className="label text-xs">English (US)</label>
                <input
                  type="text"
                  value={formData.name_en_us}
                  onChange={(e) => setFormData({ ...formData, name_en_us: e.target.value })}
                  className="input-field"
                  placeholder="US name"
                />
              </div>
              <div>
                <label className="label text-xs">English (UK)</label>
                <input
                  type="text"
                  value={formData.name_en_uk}
                  onChange={(e) => setFormData({ ...formData, name_en_uk: e.target.value })}
                  className="input-field"
                  placeholder="UK name"
                />
              </div>
            </div>
            {terminology !== 'es' && (
              <p className="text-xs text-sky-600 mt-2 bg-sky-50 px-3 py-2 rounded-lg">
                Tip: Agrega nombres en todos los idiomas para mejor compatibilidad con el toggle de terminología
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="label">Descripción paso a paso *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[100px] resize-none"
              placeholder="Describe cómo realizar el punto paso a paso..."
              required
            />
          </div>

          {/* Difficulty and Uses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nivel de dificultad *</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as CrochetStitch['difficulty'] })}
                className="input-field"
              >
                <option value="Fácil">Fácil</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
            <div>
              <label className="label">Usos comunes</label>
              <input
                type="text"
                value={formData.uses}
                onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
                className="input-field"
                placeholder="Ej: Amigurumis, mantas, bordes"
              />
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label className="label flex items-center gap-2">
              <Video className="w-4 h-4 text-red-500" />
              Enlace a video tutorial (YouTube)
            </label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              className="input-field"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {videoPreview && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
                <img
                  src={videoPreview}
                  alt="Video preview"
                  className="w-48 h-28 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={!formData.name || !formData.abbr || !formData.description}
            >
              {stitch ? 'Guardar cambios' : 'Agregar punto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CrochetGlossary;
