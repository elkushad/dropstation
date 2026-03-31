import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Pencil, Trash2, Loader2, Upload, Store, MessageCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import ProductForm from '../components/dashboard/ProductForm';
import MainTab from '../components/dashboard/MainTab';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';
import AdModal from '../components/ads/AdModal';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BrandDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [brandForm, setBrandForm] = useState(null);
  const [savingBrand, setSavingBrand] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [activeTab, setActiveTab] = useState('main');
  const [showAdModal, setShowAdModal] = useState(false);

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  // Get user's brand
  const { data: brands, isLoading: loadingBrand } = useQuery({
    queryKey: ['my-brand', user?.email],
    queryFn: () => base44.entities.Brand.filter({ created_by: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const brand = brands?.[0];

  // Get active subscription
  const { data: subs = [] } = useQuery({
    queryKey: ['my-subscription', brand?.id],
    queryFn: () => base44.entities.Subscription.filter({ brand_id: brand.id, status: 'active' }),
    enabled: !!brand?.id,
  });
  const activeSub = subs?.[0];

  // Get brand products
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['my-products', brand?.id],
    queryFn: () => base44.entities.Product.filter({ brand_id: brand.id }),
    enabled: !!brand?.id,
    initialData: [],
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setBrandForm(f => ({ ...f, logo_url: file_url }));
    setUploadingLogo(false);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setBrandForm(f => ({ ...f, cover_url: file_url }));
    setUploadingCover(false);
  };

  const handleSaveBrand = async (e) => {
    e.preventDefault();
    if (!brandForm?.name) {
      toast.error('El nombre es obligatorio');
      return;
    }
    setSavingBrand(true);
    const data = {
      ...brandForm,
      slug: brandForm.name.toLowerCase().replace(/\s+/g, '-'),
      status: 'active',
    };
    if (brand?.id) {
      await base44.entities.Brand.update(brand.id, data);
      toast.success('Marca actualizada');
    } else {
      await base44.entities.Brand.create(data);
      toast.success('Marca creada');
    }
    setSavingBrand(false);
    setBrandForm(null);
    queryClient.invalidateQueries({ queryKey: ['my-brand'] });
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await base44.entities.Product.delete(productId);
    toast.success('Producto eliminado');
    queryClient.invalidateQueries({ queryKey: ['my-products'] });
  };

  if (loadingBrand) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  // Brand setup form
  if (!brand && !brandForm) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/20 flex items-center justify-center mx-auto mb-6">
          <Store className="w-8 h-8 text-violet-400" />
        </div>
        <h1 className="text-2xl font-black text-white">Crea tu marca</h1>
        <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
          Configura tu perfil de marca para empezar a vender en DropStation
        </p>
        <Button
          onClick={() => setBrandForm({ name: '', description: '', city: '', instagram: '', website: '' })}
          className="mt-6 bg-violet-600 hover:bg-violet-700 text-white rounded-full px-8"
        >
          Comenzar
        </Button>
      </div>
    );
  }

  // Brand edit form
  if (brandForm !== null) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-2xl font-black text-white mb-8">{brand ? 'Editar marca' : 'Nueva marca'}</h1>
        <form onSubmit={handleSaveBrand} className="space-y-5">
          {/* Cover upload */}
          <div>
            <Label className="text-zinc-300 mb-2 block">Portada</Label>
            <div className="relative h-32 rounded-xl bg-zinc-800 overflow-hidden">
              {brandForm.cover_url ? (
                <img src={brandForm.cover_url} alt="" className="w-full h-full object-cover" />
              ) : uploadingCover ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="w-5 h-5 text-zinc-500" />
                </div>
              )}
              <label className="absolute bottom-2 right-2">
                <Button type="button" size="sm" variant="outline" className="border-zinc-700 text-zinc-300 rounded-full text-xs" asChild>
                  <span>Cambiar portada</span>
                </Button>
                <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {brandForm.logo_url ? (
                <img src={brandForm.logo_url} alt="" className="w-full h-full object-cover" />
              ) : uploadingLogo ? (
                <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-zinc-500" />
              )}
            </div>
            <label>
              <Button type="button" variant="outline" className="border-zinc-700 text-zinc-300 rounded-full text-sm" asChild>
                <span>Subir logo</span>
              </Button>
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>
          </div>

          <div>
            <Label className="text-zinc-300">Nombre de la marca *</Label>
            <Input
              value={brandForm.name}
              onChange={(e) => setBrandForm(f => ({ ...f, name: e.target.value }))}
              className="bg-zinc-900 border-zinc-700 text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-zinc-300">Descripción</Label>
            <Textarea
              value={brandForm.description}
              onChange={(e) => setBrandForm(f => ({ ...f, description: e.target.value }))}
              className="bg-zinc-900 border-zinc-700 text-white mt-1"
              placeholder="La historia de tu marca..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Ciudad</Label>
              <Input
                value={brandForm.city}
                onChange={(e) => setBrandForm(f => ({ ...f, city: e.target.value }))}
                className="bg-zinc-900 border-zinc-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-300">País</Label>
              <select
                value={brandForm.country || ''}
                onChange={(e) => setBrandForm(f => ({ ...f, country: e.target.value }))}
                className="w-full mt-1 h-9 rounded-md bg-zinc-900 border border-zinc-700 text-white px-3 text-sm"
              >
                <option value="">Seleccionar país</option>
                <option value="PE">🇵🇪 Perú</option>
                <option value="MX">🇲🇽 México</option>
                <option value="AR">🇦🇷 Argentina</option>
                <option value="CO">🇨🇴 Colombia</option>
                <option value="CL">🇨🇱 Chile</option>
                <option value="BR">🇧🇷 Brasil</option>
                <option value="US">🇺🇸 USA</option>
              </select>
            </div>
            <div>
              <Label className="text-zinc-300">Instagram</Label>
              <Input
                value={brandForm.instagram}
                onChange={(e) => setBrandForm(f => ({ ...f, instagram: e.target.value }))}
                className="bg-zinc-900 border-zinc-700 text-white mt-1"
                placeholder="@tumarca"
              />
            </div>
          </div>
          <div>
            <Label className="text-zinc-300">Sitio web</Label>
            <Input
              value={brandForm.website}
              onChange={(e) => setBrandForm(f => ({ ...f, website: e.target.value }))}
              className="bg-zinc-900 border-zinc-700 text-white mt-1"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={savingBrand} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-full h-12 font-semibold">
              {savingBrand ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar marca'}
            </Button>
            {brand && (
              <Button type="button" variant="outline" onClick={() => setBrandForm(null)} className="border-zinc-700 text-zinc-300 rounded-full h-12">
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Brand header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-zinc-800 overflow-hidden">
            {brand.logo_url ? (
              <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-black text-zinc-500">
                {brand.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{brand.name}</h1>
            <p className="text-zinc-500 text-sm">{brand.city || 'Sin ubicación'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/BrandInbox">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 rounded-full text-sm">
              <MessageCircle className="w-4 h-4 mr-1" /> Mensajes
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setBrandForm({ ...brand })}
            className="border-zinc-700 text-zinc-300 rounded-full text-sm"
          >
            <Pencil className="w-4 h-4 mr-1" /> Editar marca
          </Button>
          <Button
            onClick={() => {
              if (!activeSub) { 
                setShowAdModal(true);
                return; 
              }
              const activeCount = products.filter(p => p.status === 'active').length;
              if (activeCount >= activeSub.max_products) {
                toast.error(`Tu plan permite máximo ${activeSub.max_products} prendas activas. Sube de plan para más.`);
                return;
              }
              setEditingProduct(null);
              setShowProductForm(true);
            }}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-full text-sm"
          >
            <Plus className="w-4 h-4 mr-1" /> Nuevo producto
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full md:w-auto bg-zinc-900 border border-zinc-800 mb-8">
          <TabsTrigger value="main" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            <Package className="w-4 h-4 mr-2" />
            Principal
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main">
          <MainTab
            brand={brand}
            products={products}
            activeSub={activeSub}
            loadingProducts={loadingProducts}
            onEditProduct={(product) => { setEditingProduct(product); setShowProductForm(true); }}
            onDeleteProduct={handleDeleteProduct}
            onCreateProduct={() => { setEditingProduct(null); setShowProductForm(true); }}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab brand={brand} products={products} />
        </TabsContent>
      </Tabs>

      {/* Ad modal for free plan users */}
      <AdModal 
        open={showAdModal} 
        onOpenChange={setShowAdModal}
        onAdComplete={() => {
          setShowAdModal(false);
          setEditingProduct(null);
          setShowProductForm(true);
        }}
      />

      {/* Product form dialog */}
      <ProductForm
        open={showProductForm}
        onOpenChange={setShowProductForm}
        product={editingProduct}
        brand={brand}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['my-products'] })}
      />
    </div>
  );
}