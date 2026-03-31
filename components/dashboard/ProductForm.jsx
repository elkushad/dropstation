import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'hoodies', label: 'Hoodies' },
  { value: 't-shirts', label: 'T-Shirts' },
  { value: 'pants', label: 'Pants' },
  { value: 'jackets', label: 'Jackets' },
  { value: 'sneakers', label: 'Sneakers' },
  { value: 'accessories', label: 'Accesorios' },
  { value: 'caps', label: 'Caps' },
  { value: 'shorts', label: 'Shorts' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const EMPTY_FORM = {
  sku: '',
  name: '',
  description: '',
  price: '',
  compare_price: '',
  category: '',
  sizes: [],
  size_stock: {},
  colors: [],
  stock: '',
  images: [],
};

export default function ProductForm({ open, onOpenChange, product, brand, onSuccess }) {
  const [form, setForm] = useState(product ? { ...EMPTY_FORM, ...product } : EMPTY_FORM);

  useEffect(() => {
    setForm(product ? { ...EMPTY_FORM, ...product } : EMPTY_FORM);
  }, [product, open]);
  const [colorInput, setColorInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, images: [...(f.images || []), file_url] }));
    setUploading(false);
  };

  const removeImage = (index) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const toggleSize = (size) => {
    setForm(f => {
      const hasSize = f.sizes?.includes(size);
      const newSizes = hasSize ? f.sizes.filter(s => s !== size) : [...(f.sizes || []), size];
      const newSizeStock = { ...f.size_stock };
      if (hasSize) delete newSizeStock[size];
      else newSizeStock[size] = newSizeStock[size] ?? 0;
      return { ...f, sizes: newSizes, size_stock: newSizeStock };
    });
  };

  const setSizeStock = (size, value) => {
    setForm(f => ({ ...f, size_stock: { ...f.size_stock, [size]: Number(value) || 0 } }));
  };

  const addColor = () => {
    if (colorInput.trim() && !form.colors?.includes(colorInput.trim())) {
      setForm(f => ({ ...f, colors: [...(f.colors || []), colorInput.trim()] }));
      setColorInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    if ((form.images?.length || 0) < 2) {
      toast.error('Debes subir al menos 2 imágenes');
      return;
    }
    setSaving(true);
    const totalStock = form.sizes?.length > 0
      ? Object.values(form.size_stock || {}).reduce((a, b) => a + b, 0)
      : (form.stock ? Number(form.stock) : 0);
    // If the product belongs to a drop, keep it as draft — the automation publishes it when the drop goes live
    const data = {
      ...form,
      price: Number(form.price),
      compare_price: form.compare_price ? Number(form.compare_price) : undefined,
      stock: totalStock,
      brand_id: brand?.id,
      brand_name: brand?.name,
      status: form.drop_id ? 'draft' : 'active',
    };

    if (product?.id) {
      await base44.entities.Product.update(product.id, data);
      toast.success('Producto actualizado');
    } else {
      await base44.entities.Product.create(data);
      toast.success('Producto creado');
    }
    setSaving(false);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{product ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">SKU</Label>
              <Input
                value={form.sku}
                onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))}
                className="bg-zinc-900 border-zinc-700 text-white mt-1"
                placeholder="Ej: HOD-001"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-zinc-900 border-zinc-700 text-white mt-1"
                placeholder="Nombre del producto"
              />
            </div>
          </div>

          <div>
            <Label className="text-zinc-300">Descripción</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="bg-zinc-900 border-zinc-700 text-white mt-1 h-20"
              placeholder="Describe tu producto..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Precio *</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                className="bg-zinc-900 border-zinc-700 text-white mt-1"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Precio anterior</Label>
              <Input
                type="number"
                value={form.compare_price}
                onChange={(e) => setForm(f => ({ ...f, compare_price: e.target.value }))}
                className="bg-zinc-900 border-zinc-700 text-white mt-1"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Categoría *</Label>
              <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white mt-1">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(!form.sizes || form.sizes.length === 0) && (
              <div>
                <Label className="text-zinc-300">Stock general</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                  className="bg-zinc-900 border-zinc-700 text-white mt-1"
                  placeholder="0"
                />
              </div>
            )}
          </div>

          {/* Sizes + stock per size */}
          <div>
            <Label className="text-zinc-300">Tallas y stock</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.sizes?.includes(size)
                      ? 'bg-violet-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {form.sizes?.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.sizes.map(size => (
                  <div key={size} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-violet-400 w-8 text-center">{size}</span>
                    <Input
                      type="number"
                      min="0"
                      value={form.size_stock?.[size] ?? 0}
                      onChange={e => setSizeStock(size, e.target.value)}
                      className="bg-zinc-900 border-zinc-700 text-white h-8 text-sm w-24"
                      placeholder="Stock"
                    />
                    <span className="text-xs text-zinc-500">unidades</span>
                  </div>
                ))}
                <p className="text-xs text-zinc-500 pt-1">
                  Total: <span className="text-white font-semibold">
                    {Object.values(form.size_stock || {}).reduce((a, b) => a + b, 0)} unidades
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Colors */}
          <div>
            <Label className="text-zinc-300">Colores</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                className="bg-zinc-900 border-zinc-700 text-white flex-1"
                placeholder="Ej: Negro"
              />
              <Button type="button" onClick={addColor} variant="outline" className="border-zinc-700 text-zinc-300">
                +
              </Button>
            </div>
            {form.colors?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.colors.map((color, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300">
                    {color}
                    <button type="button" onClick={() => setForm(f => ({ ...f, colors: f.colors.filter((_, idx) => idx !== i) }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <Label className="text-zinc-300">
              Imágenes <span className="text-zinc-500 font-normal">(mínimo 2, máximo 5)</span>
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.images?.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-800">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {(form.images?.length || 0) < 5 && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center cursor-pointer hover:border-violet-500 transition-colors">
                  {uploading ? <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" /> : <Upload className="w-5 h-5 text-zinc-500" />}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {form.images?.length || 0}/5 imágenes
              {(form.images?.length || 0) < 2 && (
                <span className="text-yellow-500 ml-2">— agrega al menos {2 - (form.images?.length || 0)} más</span>
              )}
            </p>
          </div>

          <Button type="submit" disabled={saving} className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-full h-12 font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : product ? 'Guardar cambios' : 'Publicar producto'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}