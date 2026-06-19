import { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  X,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Link,
  ExternalLink,
  PenTool,
  Check,
  Square,
  CheckSquare,
  Ruler,
  Gauge,
  Scissors,
  Info,
  List,
  Hash,
  ChevronUp,
} from 'lucide-react';
import { storage } from '../lib/storage';
import type { Pattern, PatternSection, PatternRound, Abbreviation, PatternMaterial } from '../lib/supabase';

function Patterns() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [sections, setSections] = useState<Record<string, PatternSection[]>>({});
  const [rounds, setRounds] = useState<Record<string, PatternRound[]>>({});
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);
  const [editingSection, setEditingSection] = useState<{ section: PatternSection | null; patternId: string } | null>(null);
  const [editingRound, setEditingRound] = useState<{ round: PatternRound | null; sectionId: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'sections'>('details');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    setLoading(true);
    const patternsData = await storage.getPatterns();
    setPatterns(patternsData);

    const sectionsMap: Record<string, PatternSection[]> = {};
    const roundsMap: Record<string, PatternRound[]> = {};

    for (const pattern of patternsData) {
      const patternSections = await storage.getPatternSections(pattern.id);
      sectionsMap[pattern.id] = patternSections;

      for (const section of patternSections) {
        const sectionRounds = await storage.getPatternRounds(section.id);
        roundsMap[section.id] = sectionRounds;
      }
    }

    setSections(sectionsMap);
    setRounds(roundsMap);
    setLoading(false);
  };

  const togglePattern = (patternId: string) => {
    setExpandedPattern(expandedPattern === patternId ? null : patternId);
    setActiveTab('details');
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleRoundComplete = async (round: PatternRound) => {
    await storage.toggleRoundComplete(round.id, !round.is_completed);
    setRounds(prev => ({
      ...prev,
      [round.section_id]: prev[round.section_id].map(r =>
        r.id === round.id ? { ...r, is_completed: !r.is_completed } : r
      ),
    }));
  };

  const getSectionProgress = (sectionId: string) => {
    const sectionRounds = rounds[sectionId] || [];
    if (sectionRounds.length === 0) return 0;
    const completed = sectionRounds.filter(r => r.is_completed).length;
    return Math.round((completed / sectionRounds.length) * 100);
  };

  const getOverallProgress = (patternId: string) => {
    const patternSections = sections[patternId] || [];
    const allRounds = patternSections.flatMap(s => rounds[s.id] || []);
    if (allRounds.length === 0) return 0;

    const completed = allRounds.filter(r => r.is_completed).length;
    return Math.round((completed / allRounds.length) * 100);
  };

  const deletePattern = async (id: string) => {
    if (!confirm('¿Eliminar este patrón y todas sus secciones y vueltas?')) return;
    await storage.deletePattern(id);
    setPatterns(patterns.filter(p => p.id !== id));
    setSections(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    if (expandedPattern === id) setExpandedPattern(null);
  };

  const deleteSection = async (sectionId: string, patternId: string) => {
    if (!confirm('¿Eliminar esta sección y todas sus vueltas?')) return;
    await storage.deletePatternSection(sectionId);
    setSections(prev => ({
      ...prev,
      [patternId]: prev[patternId].filter(s => s.id !== sectionId),
    }));
    setRounds(prev => {
      const updated = { ...prev };
      delete updated[sectionId];
      return updated;
    });
  };

  const deleteRound = async (round: PatternRound) => {
    if (!confirm('¿Eliminar esta vuelta?')) return;
    await storage.deletePatternRound(round.id);
    setRounds(prev => ({
      ...prev,
      [round.section_id]: prev[round.section_id].filter(r => r.id !== round.id),
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-700';
      case 'Intermedio': return 'bg-amber-100 text-amber-700';
      case 'Avanzado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca de Patrones</h1>
          <p className="text-gray-600 mt-1">Organiza y sigue el progreso de tus patrones de crochet</p>
        </div>
        <button
          onClick={() => {
            setEditingPattern(null);
            setShowPatternModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Patrón</span>
        </button>
      </div>

      {/* Patterns List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
        </div>
      ) : patterns.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border-2 border-dashed border-sage-200">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-2">No hay patrones guardados</p>
          <p className="text-sm mb-4">Crea tu primer patrón para empezar a organizar tus proyectos</p>
          <button
            onClick={() => {
              setEditingPattern(null);
              setShowPatternModal(true);
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Patrón
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {patterns.map((pattern) => {
            const isExpanded = expandedPattern === pattern.id;
            const progress = getOverallProgress(pattern.id);

            return (
              <div key={pattern.id} className="overflow-hidden">
                {/* Pattern Header Card */}
                <div className="card group">
                  <button
                    onClick={() => togglePattern(pattern.id)}
                    className="w-full p-5 flex items-center gap-4 text-left hover:bg-sage-50/50 transition-colors"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-sage-100 to-mint-50 rounded-xl flex items-center justify-center shadow-sm">
                      <BookOpen className="w-7 h-7 text-sage-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{pattern.title}</h3>
                        <span className={`status-badge ${getDifficultyColor(pattern.difficulty)}`}>
                          {pattern.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Gancho: {pattern.hook_size}</span>
                        <span>|</span>
                        <span>{pattern.yarn_type}</span>
                        <span className="hidden sm:inline">|</span>
                        <span className="hidden sm:inline">{sections[pattern.id]?.length || 0} secciones</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-2xl font-bold text-sage-700">{progress}%</div>
                        <div className="text-xs text-gray-500">completado</div>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPattern(pattern);
                            setShowPatternModal(true);
                          }}
                          className="btn-icon"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePattern(pattern.id);
                          }}
                          className="btn-icon hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Progress Bar */}
                  <div className="px-5 pb-5">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Expanded Pattern Detail */}
                {isExpanded && (
                  <div className="mt-2 ml-4 lg:ml-8 space-y-4 animate-slide-up">
                    {/* Tab Navigation */}
                    <div className="flex gap-2 p-1 bg-sage-100 rounded-lg w-fit">
                      <button
                        onClick={() => setActiveTab('details')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          activeTab === 'details' ? 'bg-white shadow-sm text-sage-800' : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <List className="w-4 h-4 inline mr-2" />
                        Ficha Técnica
                      </button>
                      <button
                        onClick={() => setActiveTab('sections')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          activeTab === 'sections' ? 'bg-white shadow-sm text-sage-800' : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <Hash className="w-4 h-4 inline mr-2" />
                        Instrucciones
                      </button>
                    </div>

                    {activeTab === 'details' ? (
                      /* Details Tab */
                      <div className="space-y-4">
                        {/* Materials Section */}
                        <div className="card p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <Scissors className="w-5 h-5 text-sage-600" />
                            <h4 className="font-semibold text-gray-800">Materiales Necesarios</h4>
                          </div>
                          {pattern.pattern_materials && pattern.pattern_materials.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {pattern.pattern_materials.map((mat, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-sage-50/50 rounded-lg">
                                  <div className="w-2 h-2 rounded-full bg-sage-400 mt-2 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium text-gray-800">{mat.name}</div>
                                    <div className="text-sm text-gray-500">Cantidad: {mat.quantity}</div>
                                    {mat.notes && <div className="text-xs text-gray-400 mt-1">{mat.notes}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm">Sin materiales especificados</p>
                          )}
                        </div>

                        {/* Gauge & Measurements */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="card p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <Gauge className="w-5 h-5 text-amber-600" />
                              <h4 className="font-semibold text-gray-800">Muestra (Gauge)</h4>
                            </div>
                            <p className="text-gray-600 text-sm">{pattern.gauge || 'No especificada'}</p>
                          </div>

                          <div className="card p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <Ruler className="w-5 h-5 text-mint-600" />
                              <h4 className="font-semibold text-gray-800">Medidas Finales</h4>
                            </div>
                            <p className="text-gray-600 text-sm">{pattern.measurements || 'No especificadas'}</p>
                          </div>
                        </div>

                        {/* Description & Notes */}
                        <div className="card p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Info className="w-5 h-5 text-sage-600" />
                            <h4 className="font-semibold text-gray-800">Descripción y Notas</h4>
                          </div>
                          {pattern.description && (
                            <div className="mb-3">
                              <div className="text-sm font-medium text-gray-500 mb-1">Descripción</div>
                              <p className="text-gray-700">{pattern.description}</p>
                            </div>
                          )}
                          {pattern.notes && (
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-1">Notas Generales</div>
                              <p className="text-gray-600 text-sm">{pattern.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Abbreviations Legend */}
                        {pattern.abbreviations && pattern.abbreviations.length > 0 && (
                          <div className="card p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                              <h4 className="font-semibold text-gray-800">Leyenda de Abreviaturas</h4>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                              {pattern.abbreviations.map((abbr, idx) => (
                                <div key={idx} className="p-2 bg-gray-50 rounded-lg">
                                  <span className="font-mono font-bold text-sage-700">{abbr.code}</span>
                                  <span className="text-gray-400 mx-1">=</span>
                                  <span className="text-sm text-gray-600">{abbr.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Support Links */}
                        {pattern.links && pattern.links.length > 0 && (
                          <div className="card p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <Link className="w-5 h-5 text-purple-600" />
                              <h4 className="font-semibold text-gray-800">Enlaces de Apoyo</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {pattern.links.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-sage-50 hover:bg-sage-100 rounded-lg text-sm text-sage-700 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  {link.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Sections & Rounds Tab */
                      <div className="space-y-4">
                        {/* Add Section Button */}
                        <button
                          onClick={() => {
                            setEditingSection({ section: null, patternId: pattern.id });
                            setShowSectionModal(true);
                          }}
                          className="w-full p-4 border-2 border-dashed border-sage-200 rounded-lg text-sage-600 hover:border-sage-300 hover:bg-sage-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="font-medium">Agregar Sección</span>
                        </button>

                        {/* Sections List */}
                        {(sections[pattern.id] || []).map((section) => {
                          const isSectionExpanded = expandedSections.has(section.id);
                          const sectionRounds = rounds[section.id] || [];
                          const sectionProgress = getSectionProgress(section.id);

                          return (
                            <div key={section.id} className="card overflow-hidden">
                              {/* Section Header */}
                              <div className="p-4 bg-sage-50/30 border-b border-sage-100 group">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => toggleSection(section.id)}
                                    className="flex-1 flex items-center gap-3 text-left"
                                  >
                                    {isSectionExpanded ? (
                                      <ChevronDown className="w-5 h-5 text-sage-600" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-sage-600" />
                                    )}
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-800">{section.name}</h4>
                                      {section.instructions && (
                                        <p className="text-sm text-gray-500 truncate">{section.instructions}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-sm text-gray-500">
                                        {sectionRounds.filter(r => r.is_completed).length}/{sectionRounds.length} vueltas
                                      </div>
                                      <div className="w-24 h-2 bg-sage-100 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-gradient-to-r from-sage-400 to-mint-500 transition-all"
                                          style={{ width: `${sectionProgress}%` }}
                                        />
                                      </div>
                                    </div>
                                  </button>

                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSection({ section, patternId: pattern.id });
                                        setShowSectionModal(true);
                                      }}
                                      className="btn-icon w-8 h-8"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSection(section.id, pattern.id);
                                      }}
                                      className="btn-icon w-8 h-8 hover:bg-red-100 hover:text-red-600"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Rounds List (when section is expanded) */}
                              {isSectionExpanded && (
                                <div className="p-4 space-y-2 animate-slide-up">
                                  {/* Add Round Button */}
                                  <button
                                    onClick={() => {
                                      setEditingRound({ round: null, sectionId: section.id });
                                      setShowRoundModal(true);
                                    }}
                                    className="w-full p-3 border-2 border-dashed border-sage-200 rounded-lg text-sage-500 hover:border-sage-300 hover:bg-sage-50 transition-all flex items-center justify-center gap-2 text-sm"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>Agregar Vuelta</span>
                                  </button>

                                  {/* Rounds */}
                                  {sectionRounds.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400">
                                      <Hash className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                      <p className="text-sm">Sin vueltas registradas</p>
                                    </div>
                                  ) : (
                                    sectionRounds.map((round, idx) => (
                                      <div
                                        key={round.id}
                                        className={`flex items-start gap-3 p-3 rounded-lg transition-all group ${
                                          round.is_completed
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-gray-50 border border-gray-100 hover:bg-sage-50'
                                        }`}
                                      >
                                        {/* Checkbox */}
                                        <button
                                          onClick={() => toggleRoundComplete(round)}
                                          className={`w-6 h-6 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                                            round.is_completed
                                              ? 'bg-green-500 text-white'
                                              : 'bg-white border-2 border-gray-300 hover:border-sage-400'
                                          }`}
                                        >
                                          {round.is_completed && <Check className="w-4 h-4" />}
                                        </button>

                                        {/* Round Content */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-mono font-semibold ${
                                              round.is_completed ? 'text-green-700' : 'text-sage-700'
                                            }`}>
                                              Vta {round.round_number}:
                                            </span>
                                            {round.stitch_count > 0 && (
                                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                round.is_completed
                                                  ? 'bg-green-100 text-green-700'
                                                  : 'bg-sage-100 text-sage-600'
                                              }`}>
                                                {round.stitch_count} pts
                                              </span>
                                            )}
                                          </div>

                                          <p className={`text-sm ${
                                            round.is_completed ? 'text-green-700' : 'text-gray-700'
                                          }`}>
                                            {round.instruction}
                                          </p>

                                          {round.notes && (
                                            <p className="text-xs text-gray-500 mt-1 italic">{round.notes}</p>
                                          )}
                                        </div>

                                        {/* Round Actions */}
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingRound({ round, sectionId: section.id });
                                              setShowRoundModal(true);
                                            }}
                                            className="btn-icon w-7 h-7"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteRound(round);
                                            }}
                                            className="btn-icon w-7 h-7 hover:bg-red-100 hover:text-red-600"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {(sections[pattern.id] || []).length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <PenTool className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Sin secciones creadas</p>
                            <p className="text-xs mt-1">Agrega secciones para organizar las vueltas del patrón</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pattern Modal */}
      {showPatternModal && (
        <PatternModal
          pattern={editingPattern}
          onClose={() => setShowPatternModal(false)}
          onSave={async (patternData) => {
            if (editingPattern) {
              await storage.updatePattern(editingPattern.id, patternData);
              loadPatterns();
            } else {
              const newPattern = await storage.savePattern(patternData as Omit<Pattern, 'id' | 'created_at' | 'updated_at'>);
              setSections(prev => ({ ...prev, [newPattern.id]: [] }));
              setRounds(prev => prev);
              loadPatterns();
            }
            setShowPatternModal(false);
          }}
        />
      )}

      {/* Section Modal */}
      {showSectionModal && editingSection && (
        <SectionModal
          section={editingSection.section}
          onClose={() => setShowSectionModal(false)}
          onSave={async (sectionData) => {
            if (editingSection.section) {
              await storage.updatePatternSection(editingSection.section.id, sectionData);
            } else {
              const newSection = await storage.savePatternSection({
                ...sectionData,
                pattern_id: editingSection.patternId,
                order: (sections[editingSection.patternId]?.length || 0) + 1,
              } as Omit<PatternSection, 'id' | 'created_at' | 'updated_at'>);
              setRounds(prev => ({ ...prev, [newSection.id]: [] }));
            }
            loadPatterns();
            setShowSectionModal(false);
          }}
        />
      )}

      {/* Round Modal */}
      {showRoundModal && editingRound && (
        <RoundModal
          round={editingRound.round}
          sectionId={editingRound.sectionId}
          existingRounds={rounds[editingRound.sectionId] || []}
          onClose={() => setShowRoundModal(false)}
          onSave={async (roundData) => {
            if (editingRound.round) {
              await storage.updatePatternRound(editingRound.round.id, roundData);
            } else {
              await storage.savePatternRound({
                ...roundData,
                section_id: editingRound.sectionId,
              } as Omit<PatternRound, 'id' | 'created_at' | 'updated_at'>);
            }
            loadPatterns();
            setShowRoundModal(false);
          }}
        />
      )}
    </div>
  );
}

// Pattern Modal Component
interface PatternModalProps {
  pattern: Pattern | null;
  onClose: () => void;
  onSave: (data: Partial<Pattern>) => void;
}

function PatternModal({ pattern, onClose, onSave }: PatternModalProps) {
  const [formData, setFormData] = useState({
    title: pattern?.title || '',
    hook_size: pattern?.hook_size || '3.5mm',
    yarn_type: pattern?.yarn_type || 'Algodón',
    difficulty: pattern?.difficulty || 'Intermedio' as Pattern['difficulty'],
    description: pattern?.description || '',
    notes: pattern?.notes || '',
    gauge: pattern?.gauge || '',
    measurements: pattern?.measurements || '',
    links: pattern?.links || [],
    abbreviations: pattern?.abbreviations || storage.getStandardAbbreviations().filter(abbr =>
      ['pb', 'pa', 'aum', 'dis', 'cad', 'am', '*', '()'].includes(abbr.code)
    ),
    pattern_materials: pattern?.pattern_materials || [],
  });
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialQty, setNewMaterialQty] = useState('');
  const [newMaterialNotes, setNewMaterialNotes] = useState('');
  const [showAbbrevPicker, setShowAbbrevPicker] = useState(false);

  const standardAbbrs = storage.getStandardAbbreviations();

  const addLink = () => {
    if (newLinkTitle && newLinkUrl) {
      setFormData({
        ...formData,
        links: [...formData.links, { title: newLinkTitle, url: newLinkUrl }],
      });
      setNewLinkTitle('');
      setNewLinkUrl('');
    }
  };

  const removeLink = (index: number) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index),
    });
  };

  const addMaterial = () => {
    if (newMaterialName && newMaterialQty) {
      setFormData({
        ...formData,
        pattern_materials: [...formData.pattern_materials, { name: newMaterialName, quantity: newMaterialQty, notes: newMaterialNotes }],
      });
      setNewMaterialName('');
      setNewMaterialQty('');
      setNewMaterialNotes('');
    }
  };

  const removeMaterial = (index: number) => {
    setFormData({
      ...formData,
      pattern_materials: formData.pattern_materials.filter((_, i) => i !== index),
    });
  };

  const toggleAbbreviation = (abbr: Abbreviation) => {
    const exists = formData.abbreviations.find(a => a.code === abbr.code);
    if (exists) {
      setFormData({
        ...formData,
        abbreviations: formData.abbreviations.filter(a => a.code !== abbr.code),
      });
    } else {
      setFormData({
        ...formData,
        abbreviations: [...formData.abbreviations, abbr],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-sage-100 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {pattern ? 'Editar Patrón' : 'Nuevo Patrón'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Título del Patrón</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Ej: Amigurumi de León"
                required
              />
            </div>

            <div>
              <label className="label">Tamaño de Gancho</label>
              <input
                type="text"
                value={formData.hook_size}
                onChange={(e) => setFormData({ ...formData, hook_size: e.target.value })}
                className="input-field"
                placeholder="3.5mm"
              />
            </div>

            <div>
              <label className="label">Tipo de Hilo</label>
              <input
                type="text"
                value={formData.yarn_type}
                onChange={(e) => setFormData({ ...formData, yarn_type: e.target.value })}
                className="input-field"
                placeholder="Algodón (Sport/DK)"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Dificultad</label>
              <div className="flex gap-3">
                {(['Fácil', 'Intermedio', 'Avanzado'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: level })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      formData.difficulty === level
                        ? level === 'Fácil' ? 'border-green-500 bg-green-50 text-green-700' :
                          level === 'Intermedio' ? 'border-amber-500 bg-amber-50 text-amber-700' :
                          'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gauge & Measurements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Muestra (Gauge)</label>
              <textarea
                value={formData.gauge}
                onChange={(e) => setFormData({ ...formData, gauge: e.target.value })}
                className="input-field resize-none"
                rows={2}
                placeholder="8 pb = 2.5 cm; 8 filas = 2.5 cm"
              />
            </div>

            <div>
              <label className="label">Medidas Finales</label>
              <textarea
                value={formData.measurements}
                onChange={(e) => setFormData({ ...formData, measurements: e.target.value })}
                className="input-field resize-none"
                rows={2}
                placeholder="Altura: 15 cm; Ancho: 10 cm"
              />
            </div>
          </div>

          {/* Description & Notes */}
          <div className="space-y-4">
            <div>
              <label className="label">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field resize-none"
                rows={2}
                placeholder="Descripción general del proyecto..."
              />
            </div>

            <div>
              <label className="label">Notas Generales</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field resize-none"
                rows={2}
                placeholder="Consejos, precauciones, materiales recomendados..."
              />
            </div>
          </div>

          {/* Materials */}
          <div>
            <label className="label mb-2">Materiales Necesarios</label>
            <div className="space-y-2 mb-3">
              {formData.pattern_materials.map((mat, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-sage-50 rounded-lg">
                  <span className="text-sm text-gray-700 flex-1">
                    <span className="font-medium">{mat.name}</span>
                    <span className="text-gray-400 mx-1">|</span>
                    {mat.quantity}
                    {mat.notes && <span className="text-xs text-gray-500 ml-1">({mat.notes})</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMaterial(idx)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-12 gap-2">
              <input
                type="text"
                value={newMaterialName}
                onChange={(e) => setNewMaterialName(e.target.value)}
                placeholder="Material"
                className="input-field col-span-4"
              />
              <input
                type="text"
                value={newMaterialQty}
                onChange={(e) => setNewMaterialQty(e.target.value)}
                placeholder="Cantidad"
                className="input-field col-span-3"
              />
              <input
                type="text"
                value={newMaterialNotes}
                onChange={(e) => setNewMaterialNotes(e.target.value)}
                placeholder="Notas (opc)"
                className="input-field col-span-4"
              />
              <button
                type="button"
                onClick={addMaterial}
                className="btn-secondary col-span-1"
              >
                +
              </button>
            </div>
          </div>

          {/* Abbreviations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Leyenda de Abreviaturas</label>
              <button
                type="button"
                onClick={() => setShowAbbrevPicker(!showAbbrevPicker)}
                className="text-sm text-sage-600 hover:text-sage-700"
              >
                {showAbbrevPicker ? 'Ocultar' : 'Agregar más'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {formData.abbreviations.map((abbr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleAbbreviation(abbr)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-sage-100 text-sage-700 rounded-lg text-sm hover:bg-sage-200 transition-colors"
                >
                  <span className="font-mono font-bold">{abbr.code}</span>
                  <span className="text-xs">{abbr.name}</span>
                </button>
              ))}
            </div>

            {showAbbrevPicker && (
              <div className="p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {standardAbbrs.map((abbr) => {
                    const isSelected = formData.abbreviations.find(a => a.code === abbr.code);
                    return (
                      <button
                        key={abbr.code}
                        type="button"
                        onClick={() => toggleAbbreviation(abbr)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm transition-colors ${
                          isSelected
                            ? 'bg-sage-200 text-sage-800'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="font-mono font-bold">{abbr.code}</span>
                        <span className="text-xs">{abbr.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <label className="label mb-2">Enlaces de Apoyo</label>
            <div className="space-y-2 mb-2">
              {formData.links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-sage-50 rounded-lg">
                  <span className="text-sm text-gray-700 flex-1 truncate">{link.title}</span>
                  <button
                    type="button"
                    onClick={() => removeLink(idx)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="Título"
                className="input-field flex-1"
              />
              <input
                type="url"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://..."
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={addLink}
                className="btn-secondary"
              >
                +
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white py-4 -mx-6 px-6 border-t border-sage-100">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {pattern ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Section Modal Component
interface SectionModalProps {
  section: PatternSection | null;
  onClose: () => void;
  onSave: (data: Partial<PatternSection>) => void;
}

function SectionModal({ section, onClose, onSave }: SectionModalProps) {
  const [formData, setFormData] = useState({
    name: section?.name || '',
    instructions: section?.instructions || '',
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
            {section ? 'Editar Sección' : 'Nueva Sección'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Nombre de la Sección</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Ej: Cabeza, Cuerpo, Brazos..."
              required
            />
          </div>

          <div>
            <label className="label">Instrucciones Generales</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="Notas para esta sección..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {section ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Round Modal Component
interface RoundModalProps {
  round: PatternRound | null;
  sectionId: string;
  existingRounds: PatternRound[];
  onClose: () => void;
  onSave: (data: Partial<PatternRound>) => void;
}

function RoundModal({ round, existingRounds, onClose, onSave }: RoundModalProps) {
  const maxRoundNumber = existingRounds.length > 0
    ? Math.max(...existingRounds.map(r => r.round_number))
    : 0;

  const [formData, setFormData] = useState({
    round_number: round?.round_number || maxRoundNumber + 1,
    instruction: round?.instruction || '',
    stitch_count: round?.stitch_count || 0,
    notes: round?.notes || '',
    is_completed: round?.is_completed || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-sage-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {round ? 'Editar Vuelta' : 'Nueva Vuelta'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Número de Vuelta</label>
              <input
                type="number"
                value={formData.round_number}
                onChange={(e) => setFormData({ ...formData, round_number: parseInt(e.target.value) || 1 })}
                className="input-field"
                min="1"
                required
              />
            </div>

            <div>
              <label className="label">Total de Puntos</label>
              <input
                type="number"
                value={formData.stitch_count}
                onChange={(e) => setFormData({ ...formData, stitch_count: parseInt(e.target.value) || 0 })}
                className="input-field"
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="label">Instrucción</label>
            <textarea
              value={formData.instruction}
              onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
              className="input-field resize-none font-mono"
              rows={3}
              placeholder="Ej: 6 pb en anillo mágico (6)"
              required
            />
          </div>

          <div>
            <label className="label">Notas (opcional)</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              placeholder="Notas adicionales para esta vuelta..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {round ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Patterns;
