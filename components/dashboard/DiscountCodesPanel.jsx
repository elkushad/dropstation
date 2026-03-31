import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Tag, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY = { code: '', discount_type: 'percent', discount_value: '', min_order: '', max_uses: '', expires_at: '' };

export default function DiscountCodesPanel({ brand }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ['discount-codes', brand.id],
    queryFn: () => base44.entities.DiscountCode.filter({ brand_id: brand.id }, '-created_date'),
    enabled: !!brand.id,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discount_value) {
      toast.error('Código y descuento son obligatorios');
      return;
    }
    setSaving(true);
    await base44.entities.DiscountCode.create({
      code: form.code.trim().toUpperCase(),
      brand_id: brand.id,
      brand_name: brand.name,
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order: parseFloat(form.min_order) || 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
      active: true,
      times_used: 0,
    });
    toast.success('Código creado');
    setForm(EMPTY);
    setShowForm(false);
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ['discount-codes', brand.id] });
  };

  const handleToggle = async (code) => {
    await base44.entities.DiscountCode.update(code.id, { active: !code.active });
    queryClient.invalidateQueries({ queryKey: ['discount-codes', brand.id] });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este código?')) return;
    await base44.entities.DiscountCode.delete(id);
    toast.success('Código eliminado');
    queryClient.invalidateQueries({ queryKey: ['discount-codes', brand.id] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-zinc-400" /> Códigos de descuento
        </h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-full text-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Nuevo código
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="bg-zinc-900 border-zinc-800 p-5 mb-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300 text-xs">Código *</Label>
                <Input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="VERANO20"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1 font-mono uppercase"
                />
              </div>
              <div>
                <Label className="text-zinc-300 text-xs">Tipo de descuento</Label>
                <div className="flex gap-2 mt-1">
                  {['percent', 'fixed'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, discount_type: t }))}
                      className={`flex-1 h-9 rounded-lg text-xs font-medium transition-all ${
                        form.discount_type === t
                          ? 'bg-violet-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {t === 'percent' ? '% Porcentaje' : 'S/ Fijo'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-zinc-300 text-xs">
                  Descuento * {form.discount_type === 'percent' ? '(%)' : '(S/)'}
                </Label>
                <Input
                  type="number"
                  min="0"
                  max={form.discount_type === 'percent' ? 100 : undefined}
                  value={form.discount_value}
                  onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                  placeholder={form.discount_type === 'percent' ? '20' : '15'}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300 text-xs">Pedido mínimo (S/)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.min_order}
                  onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))}
                  placeholder="0"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300 text-xs">Usos máximos</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.max_uses}
                  onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                  placeholder="∞"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300 text-xs">Vence el</Label>
                <Input
                  type="date"
                  value={form.expires_at}
                  onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white rounded-full h-9 text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear código'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-zinc-700 text-zinc-300 rounded-full h-9 text-sm">
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Codes list */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-zinc-500" /></div>
      ) : codes.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
          <Tag className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">Aún no tienes códigos de descuento</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {codes.map(code => {
            const expired = code.expires_at && new Date(code.expires_at) < new Date();
            const exhausted = code.max_uses && code.times_used >= code.max_uses;
            const isActive = code.active && !expired && !exhausted;

            return (
              <Card key={code.id} className="bg-zinc-900 border-zinc-800 p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-white text-sm tracking-wider">{code.code}</span>
                    <Badge className={`text-[10px] ${isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-zinc-700 text-zinc-400 border-zinc-600'}`}>
                      {expired ? 'Vencido' : exhausted ? 'Agotado' : isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 flex-wrap">
                    <span className="text-violet-400 font-semibold">
                      {code.discount_type === 'percent' ? `${code.discount_value}% OFF` : `S/ ${code.discount_value} OFF`}
                    </span>
                    {code.min_order > 0 && <span>Mín. S/ {code.min_order}</span>}
                    {code.max_uses && <span>{code.times_used}/{code.max_uses} usos</span>}
                    {code.expires_at && <span>Vence: {code.expires_at}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleToggle(code)} className="text-zinc-400 hover:text-white transition-colors p-1">
                    {code.active ? <ToggleRight className="w-5 h-5 text-violet-400" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(code.id)} className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}