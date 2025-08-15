import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

const AddItem: React.FC = () => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [unit, setUnit] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateQRCode = async (itemData: any): Promise<string> => {
    try {
      const qrData = JSON.stringify({
        id: itemData.id,
        name: itemData.name,
        type: 'inventory_item'
      });
      return await QRCode.toDataURL(qrData);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unit.trim()) {
      toast.error('Vyplňte všechna povinná pole');
      return;
    }

    setLoading(true);
    try {
      // Insert item first to get the ID
      const { data, error } = await supabase
        .from('inventory')
        .insert({
          name: name.trim(),
          quantity: parseFloat(quantity) || 0,
          unit: unit.trim(),
          qr_code: `temp_${Date.now()}` // Temporary QR code
        })
        .select()
        .single();

      if (error) throw error;

      // Generate QR code with the actual item data
      const qrCodeData = await generateQRCode(data);
      
      // Update the item with the real QR code
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ qr_code: qrCodeData })
        .eq('id', data.id);

      if (updateError) throw updateError;

      toast.success('Položka úspěšně přidána');
      navigate('/inventory');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Chyba při přidávání položky');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/inventory')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Přidat novou položku</h1>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Údaje o položce</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Název položky *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Např. Káva arabica, Růže bílé..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Počáteční množství</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Jednotka *</Label>
                <Input
                  id="unit"
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Např. kg, ks, l, balení..."
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  type="submit" 
                  disabled={loading || !name.trim() || !unit.trim()}
                  className="flex-1"
                >
                  {loading ? 'Přidávám...' : 'Přidat položku'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/inventory')}
                  className="flex-1"
                >
                  Zrušit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Automatické funkce:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• QR kód bude automaticky vygenerován pro každou položku</li>
            <li>• Můžete později skenovat QR kód pro rychlé úpravy množství</li>
            <li>• Všechny změny se zaznamenávají do historie</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddItem;