import { useState, useEffect } from "react";
import {
  Calculator as CalcIcon,
  DollarSign,
  Clock,
  TrendingUp,
  Package,
  Save,
  ChevronDown,
  X,
  Sparkles,
} from "lucide-react";
import { storage } from "../lib/storage";
import Swal from "sweetalert2";
import type { Material, Product } from "../lib/supabase";

interface MaterialUsage {
  materialId: string;
  quantity: number;
}

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  background: "#f9fafb",
  iconColor: "#6b8273", // Verde Sage Pastel
  customClass: {
    popup:
      "rounded-xl shadow-md font-sans border border-sage-100 text-gray-800",
  },
});

function PriceCalculator() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [productName, setProductName] = useState("");
  const [materialUsages, setMaterialUsages] = useState<MaterialUsage[]>([]);
  const [directMaterialCost, setDirectMaterialCost] = useState(0);
  const [useMaterialFromInventory, setUseMaterialFromInventory] =
    useState(true);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(15);
  const [marginPercentage, setMarginPercentage] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    const data = await storage.getMaterials();
    setMaterials(data);
    setLoading(false);
  };

  const addMaterialUsage = () => {
    if (materials.length > 0) {
      setMaterialUsages([
        ...materialUsages,
        { materialId: materials[0].id, quantity: 50 },
      ]);
    }
  };

  const removeMaterialUsage = (index: number) => {
    setMaterialUsages(materialUsages.filter((_, i) => i !== index));
  };

  const updateMaterialUsage = (
    index: number,
    field: "materialId" | "quantity",
    value: string | number,
  ) => {
    const updated = [...materialUsages];
    if (field === "materialId") {
      updated[index].materialId = value as string;
    } else {
      updated[index].quantity = value as number;
    }
    setMaterialUsages(updated);
  };

  const calculateMaterialCost = () => {
    if (!useMaterialFromInventory) {
      return directMaterialCost;
    }

    return materialUsages.reduce((total, usage) => {
      const material = materials.find((m) => m.id === usage.materialId);
      if (!material) return total;

      const costPerUnit = material.cost / material.quantity;
      return total + costPerUnit * usage.quantity;
    }, 0);
  };

  const totalHours = hours + minutes / 60;
  const materialCost = calculateMaterialCost();
  const laborCost = totalHours * hourlyRate;
  const baseCost = materialCost + laborCost;
  const profit = baseCost * (marginPercentage / 100);
  const finalPrice = baseCost + profit;

  const handleSaveToCatalog = async () => {
    if (!productName.trim()) {
      Swal.fire({
        title: "¡Falta el nombre!",
        text: "Por favor, ingresa un nombre para el producto antes de guardarlo en el catálogo.",
        icon: "warning",
        confirmButtonColor: "#6b8273", // Verde Sage Pastel
        background: "#f9fafb",
        customClass: {
          popup: "rounded-2xl font-sans",
        },
      });
      return;
    }

    const productData: Omit<Product, "id" | "created_at" | "updated_at"> = {
      name: productName,
      description: `Calculado con ${totalHours.toFixed(1)}h de trabajo`,
      category: "Amigurumi",
      quantity: 0,
      price: finalPrice,
      status: "Bajo pedido",
      image_url: "",
    };

    await storage.saveProduct(productData);

    await storage.savePriceCalculation({
      product_name: productName,
      material_cost: materialCost,
      labor_hours: totalHours,
      hourly_rate: hourlyRate,
      margin_percentage: marginPercentage,
      final_price: finalPrice,
      saved_to_inventory: true,
    });

    Toast.fire({
      icon: "success",
      title: "¡Producto guardado en el catálogo!",
    });
    setProductName("");
    setMaterialUsages([]);
    setDirectMaterialCost(0);
    setHours(0);
    setMinutes(0);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sage-400 to-mint-500 rounded-2xl shadow-lg mb-4">
          <CalcIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Calculadora de precios
        </h1>
        <p className="text-gray-600 mt-1">
          Calcula el precio justo para tus creaciones
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Form */}
        <div className="space-y-5">
          {/* Product Name */}
          <div className="card p-5">
            <label className="label">Nombre del producto</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ej: Amigurumi de Conejito"
              className="input-field"
            />
          </div>

          {/* Materials Section */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-sage-600" />
                <h3 className="font-semibold text-gray-800">Materiales</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setUseMaterialFromInventory(true)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    useMaterialFromInventory
                      ? "bg-sage-100 text-sage-800"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  Del inventario
                </button>
                <button
                  onClick={() => setUseMaterialFromInventory(false)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    !useMaterialFromInventory
                      ? "bg-sage-100 text-sage-800"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  Costo directo
                </button>
              </div>
            </div>

            {useMaterialFromInventory ? (
              <div className="space-y-3">
                {materialUsages.map((usage, index) => {
                  const material = materials.find(
                    (m) => m.id === usage.materialId,
                  );
                  return (
                    <div key={index} className="flex gap-2 items-center">
                      <select
                        value={usage.materialId}
                        onChange={(e) =>
                          updateMaterialUsage(
                            index,
                            "materialId",
                            e.target.value,
                          )
                        }
                        className="input-field flex-1"
                        disabled={loading}
                      >
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} - {m.color} ({m.cost.toFixed(2)}/{m.unit})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={usage.quantity}
                        onChange={(e) =>
                          updateMaterialUsage(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="input-field w-24"
                        placeholder="Cant."
                        min="0"
                      />
                      <span className="text-sm text-gray-500 w-16">
                        {material?.unit || "g"}
                      </span>
                      <button
                        onClick={() => removeMaterialUsage(index)}
                        className="btn-icon hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={addMaterialUsage}
                  className="w-full py-2.5 border-2 border-dashed border-sage-200 rounded-lg text-sage-600 hover:border-sage-300 hover:bg-sage-50 transition-all flex items-center justify-center gap-2"
                >
                  <span className="font-medium">Agregar material</span>
                </button>
              </div>
            ) : (
              <div>
                <label className="label">Costo total de materiales</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={directMaterialCost}
                    onChange={(e) =>
                      setDirectMaterialCost(parseFloat(e.target.value) || 0)
                    }
                    className="input-field pl-10"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Labor Hours */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-sage-600" />
              <h3 className="font-semibold text-gray-800">Tiempo de trabajo</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Horas</label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                  max="99"
                />
              </div>
              <div>
                <label className="label">Minutos</label>
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    // Si el valor es mayor a 59, lo forzamos a ser 59 automáticamente
                    setMinutes(val > 59 ? 59 : val);
                  }}
                  className="input-field"
                  min="0"
                  max="59"
                />
              </div>
            </div>
          </div>

          {/* Hourly Rate & Margin */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-sage-600" />
              <h3 className="font-semibold text-gray-800">Tarifa y margen</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Valor por hora ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) =>
                      setHourlyRate(parseFloat(e.target.value) || 0)
                    }
                    className="input-field pl-10"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              <div>
                <label className="label flex items-center justify-between">
                  <span>Margen de ganancia</span>
                  <span className="text-sage-600 font-bold">
                    {marginPercentage}%
                  </span>
                </label>
                <input
                  type="range"
                  value={marginPercentage}
                  onChange={(e) =>
                    setMarginPercentage(parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-sage-100 rounded-lg appearance-none cursor-pointer accent-sage-600"
                  min="0"
                  max="50"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results Panel */}
        <div className="lg:sticky lg:top-8 space-y-5">
          <div className="card p-6 bg-gradient-to-br from-sage-50 to-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Desglose del precio
            </h3>

            <div className="space-y-4">
              {/* Material Cost */}
              <div className="flex items-center justify-between py-3 border-b border-sage-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-olive-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-olive-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">
                      Costo de materiales
                    </div>
                    <div className="text-xs text-gray-400">
                      {useMaterialFromInventory
                        ? `${materialUsages.length} materiales`
                        : "Costo directo"}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-800">
                  ${materialCost.toFixed(2)}
                </div>
              </div>

              {/* Labor Cost */}
              <div className="flex items-center justify-between py-3 border-b border-sage-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-mint-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-mint-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">
                      Mano de obra
                    </div>
                    <div className="text-xs text-gray-400">
                      {totalHours.toFixed(1)}h × ${hourlyRate}/h
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-800">
                  ${laborCost.toFixed(2)}
                </div>
              </div>

              {/* Profit Margin */}
              <div className="flex items-center justify-between py-3 border-b border-sage-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">
                      Ganancia neta
                    </div>
                    <div className="text-xs text-gray-400">
                      {marginPercentage}% de margen
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  +${profit.toFixed(2)}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-sage-600 to-mint-600 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90 text-sm font-medium">
                    PRECIO DE VENTA SUGERIDO
                  </span>
                  <Sparkles className="w-5 h-5 text-white/80" />
                </div>
                <div className="text-4xl font-bold">
                  ${finalPrice.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveToCatalog}
              className="w-full btn-primary mt-6 flex items-center justify-center gap-2 py-3"
            >
              <Save className="w-5 h-5" />
              <span>Guardar en catálogo</span>
            </button>
          </div>

          {/* Quick Tips */}
          <div className="card p-5 bg-gradient-to-br from-amber-50 to-white border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-3">
              Consejos para fijar precios
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>Considera el tiempo de diseño, no solo de tejido</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>Incluye costos de empaquetado y etiquetas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>Piezas complejas merecen mayor margen</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceCalculator;
