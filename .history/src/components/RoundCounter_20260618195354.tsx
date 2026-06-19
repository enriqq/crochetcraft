import { useState, useEffect } from 'react';
import {
  Hash,
  Plus,
  Minus,
  RotateCcw,
  Plus as PlusIcon,
  X,
  Edit2,
  Trash2,
  Target,
  Palette,
  Layers,
  TrendingUp,
  TrendingDown,
  Link,
  PlusCircle,
} from 'lucide-react';
import { storage } from '../lib/storage';
import type { Counter, CustomStitchCounter } from '../lib/supabase';

const COLORS = [
  { id: 'sage', name: 'Verde Sage', bg: 'bg-sage-100', border: 'border-sage-300', text: 'text-sage-700', accent: 'bg-sage-500', light: 'bg-sage-50' },
  { id: 'mint', name: 'Verde Menta', bg: 'bg-mint-100', border: 'border-mint-300', text: 'text-mint-700', accent: 'bg-mint-500', light: 'bg-mint-50' },
  { id: 'rose', name: 'Rosa', bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-700', accent: 'bg-rose-500', light: 'bg-rose-50' },
  { id: 'amber', name: 'Ambar', bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-700', accent: 'bg-amber-500', light: 'bg-amber-50' },
  { id: 'sky', name: 'Azul Cielo', bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-700', accent: 'bg-sky-500', light: 'bg-sky-50' },
  { id: 'violet', name: 'Violeta', bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-700', accent: 'bg-violet-500', light: 'bg-violet-50' },
];

const STITCH_COLORS = [
  { id: 'blue', name: 'Azul', bg: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'green', name: 'Verde', bg: 'bg-green-50 border-green-200 text-green-700' },
  { id: 'red', name: 'Rojo', bg: 'bg-red-50 border-red-200 text-red-700' },
  { id: 'amber', name: 'Ambar', bg: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'purple', name: 'Purpura', bg: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'pink', name: 'Rosa', bg: 'bg-pink-50 border-pink-200 text-pink-700' },
  { id: 'cyan', name: 'Cian', bg: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
  { id: 'orange', name: 'Naranja', bg: 'bg-orange-50 border-orange-200 text-orange-700' },
];

const STITCH_TYPES = [
  { key: 'pb_count', label: 'Puntos Bajos', abbr: 'pb', icon: Layers, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { key: 'aum_count', label: 'Aumentos', abbr: 'aum', icon: TrendingUp, color: 'bg-green-50 border-green-200 text-green-700' },
  { key: 'dism_count', label: 'Disminuciones', abbr: 'dis', icon: TrendingDown, color: 'bg-red-50 border-red-200 text-red-700' },
  { key: 'cad_count', label: 'Cadenetas', abbr: 'cad', icon: Link, color: 'bg-amber-50 border-amber-200 text-amber-700' },
];

function RoundCounter() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showCustomCounterModal, setShowCustomCounterModal] = useState(false);
  const [activeCounterId, setActiveCounterId] = useState<string | null>(null);
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounters();
  }, []);

  const loadCounters = async () => {
    setLoading(true);
    const data = await storage.getCounters();
    const initializedData = data.map(c => ({
      ...c,
      pb_count: c.pb_count || 0,
      aum_count: c.aum_count || 0,
      dism_count: c.dism_count || 0,
      cad_count: c.cad_count || 0,
      total_stitches: c.total_stitches || 0,
      custom_counters: c.custom_counters || [],
    }));
    setCounters(initializedData);
    setLoading(false);
  };

  const updateLocalCounter = (id: string, updates: Partial<Counter>) => {
    setCounters(prev => prev.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  // Row counter handlers
  const handleRowIncrement = async (id: string, delta: number) => {
    const counter = counters.find(c => c.id === id);
    if (!counter) return;

    const newRound = Math.max(0, counter.current_round + delta);
    const updates: Partial<Counter> = { current_round: newRound };

    // Auto-reset all stitch counters when going to next row
    if (delta > 0) {
      updates.pb_count = 0;
      updates.aum_count = 0;
      updates.dism_count = 0;
      updates.cad_count = 0;
      updates.total_stitches = 0;
      const customCounters = counter.custom_counters || [];
      updates.custom_counters = customCounters.map(c => ({ ...c, count: 0 }));
    }

    updateLocalCounter(id, updates);
    await storage.updateCounter(id, updates);
  };

  // Stitch counter handlers
  const handleStitchIncrement = async (id: string, stitchType: 'pb_count' | 'aum_count' | 'dism_count' | 'cad_count', delta: number) => {
    const counter = counters.find(c => c.id === id);
    if (!counter) return;

    const newStitchValue = Math.max(0, (counter[stitchType] || 0) + delta);
    const newTotal = Math.max(0, (counter.total_stitches || 0) + delta);

    const updates = {
      [stitchType]: newStitchValue,
      total_stitches: newTotal,
    };

    updateLocalCounter(id, updates);
    await storage.updateCounter(id, updates);
  };

  // Custom counter handlers
  const handleCustomStitchIncrement = async (id: string, customCounterId: string, delta: number) => {
    const counter = counters.find(c => c.id === id);
    if (!counter) return;

    const customCounters = counter.custom_counters || [];
    const updatedCounters = customCounters.map(c => {
      if (c.id === customCounterId) {
        return { ...c, count: Math.max(0, c.count + delta) };
      }
      return c;
    });

    const newTotal = Math.max(0, (counter.total_stitches || 0) + delta);

    updateLocalCounter(id, { custom_counters: updatedCounters, total_stitches: newTotal });
    await storage.updateCounter(id, { custom_counters: updatedCounters, total_stitches: newTotal });
  };

  const handleDeleteCustomCounter = async (id: string, customCounterId: string) => {
    const counter = counters.find(c => c.id === id);
    if (!counter) return;

    const customCounters = counter.custom_counters || [];
    const filteredCounters = customCounters.filter(c => c.id !== customCounterId);

    updateLocalCounter(id, { custom_counters: filteredCounters });
    await storage.updateCounter(id, { custom_counters: filteredCounters });
  };

  // Reset only stitch counters (keep row count)
  const handleResetStitches = async (id: string) => {
    const counter = counters.find(c => c.id === id);
    if (!counter) return;

    const customCounters = counter.custom_counters || [];
    const resetCustomCounters = customCounters.map(c => ({ ...c, count: 0 }));

    const updates = {
      pb_count: 0,
      aum_count: 0,
      dism_count: 0,
      cad_count: 0,
      total_stitches: 0,
      custom_counters: resetCustomCounters,
    };

    updateLocalCounter(id, updates);
    await storage.updateCounter(id, updates);
  };

  // Reset everything
  const handleFullReset = async (id: string) => {
    const counter = counters.find(c => c.id === id);
    if (!counter) return;

    const customCounters = counter.custom_counters || [];
    const resetCustomCounters = customCounters.map(c => ({ ...c, count: 0 }));

    const updates = {
      current_round: 0,
      pb_count: 0,
      aum_count: 0,
      dism_count: 0,
      cad_count: 0,
      total_stitches: 0,
      custom_counters: resetCustomCounters,
    };

    updateLocalCounter(id, updates);
    await storage.updateCounter(id, updates);
  };

  const deleteCounter = async (id: string) => {
    if (!confirm('¿Eliminar este contador?')) return;
    await storage.deleteCounter(id);
    setCounters(counters.filter(c => c.id !== id));
  };

  const getColorClasses = (colorId: string) => {
    return COLORS.find(c => c.id === colorId) || COLORS[0];
  };

  const getProgress = (counter: Counter) => {
    if (counter.target_rounds === 0) return 0;
    return Math.min(100, Math.round((counter.current_round / counter.target_rounds) * 100));
  };

  const getStitchColorClass = (colorId: string) => {
    return STITCH_COLORS.find(c => c.id === colorId) || STITCH_COLORS[0];
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
          <h1 className="text-3xl font-bold text-gray-900">Contador de vueltas</h1>
          <p className="text-gray-600 mt-1">Cuenta vueltas y puntos mientras tejes</p>
        </div>
        <button
          onClick={() => {
            setEditingCounter(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nuevo contador</span>
        </button>
      </div>

      {/* Counters Grid */}
      {counters.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border-2 border-dashed border-sage-200">
          <Hash className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-2">No hay contadores</p>
          <p className="text-sm mb-4">Crea un contador para empezar a llevar el registro de tus vueltas</p>
          <button
            onClick={() => {
              setEditingCounter(null);
              setShowModal(true);
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Crear contador
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {counters.map((counter) => {
            const colors = getColorClasses(counter.color);
            const progress = getProgress(counter);
            const customCounters = counter.custom_counters || [];

            return (
              <div
                key={counter.id}
                className={`card overflow-hidden ${colors.light} border-2 ${colors.border} transition-all hover:shadow-lg`}
              >
                {/* Header */}
                <div className={`p-4 ${colors.bg} border-b ${colors.border}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900">{counter.name}</h3>
                      {counter.notes && (
                        <p className="text-sm text-gray-600 truncate">{counter.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingCounter(counter);
                          setShowModal(true);
                        }}
                        className="btn-icon w-8 h-8 bg-white/60 hover:bg-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCounter(counter.id)}
                        className="btn-icon w-8 h-8 bg-white/60 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Main Row/Round Counter */}
                  <div>
                    <div className="text-center mb-4">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Vuelta Actual</span>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleRowIncrement(counter.id, -1)}
                        className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:shadow-lg transition-all active:scale-95 text-xl font-bold"
                      >
                        <Minus className="w-7 h-7" />
                      </button>

                      <div className="relative">
                        {counter.target_rounds > 0 && (
                          <svg className="absolute inset-0 w-28 h-28 -rotate-90">
                            <circle
                              cx="56"
                              cy="56"
                              r="48"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="6"
                              className="text-gray-200"
                            />
                            <circle
                              cx="56"
                              cy="56"
                              r="48"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="6"
                              strokeDasharray={`${Math.min(progress, 100) * 3.01} 301`}
                              className={colors.text}
                            />
                          </svg>
                        )}
                        <div className={`w-28 h-28 rounded-full ${colors.bg} flex items-center justify-center`}>
                          <span className="text-4xl font-bold text-gray-900">{counter.current_round}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRowIncrement(counter.id, 1)}
                        className="w-16 h-16 rounded-full bg-gray-900 shadow-md flex items-center justify-center text-white hover:bg-gray-800 hover:shadow-lg transition-all active:scale-95"
                        title="Sumar vuelta (reinicia contadores de puntos)"
                      >
                        <Plus className="w-7 h-7" />
                      </button>
                    </div>

                    {counter.target_rounds > 0 && (
                      <div className="mt-3 text-center">
                        <span className="text-sm text-gray-500">
                          {counter.current_round} de {counter.target_rounds} vueltas ({progress}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stitch Counters Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Contador de Puntos
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Total: <span className="font-bold text-gray-900">{counter.total_stitches || 0}</span>
                        </span>
                        <button
                          onClick={() => handleResetStitches(counter.id)}
                          className="btn-icon w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600"
                          title="Reiniciar puntos de esta vuelta"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Standard Stitch Counters */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {STITCH_TYPES.map((stitch) => {
                        const Icon = stitch.icon;
                        const count = counter[stitch.key as keyof Counter] as number || 0;

                        return (
                          <div
                            key={stitch.key}
                            className={`p-4 rounded-xl border-2 ${stitch.color}`}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <Icon className="w-4 h-4" />
                              <span className="font-medium text-sm">{stitch.label}</span>
                              <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full">
                                {stitch.abbr}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => handleStitchIncrement(counter.id, stitch.key as 'pb_count' | 'aum_count' | 'dism_count' | 'cad_count', -1)}
                                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow transition-all active:scale-95"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <span className="text-2xl font-bold min-w-[3rem] text-center">
                                {count}
                              </span>

                              <button
                                onClick={() => handleStitchIncrement(counter.id, stitch.key as 'pb_count' | 'aum_count' | 'dism_count' | 'cad_count', 1)}
                                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow transition-all active:scale-95"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Custom Stitch Counters */}
                    {customCounters.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {customCounters.map((customCounter) => {
                          const stitchColor = getStitchColorClass(customCounter.color);

                          return (
                            <div
                              key={customCounter.id}
                              className={`p-4 rounded-xl border-2 ${stitchColor.bg} relative group`}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <Hash className="w-4 h-4" />
                                <span className="font-medium text-sm truncate">{customCounter.name}</span>
                                <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full">
                                  {customCounter.abbr}
                                </span>
                                <button
                                  onClick={() => handleDeleteCustomCounter(counter.id, customCounter.id)}
                                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/80 text-gray-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                                  title="Eliminar contador"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => handleCustomStitchIncrement(counter.id, customCounter.id, -1)}
                                  className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow transition-all active:scale-95"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>

                                <span className="text-2xl font-bold min-w-[3rem] text-center">
                                  {customCounter.count}
                                </span>

                                <button
                                  onClick={() => handleCustomStitchIncrement(counter.id, customCounter.id, 1)}
                                  className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow transition-all active:scale-95"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Custom Counter Button */}
                    <button
                      onClick={() => {
                        setActiveCounterId(counter.id);
                        setShowCustomCounterModal(true);
                      }}
                      className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-sage-400 hover:text-sage-600 hover:bg-sage-50 transition-all flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span className="font-medium">Agregar Contador Personalizado</span>
                    </button>
                  </div>

                  {/* Full Reset Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleFullReset(counter.id)}
                      className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reiniciar Todo
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Tips */}
      <div className="card p-5 bg-gradient-to-br from-sage-50 to-white">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Hash className="w-5 h-5 text-sage-600" />
          Consejos para usar el contador
        </h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-sage-500 mt-0.5">•</span>
            <span><strong>+1 Vuelta</strong> automáticamente reinicia los contadores de puntos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sage-500 mt-0.5">•</span>
            <span>Agrega contadores personalizados para otros tipos de puntos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sage-500 mt-0.5">•</span>
            <span>El botón circular reinicia sólo los puntos de la vuelta actual</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sage-500 mt-0.5">•</span>
            <span>Todo se guarda automáticamente</span>
          </li>
        </ul>
      </div>

      {/* Counter Modal */}
      {showModal && (
        <CounterModal
          counter={editingCounter}
          onClose={() => setShowModal(false)}
          onSave={async (counterData) => {
            if (editingCounter) {
              await storage.updateCounter(editingCounter.id, counterData);
            } else {
              await storage.saveCounter({
                ...counterData,
                pb_count: 0,
                aum_count: 0,
                dism_count: 0,
                cad_count: 0,
                total_stitches: 0,
                custom_counters: [],
              } as Omit<Counter, 'id' | 'created_at' | 'updated_at'>);
            }
            loadCounters();
            setShowModal(false);
          }}
        />
      )}

      {/* Custom Counter Modal */}
      {showCustomCounterModal && activeCounterId && (
        <CustomCounterModal
          onClose={() => {
            setShowCustomCounterModal(false);
            setActiveCounterId(null);
          }}
          onSave={async (data) => {
            const customCounter: Omit<CustomStitchCounter, 'id' | 'count'> = {
              name: data.name,
              abbr: data.abbr,
              color: data.color,
            };
            await storage.addCustomCounter(activeCounterId, customCounter);
            loadCounters();
            setShowCustomCounterModal(false);
            setActiveCounterId(null);
          }}
        />
      )}
    </div>
  );
}

// Counter Modal Component
interface CounterModalProps {
  counter: Counter | null;
  onClose: () => void;
  onSave: (data: Partial<Counter>) => void;
}

function CounterModal({ counter, onClose, onSave }: CounterModalProps) {
  const [formData, setFormData] = useState({
    name: counter?.name || '',
    current_round: counter?.current_round || 0,
    target_rounds: counter?.target_rounds || 0,
    notes: counter?.notes || '',
    color: counter?.color || 'sage',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-sage-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {counter ? 'Editar contador' : 'Nuevo contador'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Nombre del contador</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Ej: Bufanda de Ondas"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Vuelta Actual</label>
              <input
                type="number"
                value={formData.current_round}
                onChange={(e) => setFormData({ ...formData, current_round: parseInt(e.target.value) || 0 })}
                className="input-field"
                min="0"
              />
            </div>

            <div>
              <label className="label flex items-center gap-1">
                <Target className="w-4 h-4" />
                Objetivo
              </label>
              <input
                type="number"
                value={formData.target_rounds}
                onChange={(e) => setFormData({ ...formData, target_rounds: parseInt(e.target.value) || 0 })}
                className="input-field"
                min="0"
                placeholder="Total de vueltas"
              />
            </div>
          </div>

          <div>
            <label className="label">Notas</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              placeholder="Notas adicionales..."
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="label flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.id })}
                  className={`w-10 h-10 rounded-lg ${color.bg} border-2 transition-all ${
                    formData.color === color.id ? color.border : 'border-transparent'
                  }`}
                  title={color.name}
                >
                  <div className={`w-4 h-4 rounded-full mx-auto ${color.accent}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {counter ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Custom Counter Modal Component
interface CustomCounterModalProps {
  onClose: () => void;
  onSave: (data: { name: string; abbr: string; color: string }) => void;
}

function CustomCounterModal({ onClose, onSave }: CustomCounterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    abbr: '',
    color: 'blue',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.abbr) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-sage-100">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo contador de punto</h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Nombre del punto</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Ej: Punto Alto"
              required
            />
          </div>

          <div>
            <label className="label">Abreviatura</label>
            <input
              type="text"
              value={formData.abbr}
              onChange={(e) => setFormData({ ...formData, abbr: e.target.value.toLowerCase() })}
              className="input-field"
              placeholder="Ej: pa"
              maxLength={6}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Maximo 6 caracteres</p>
          </div>

          {/* Color Picker */}
          <div>
            <label className="label flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {STITCH_COLORS.map((color) => {
                const isSelected = formData.color === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.id })}
                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-gray-800 ring-2 ring-gray-300' : 'border-transparent'
                    } ${color.bg}`}
                    title={color.name}
                  >
                    {isSelected && <div className="w-3 h-3 rounded-full bg-gray-800" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          {formData.name && (
            <div className={`p-3 rounded-xl border-2 ${getStitchColorClass(formData.color).bg}`}>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span className="font-medium text-sm">{formData.name}</span>
                {formData.abbr && (
                  <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full">
                    {formData.abbr}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={!formData.name || !formData.abbr}>
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getStitchColorClass(colorId: string) {
  return STITCH_COLORS.find(c => c.id === colorId) || STITCH_COLORS[0];
}

export default RoundCounter;
