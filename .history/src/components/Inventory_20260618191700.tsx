import { useState, useEffect } from 'react';
import {
  Package,
  Boxes,
  Plus,
  Minus,
  Search,
  Filter,
  X,
  Edit2,
  Trash2,
  Circle,
  Palette,
} from 'lucide-react';
import { storage } from '../lib/storage';
import type { Product, Material } from '../lib/supabase';

type Tab = 'products' | 'materials';

function Inventory() {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const productsData = await storage.getProducts();
    const materialsData = await storage.getMaterials();
    setProducts(productsData);
    setMaterials(materialsData);
    setLoading(false);
  };

  const updateProductQuantity = async (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newQuantity = Math.max(0, product.quantity + delta);
    const newStatus = newQuantity === 0 ? 'Agotado' : product.status === 'Agotado' ? 'Disponible' : product.status;

    await storage.updateProduct(id, { quantity: newQuantity, status: newStatus });
    setProducts(products.map(p =>
      p.id === id ? { ...p, quantity: newQuantity, status: newStatus } : p
    ));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await storage.deleteProduct(id);
    setProducts(products.filter(p => p.id !== id));
  };

  const updateMaterialQuantity = async (id: string, delta: number) => {
    const material = materials.find(m => m.id === id);
    if (!material) return;

    const newQuantity = Math.max(0, material.quantity + delta);
    await storage.updateMaterial(id, { quantity: newQuantity });
    setMaterials(materials.map(m =>
      m.id === id ? { ...m, quantity: newQuantity } : m
    ));
  };

  const deleteMaterial = async (id: string) => {
    if (!confirm('¿Eliminar este material?')) return;
    await storage.deleteMaterial(id);
    setMaterials(materials.filter(m => m.id !== id));
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMaterials = materials.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.color.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600 mt-1">Gestiona tus productos y materiales</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-sage-100 rounded-lg">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all ${
            activeTab === 'products' ? 'tab-active' : 'tab-inactive'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="font-medium">Productos</span>
          <span className="bg-sage-200 text-sage-700 text-xs px-2 py-0.5 rounded-full">
            {products.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all ${
            activeTab === 'materials' ? 'tab-active' : 'tab-inactive'
          }`}
        >
          <Boxes className="w-5 h-5" />
          <span className="font-medium">Materia Prima</span>
          <span className="bg-sage-200 text-sage-700 text-xs px-2 py-0.5 rounded-full">
            {materials.length}
          </span>
        </button>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Buscar ${activeTab === 'products' ? 'productos' : 'materiales'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        {activeTab === 'products' && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowProductModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Producto</span>
          </button>
        )}
        {activeTab === 'materials' && (
          <button
            onClick={() => {
              setEditingMaterial(null);
              setShowMaterialModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Material</span>
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
        </div>
      ) : activeTab === 'products' ? (
        <div className="space-y-6">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts
                  .filter(p => p.category === category)
                  .map((product) => (
                    <div key={product.id} className="card p-5 group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-sage-100 to-mint-50 rounded-xl flex items-center justify-center shadow-sm">
                          <Package className="w-6 h-6 text-sage-600" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductModal(true);
                            }}
                            className="btn-icon"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="btn-icon hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-semibold text-gray-800 mb-1">{product.name}</h4>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>

                      <div className="flex items-center justify-between mb-3">
                        <span className={`status-badge ${
                          product.status === 'Disponible' ? 'status-available' :
                          product.status === 'Agotado' ? 'status-sold-out' :
                          'status-by-order'
                        }`}>
                          {product.status}
                        </span>
                        <span className="text-xl font-bold text-sage-700">${product.price}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-sage-100">
                        <span className="text-sm text-gray-600">Cantidad</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateProductQuantity(product.id, -1)}
                            className="btn-icon w-8 h-8"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold text-gray-800 w-8 text-center">
                            {product.quantity}
                          </span>
                          <button
                            onClick={() => updateProductQuantity(product.id, 1)}
                            className="btn-icon w-8 h-8"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No se encontraron productos</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-olive-100 to-sage-50 rounded-xl flex items-center justify-center shadow-sm relative">
                  <Circle className="w-6 h-6 text-olive-600" />
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: material.color.toLowerCase().includes('rosa') ? '#f9a8d4' :
                      material.color.toLowerCase().includes('verde') ? '#86efac' :
                      material.color.toLowerCase().includes('azul') ? '#93c5fd' :
                      material.color.toLowerCase().includes('beige') ? '#f5deb3' :
                      material.color.toLowerCase().includes('negro') ? '#374151' :
                      material.color.toLowerCase().includes('blanco') ? '#f9fafb' :
                      material.color.toLowerCase().includes('arcoíris') ? 'linear-gradient(45deg, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa)' :
                      '#d1d5db'
                    }}
                  />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingMaterial(material);
                      setShowMaterialModal(true);
                    }}
                    className="btn-icon"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMaterial(material.id)}
                    className="btn-icon hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-semibold text-gray-800 mb-1">{material.name}</h4>
              <p className="text-sm text-gray-500 mb-1">{material.brand}</p>

              <div className="flex items-center gap-2 mb-3">
                <span className="status-badge bg-sage-100 text-sage-700">
                  {material.type}
                </span>
                <span className="text-sm text-gray-500 capitalize">{material.color}</span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Cantidad</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateMaterialQuantity(material.id, -10)}
                    className="btn-icon w-8 h-8"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-gray-800 min-w-[60px] text-center">
                    {material.quantity} {material.unit}
                  </span>
                  <button
                    onClick={() => updateMaterialQuantity(material.id, 10)}
                    className="btn-icon w-8 h-8"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-sage-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Costo</span>
                <span className="font-semibold text-green-600">${material.cost.toFixed(2)}</span>
              </div>
            </div>
          ))}

          {filteredMaterials.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Boxes className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No se encontraron materiales</p>
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => setShowProductModal(false)}
          onSave={async (productData) => {
            if (editingProduct) {
              await storage.updateProduct(editingProduct.id, productData);
              loadData();
            } else {
              await storage.saveProduct(productData as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
              loadData();
            }
            setShowProductModal(false);
          }}
        />
      )}

      {/* Material Modal */}
      {showMaterialModal && (
        <MaterialModal
          material={editingMaterial}
          onClose={() => setShowMaterialModal(false)}
          onSave={async (materialData) => {
            if (editingMaterial) {
              await storage.updateMaterial(editingMaterial.id, materialData);
              loadData();
            } else {
              await storage.saveMaterial(materialData as Omit<Material, 'id' | 'created_at' | 'updated_at'>);
              loadData();
            }
            setShowMaterialModal(false);
          }}
        />
      )}
    </div>
  );
}

// Product Modal Component
interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}

function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'Amigurumi',
    quantity: product?.quantity || 0,
    price: product?.price || 0,
    status: product?.status || 'Disponible' as const,
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
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                <option>Amigurumi</option>
                <option>Ramo</option>
                <option>Llavero</option>
                <option>Hogar</option>
                <option>Topper</option>
                <option>Accesorios</option>
              </select>
            </div>

            <div>
              <label className="label">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Product['status'] })}
                className="input-field"
              >
                <option value="Disponible">Disponible</option>
                <option value="Agotado">Agotado</option>
                <option value="Bajo pedido">Bajo pedido</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Cantidad</label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="input-field"
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

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {product ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Material Modal Component
interface MaterialModalProps {
  material: Material | null;
  onClose: () => void;
  onSave: (data: Partial<Material>) => void;
}

function MaterialModal({ material, onClose, onSave }: MaterialModalProps) {
  const [formData, setFormData] = useState({
    name: material?.name || '',
    brand: material?.brand || '',
    color: material?.color || '',
    type: material?.type || 'acrílico' as const,
    quantity: material?.quantity || 0,
    unit: material?.unit || 'gramos' as const,
    cost: material?.cost || 0,
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
            {material ? 'Editar Material' : 'Nuevo Material'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Marca</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Material['type'] })}
                className="input-field"
              >
                <option value="acrílico">Acrílico</option>
                <option value="algodón">Algodón</option>
                <option value="lana">Lana</option>
                <option value="mixto">Mixto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Cantidad</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Unidad</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as Material['unit'] })}
                className="input-field"
              >
                <option value="gramos">Gramos</option>
                <option value="madejas">Madejas</option>
                <option value="metros">Metros</option>
              </select>
            </div>

            <div>
              <label className="label">Costo ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {material ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Inventory;
