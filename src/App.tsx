import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Calculator,
  BookOpen,
  Menu,
  X,
  Heart,
  Hash,
  BookMarked
} from 'lucide-react';
import { storage } from './lib/storage';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import PriceCalculator from './components/PriceCalculator';
import Orders from './components/Orders';
import Patterns from './components/Patterns';
import RoundCounter from './components/RoundCounter';
import CrochetGlossary from './components/CrochetGlossary';

type Tab = 'dashboard' | 'inventory' | 'calculator' | 'orders' | 'patterns' | 'counter' | 'glossary';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      await storage.seedMockData();
      setIsLoading(false);
    };
    initializeData();
  }, []);

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory' as Tab, label: 'Inventario', icon: Package },
    { id: 'counter' as Tab, label: 'Contador', icon: Hash },
    { id: 'glossary' as Tab, label: 'Diccionario', icon: BookMarked },
    { id: 'calculator' as Tab, label: 'Calculadora', icon: Calculator },
    { id: 'orders' as Tab, label: 'Pedidos', icon: ShoppingCart },
    { id: 'patterns' as Tab, label: 'Patrones', icon: BookOpen },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'inventory':
        return <Inventory />;
      case 'counter':
        return <RoundCounter />;
      case 'glossary':
        return <CrochetGlossary />;
      case 'calculator':
        return <PriceCalculator />;
      case 'orders':
        return <Orders />;
      case 'patterns':
        return <Patterns />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-sage-400 to-mint-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-sage-800 mb-2">CrochetCraft</h1>
          <p className="text-gray-500 text-sm">Cargando tu taller creativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 btn-icon bg-white shadow-card"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-sage-200 shadow-soft transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-8 border-b border-sage-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-mint-500 rounded-xl flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-sage-800">CrochetCraft</h1>
                <p className="text-xs text-gray-500">Taller de tejido</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-sage-100 text-sage-800 font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-sage-50 hover:text-sage-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-sage-600' : ''}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-6 bg-sage-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-sage-100">
            <p className="text-xs text-gray-400 text-center">
              Hecho con amor y muchos puntos
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
