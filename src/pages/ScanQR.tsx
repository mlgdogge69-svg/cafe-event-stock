import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Camera, Minus } from 'lucide-react';
import { toast } from 'sonner';

const ScanQR: React.FC = () => {
  const [manualInput, setManualInput] = useState('');
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  const [reduceAmount, setReduceAmount] = useState('1');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const processQRData = async (qrData: string) => {
    try {
      setLoading(true);
      
      // Try to parse as JSON (our QR format)
      let itemId: string;
      try {
        const parsed = JSON.parse(qrData);
        if (parsed.type === 'inventory_item' && parsed.id) {
          itemId = parsed.id;
        } else {
          throw new Error('Invalid QR format');
        }
      } catch {
        // If not JSON, treat as direct item ID
        itemId = qrData.trim();
      }

      // Find item in database
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error || !data) {
        toast.error('Položka nenalezena');
        return;
      }

      const item: InventoryItem = {
        id: data.id,
        name: data.name,
        quantity: Number(data.quantity),
        unit: data.unit,
        qrCode: data.qr_code,
        lastUpdated: data.last_updated,
        createdAt: data.created_at
      };

      setScannedItem(item);
      toast.success(`Položka nalezena: ${item.name}`);
    } catch (error) {
      console.error('Error processing QR data:', error);
      toast.error('Chyba při zpracování QR kódu');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      processQRData(manualInput.trim());
    }
  };

  const reduceQuantity = async () => {
    if (!scannedItem || !user) return;

    const amount = parseFloat(reduceAmount) || 1;
    const newQuantity = Math.max(0, scannedItem.quantity - amount);

    try {
      setLoading(true);

      // Update inventory
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', scannedItem.id);

      if (updateError) throw updateError;

      // Add to history
      const { error: historyError } = await supabase
        .from('history')
        .insert({
          item_name: scannedItem.name,
          change_amount: -amount,
          username: user.username
        });

      if (historyError) throw historyError;

      toast.success(`${scannedItem.name}: -${amount} ${scannedItem.unit}`);
      
      // Update local state
      setScannedItem({
        ...scannedItem,
        quantity: newQuantity
      });
      
      setReduceAmount('1');
    } catch (error) {
      console.error('Error reducing quantity:', error);
      toast.error('Chyba při aktualizaci množství');
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
          <h1 className="text-3xl font-bold">Skenovat QR kód</h1>
        </div>

        {/* Manual Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Manuální zadání QR kódu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-input">QR kód nebo ID položky</Label>
                <Input
                  id="qr-input"
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Zadejte QR kód nebo ID položky..."
                />
              </div>
              <Button type="submit" disabled={loading || !manualInput.trim()}>
                {loading ? 'Hledám...' : 'Najít položku'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Scanned Item */}
        {scannedItem && (
          <Card>
            <CardHeader>
              <CardTitle>Nalezená položka</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-xl font-semibold">{scannedItem.name}</h3>
                <p className="text-2xl font-bold text-primary">
                  {scannedItem.quantity} {scannedItem.unit}
                </p>
                <p className="text-sm text-muted-foreground">
                  Aktualizováno: {new Date(scannedItem.lastUpdated).toLocaleString('cs-CZ')}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reduce-amount">Množství k odebrání</Label>
                  <Input
                    id="reduce-amount"
                    type="number"
                    value={reduceAmount}
                    onChange={(e) => setReduceAmount(e.target.value)}
                    min="0.1"
                    step="0.1"
                    max={scannedItem.quantity}
                  />
                </div>

                <Button
                  onClick={reduceQuantity}
                  disabled={loading || parseFloat(reduceAmount) <= 0 || parseFloat(reduceAmount) > scannedItem.quantity}
                  className="w-full gap-2"
                  variant="destructive"
                >
                  <Minus className="w-4 h-4" />
                  {loading ? 'Zpracovávám...' : `Odebrat ${reduceAmount} ${scannedItem.unit}`}
                </Button>
              </div>

              <Button
                onClick={() => {
                  setScannedItem(null);
                  setManualInput('');
                  setReduceAmount('1');
                }}
                variant="outline"
                className="w-full"
              >
                Skenovat další položku
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Pokyny:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Zadejte QR kód manuálně nebo ho zkopírujte z obrázku</li>
            <li>• QR kódy obsahují ID položky pro rychlé vyhledání</li>
            <li>• Můžete odebrat pouze dostupné množství</li>
            <li>• Všechny změny se automaticky zaznamenají do historie</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScanQR;