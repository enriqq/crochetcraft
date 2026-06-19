import { useState, useEffect } from 'react';
import {
  Package,
  Boxes,
  ShoppingCart,
  DollarSign,
  Calculator,
  Plus,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Hash,
  BookMarked,
} from 'lucide-react';
import { storage } from '../lib/storage';
import type { Product, Material, Order } from '../lib/supabase';

type Tab = 'dashboard' | 'inventory' | 'calculator' | 'orders' | 'patterns' | 'counter' | 'glossary';

interface DashboardProps {
  onNavigate: (tab: Tab) => void;
}

function Dashboard({ onNavigate }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const productsData = await storage.getProducts();
      const materialsData = await storage.getMaterials();
      const ordersData = await storage.getOrders();
      setProducts(productsData);
      setMaterials(materialsData);
      setOrders(ordersData);
      setLoading(false);
    };
    loadData();
  }, []);

  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalMaterials = materials.length;
  const pendingOrders = orders.filter(
    o => o.progress_status !== 'Entregado' && o.progress_status !== 'Terminado'
  ).length;
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const quickActions = [
    { label: 'Contador de Vueltas', icon: Hash, tab: 'counter' as Tab, color: 'bg-violet-100 text-violet-700' },
    { label: 'Diccionario de Puntos', icon: BookMarked, tab: 'glossary' as Tab, color: 'bg-sky-100 text-sky-700' },
    { label: 'Calcular Precio', icon: Calculator, tab: 'calculator' as Tab, color: 'bg-mint-100 text-mint-700' },
    { label: 'Registrar Pedido', icon: Plus, tab: 'orders' as Tab, color: 'bg-amber-100 text-amber-700' },
    { label: 'Ver Patrones', icon: BookOpen, tab: 'patterns' as Tab, color: 'bg-sage-100 text-sage-700' },
  ];

  const upcomingOrders = orders
    .filter(o => o.progress_status !== 'Entregado')
    .sort((a, b) => new Date(a.delivery_date).getTime() - new Date(b.delivery_date).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenida a tu taller</h1>
        <p className="text-gray-600 mt-1">Aquí tienes un resumen de tu negocio artesanal</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="metric-card">
          <div className="metric-icon bg-mint-100">
            <Package className="w-6 h-6 text-mint-600" />
          </div>
          <div className="metric-value">{totalStock}</div>
          <div className="metric-label">Productos en Stock</div>
          <div className="mt-3 pt-3 border-t border-sage-100">
            <div className="flex items-center gap-1.5 text-sm text-mint-600">
              <TrendingUp className="w-4 h-4" />
              <span>{products.filter(p => p.status === 'Disponible').length} disponibles</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon bg-sage-100">
            <Boxes className="w-6 h-6 text-sage-600" />
          </div>
          <div className="metric-value">{totalMaterials}</div>
          <div className="metric-label">Materiales en Inventario</div>
          <div className="mt-3 pt-3 border-t border-sage-100">
            <div className="text-sm text-gray-500">
              {materials.filter(m => m.type === 'algodón').length} de algodón
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon bg-amber-100">
            <ShoppingCart className="w-6 h-6 text-amber-600" />
          </div>
          <div className="metric-value">{pendingOrders}</div>
          <div className="metric-label">Pedidos Pendientes</div>
          <div className="mt-3 pt-3 border-t border-sage-100">
            <div className="flex items-center gap-1.5 text-sm text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span>{orders.filter(o => o.payment_status === 'Pendiente').length} sin pago</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon bg-green-100">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="metric-value">${inventoryValue.toFixed(0)}</div>
          <div className="metric-label">Valor del Inventario</div>
          <div className="mt-3 pt-3 border-t border-sage-100">
            <div className="text-sm text-gray-500">
              Total en productos
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-2">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onNavigate(action.tab)}
                  className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-sage-50 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800 group-hover:text-sage-700 transition-colors">
                      {action.label}
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-sage-500 transition-colors">
                    →
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Próximos Pedidos</h2>
            {orders.length > 3 && (
              <button
                onClick={() => onNavigate('orders')}
                className="text-sm text-sage-600 hover:text-sage-700 font-medium"
              >
                Ver todos
              </button>
            )}
          </div>

          {upcomingOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No hay pedidos pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingOrders.map((order) => {
                const daysLeft = Math.ceil(
                  (new Date(order.delivery_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                const isUrgent = daysLeft <= 2;
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-sage-50/50 hover:bg-sage-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {order.product_name}
                      </div>
                      <div className="text-sm text-gray-500">{order.customer_name}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                        {daysLeft === 0 ? 'Hoy' : daysLeft === 1 ? 'Mañana' : `${daysLeft} días`}
                      </div>
                      <div className={`status-badge mt-1 ${
                        order.progress_status === 'Tejiendo' ? 'status-anticipo' :
                        order.progress_status === 'Terminado' ? 'status-settled' :
                        'status-pending'
                      }`}>
                        {order.progress_status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Products */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Productos Recientes</h2>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-sm text-sage-600 hover:text-sage-700 font-medium"
          >
            Ver catálogo
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="p-4 rounded-lg bg-gradient-to-br from-sage-50 to-white border border-sage-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-sage-600" />
                </div>
                <span className={`status-badge ${
                  product.status === 'Disponible' ? 'status-available' :
                  product.status === 'Agotado' ? 'status-sold-out' :
                  'status-by-order'
                }`}>
                  {product.status}
                </span>
              </div>
              <div className="font-medium text-gray-800 mb-1 truncate">{product.name}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Qty: {product.quantity}</span>
                <span className="font-semibold text-sage-700">${product.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
