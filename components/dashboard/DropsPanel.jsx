import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Zap, Loader2, Upload, Package } from 'lucide-react';
import { toast } from 'sonner';
import DropProductsManager from './DropProductsManager';

const EMPTY = { title: '', description: '', drop_date: '', teaser_image: '' };

export default function DropsPanel({ brand }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [managingDrop, setManagingDrop] = useState(null);

  const { data: drops = [], isLoading } = useQuery({
    queryKey: ['brand-drops', brand.id],
    queryFn: () => base44.entities.Drop.filter({ brand_id: brand.id }, '-drop_date'),
    enabled: !!brand.id,
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, teaser_image: file_url }));
    setUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.drop_date) {
      toast.error('Título y fecha son obligatorios');
      return;
    }
    setSaving(true);
    await base44.entities.Drop.create({
      brand_id: brand.id,
      brand_name: brand.name,
      brand_logo: brand.logo_url || '',
      title: form.title,
      description: form.description,
      drop_date: new Date(form.drop_date).toISOString(),
      teaser_image: form.teaser_image,
      active: true,
    });
    toast.success('Drop creado');
    setForm(EMPTY);
    setShowForm(false);
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ['brand-drops', brand.id] });
    queryClient.invalidateQueries({ queryKey: ['drops-active'] });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este drop?')) return;
    await base44.entities.Drop.delete(id);
    toast.success('Drop eliminado');
    queryClient.invalidateQueries({ queryKey: ['brand-drops', brand.id] });
    queryClient.invalidateQueries({ queryKey: ['drops-active'] });
  };

  const handleToggle = async (drop) => {
    await base44.entities.Drop.update(drop.id, { active: !drop.active });
    queryClient.invalidateQueries({ queryKey: ['brand-drops', brand.id] });
    queryClient.invalidateQueries({ queryKey: ['drops-active'] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" /> Drops
        </h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black rounded-full text-sm font-bold"
        >
          <Plus className="w-4 h-4 mr-1" /> Nuevo Drop
        </Button>
      </div>

      {showForm && (
        <Card className="bg-zinc-900 border-zinc-800 p-5 mb-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300 text-xs">Nombre del drop *</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: Colección Invierno 2026"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300 text-xs">Fecha y hora del drop *</Label>
                <Input
                  type="datetime-local"
                  value={form.drop_date}
                  onChange={e => setForm(f => ({ ...f, drop_date: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Descripción teaser</Label>
              <Input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Solo para los más rápidos..."
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Imagen teaser</Label>
              <div className="flex items-center gap-3 mt-1">
                {form.teaser_image && (
                  <img src={form.teaser_image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                )}
                <label>
                  <Button type="button" variant="outline" className="border-zinc-700 text-zinc-300 rounded-full text-sm" asChild>
                    <span>{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4 mr-1" /> Subir imagen</>}</span>
                  </Button>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full h-9 text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Drop'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-zinc-700 text-zinc-300 rounded-full h-9 text-sm">
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-zinc-500" /></div>
      ) : drops.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
          <Zap className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">Aún no tienes drops programados</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {drops.map(drop => {
            const isPast = new Date(drop.drop_date) < new Date();
            return (
              <Card key={drop.id} className="bg-zinc-900 border-zinc-800 p-4 flex items-center gap-4">
                {drop.teaser_image && (
                  <img src={drop.teaser_image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm truncate">{drop.title}</span>
                    <Badge className={`text-[10px] flex-shrink-0 ${
                      !drop.active ? 'bg-zinc-700 text-zinc-400' :
                      isPast ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' :
                      'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                    }`}>
                      {!drop.active ? 'Oculto' : isPast ? '¡En vivo!' : 'Programado'}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {new Date(drop.drop_date).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setManagingDrop(drop)}
                    className="text-xs text-violet-400 hover:text-violet-300 rounded-full h-8 px-3"
                  >
                    <Package className="w-3.5 h-3.5 mr-1" /> Prendas
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => handleToggle(drop)}
                    className="text-xs text-zinc-400 hover:text-white rounded-full h-8 px-3"
                  >
                    {drop.active ? 'Ocultar' : 'Mostrar'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(drop.id)} className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {managingDrop && (
        <DropProductsManager
          drop={managingDrop}
          brand={brand}
          open={!!managingDrop}
          onOpenChange={(v) => { if (!v) setManagingDrop(null); }}
        />
      )}
    </div>
  );
}