import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  X,
  Edit2,
  Trash2,
  Calendar,
  User,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  Truck,
} from 'lucide-react';
import { storage } from '../lib/storage';
import type { Order } from '../lib/supabase';

type ProgressStatus = 'Sin empezar' | 'Tejiendo' | 'Terminado' | 'Entregado';
type PaymentStatus = 'Pendiente' | 'Anticipo' | 'Liquidado';

interface KanbanColumn {
  id: ProgressStatus;
  title: string;
  icon: typeof Clock;
  color: string;
  bgColor: string;
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const data = await storage.getOrders();
    setOrders(data);
    setLoading(false);
  };

  const columns: KanbanColumn[] = [
    { id: 'Sin empezar', title: 'Sin empezar', icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-100' },
    { id: 'Tejiendo', title: 'Tejiendo', icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'Terminado', title: 'Terminado', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100' },
    { id: 'Entregado', title: 'Entregado', icon: Truck, color: 'text-sage-600', bgColor: 'bg-sage-100' },
  ];

  const handleDragStart = (order: Order) => {
    setDraggedOrder(order);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: ProgressStatus) => {
    if (!draggedOrder) return;

    await storage.updateOrder(draggedOrder.id, { progress_status: status });
    setOrders(orders.map(o =>
      o.id === draggedOrder.id ? { ...o, progress_status: status } : o
    ));
    setDraggedOrder(null);
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('¿Eliminar este pedido?')) return;
    await storage.deleteOrder(id);
    setOrders(orders.filter(o => o.id !== id));
  };

  const getDaysLeft = (deliveryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const delivery = new Date(deliveryDate);
    delivery.setHours(0, 0, 0, 0);
    return Math.ceil((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const filteredOrders = filter === 'active'
    ? orders.filter(o => o.progress_status !== 'Entregado')
    : orders;

  const ordersByStatus = columns.reduce((acc, col) => {
    acc[col.id] = filteredOrders.filter(o => o.progress_status === col.id);
    return acc;
  }, {} as Record<ProgressStatus, Order[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de pedidos</h1>
          <p className="text-gray-600 mt-1">Arrastra las tarjetas para cambiar el estado</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-sage-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === 'active' ? 'bg-white shadow-sm text-sage-800' : 'text-gray-600'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === 'all' ? 'bg-white shadow-sm text-sage-800' : 'text-gray-600'
              }`}
            >
              Todos
            </button>
          </div>
          <button
            onClick={() => {
              setEditingOrder(null);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo pedido</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {columns.map((column) => {
            const Icon = column.icon;
            const columnOrders = ordersByStatus[column.id] || [];
            return (
              <div
                key={column.id}
                className="bg-sage-50/50 rounded-xl p-4 min-h-[400px]"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sage-200">
                  <div className={`w-8 h-8 rounded-lg ${column.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${column.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-800 flex-1">{column.title}</h3>
                  <span className={`${column.bgColor} ${column.color} text-xs font-medium px-2 py-0.5 rounded-full`}>
                    {columnOrders.length}
                  </span>
                </div>

                {/* Orders */}
                <div className="space-y-3 min-h-[300px]">
                  {columnOrders.map((order) => {
                    const daysLeft = getDaysLeft(order.delivery_date);
                    const isUrgent = daysLeft <= 2 && daysLeft >= 0;
                    const isLate = daysLeft < 0;

                    return (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={() => handleDragStart(order)}
                        className="card p-4 cursor-move group hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-800 flex-1 pr-2">{order.product_name}</h4>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingOrder(order);
                                setShowModal(true);
                              }}
                              className="btn-icon w-7 h-7"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="btn-icon w-7 h-7 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <User className="w-4 h-4" />
                          <span>{order.customer_name}</span>
                        </div>

                        {/* Delivery Date Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-medium ${
                            isLate ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-gray-600'
                          }`}>
                            {isLate ? `${Math.abs(daysLeft)} días de retraso` :
                             daysLeft === 0 ? 'Entrega hoy' :
                             daysLeft === 1 ? 'Mañana' :
                             `${daysLeft} días`}
                          </span>
                        </div>

                        {/* Payment Status */}
                        <div className="flex items-center justify-between pt-2 border-t border-sage-100">
                          <span className={`status-badge ${
                            order.payment_status === 'Pendiente' ? 'status-pending' :
                            order.payment_status === 'Anticipo' ? 'status-anticipo' :
                            'status-settled'
                          }`}>
                            {order.payment_status}
                          </span>
                          <span className="font-semibold text-sage-700">${order.price.toFixed(0)}</span>
                        </div>

                        {order.notes && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{order.notes}</p>
                        )}

                        {/* Urgency Alert */}
                        {(isUrgent || isLate) && (
                          <div className={`mt-2 flex items-center gap-1.5 text-xs ${
                            isLate ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="font-medium">
                              {isLate ? '¡Retrasado!' : '¡Urgente!'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {columnOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-sage-200 rounded-lg">
                      <Icon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Sin pedidos</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Modal */}
      {showModal && (
        <OrderModal
          order={editingOrder}
          onClose={() => setShowModal(false)}
          onSave={async (orderData) => {
            if (editingOrder) {
              await storage.updateOrder(editingOrder.id, orderData);
              loadOrders();
            } else {
              await storage.saveOrder(orderData as Omit<Order, 'id' | 'created_at' | 'updated_at'>);
              loadOrders();
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

// Order Modal Component
interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
  onSave: (data: Partial<Order>) => void;
}

function OrderModal({ order, onClose, onSave }: OrderModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    customer_name: order?.customer_name || '',
    customer_contact: order?.customer_contact || '',
    product_name: order?.product_name || '',
    description: order?.description || '',
    delivery_date: order?.delivery_date || today,
    payment_status: order?.payment_status || 'Pendiente' as PaymentStatus,
    progress_status: order?.progress_status || 'Sin empezar' as ProgressStatus,
    price: order?.price || 0,
    notes: order?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8 animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-sage-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {order ? 'Editar Pedido' : 'Nuevo Pedido'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre del Cliente</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Contacto</label>
              <input
                type="text"
                value={formData.customer_contact}
                onChange={(e) => setFormData({ ...formData, customer_contact: e.target.value })}
                className="input-field"
                placeholder="Tel/email"
              />
            </div>
          </div>

          <div>
            <label className="label">Producto Solicitado</label>
            <input
              type="text"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Descripción / Detalles</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
              rows={2}
              placeholder="Personalización, colores, detalles especiales..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha de Entrega</label>
              <input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                className="input-field"
                min={today}
              />
            </div>

            <div>
              <label className="label">Precio ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Estado del Pago</label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as PaymentStatus })}
                className="input-field"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Anticipo">Anticipo</option>
                <option value="Liquidado">Liquidado</option>
              </select>
            </div>

            <div>
              <label className="label">Estado del Progreso</label>
              <select
                value={formData.progress_status}
                onChange={(e) => setFormData({ ...formData, progress_status: e.target.value as ProgressStatus })}
                className="input-field"
              >
                <option value="Sin empezar">Sin empezar</option>
                <option value="Tejiendo">Tejiendo</option>
                <option value="Terminado">Terminado</option>
                <option value="Entregado">Entregado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Notas Adicionales</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field resize-none"
              rows={2}
              placeholder="Instrucciones especiales, preferencias..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {order ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Orders;
