import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Plus, Minus, Search, LogOut, History, QrCode, PackagePlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const InventoryList: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, profile, signOut, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && profile) {
      fetchItems();
    }
  }, [user, profile]);

  const fetchItems = async () => {
    if (!profile?.cafeId) return;
    
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('cafe_id', profile.cafeId)
        .order('name');

      if (error) throw error;
      
      const inventoryItems: InventoryItem[] = data.map(item => ({
        id: item.id,
        name: item.name,
        quantity: Number(item.quantity),
        unit: item.unit,
        qrCode: item.qr_code,
        lastUpdated: item.last_updated,
        createdAt: item.created_at,
        cafeId: item.cafe_id
      }));

      setItems(inventoryItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Chyba při načítání položek');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, change: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !user || !profile) return;

    const newQuantity = Math.max(0, item.quantity + change);

    try {
      // Update inventory
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Add to history
      const { error: historyError } = await supabase
        .from('history')
        .insert({
          item_name: item.name,
          change_amount: change,
          username: user.email || 'Neznámý uživatel',
          cafe_id: profile.cafeId
        });

      if (historyError) throw historyError;

      // Update local state
      setItems(items.map(i => 
        i.id === itemId ? { ...i, quantity: newQuantity } : i
      ));

      toast.success(`${item.name}: ${change > 0 ? '+' : ''}${change} ${item.unit}`);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Chyba při aktualizaci množství');
    }
  };

  const deleteItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      setItems(items.filter(i => i.id !== itemId));
      toast.success('Položka byla smazána');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Chyba při mazání položky');
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Načítám...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Sklad - {profile?.displayName || user?.email}</h1>
            <p className="text-muted-foreground">Celkem položek: {items.length}</p>
            <p className="text-xs text-muted-foreground">Kavárna ID: {profile?.cafeId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate('/add-item')} className="gap-2">
              <PackagePlus className="w-4 h-4" />
              Přidat položku
            </Button>
            <Button onClick={() => navigate('/history')} variant="outline" className="gap-2">
              <History className="w-4 h-4" />
              Historie
            </Button>
            <Button onClick={() => navigate('/scan')} variant="outline" className="gap-2">
              <QrCode className="w-4 h-4" />
              Skenovat QR
            </Button>
            <Button onClick={signOut} variant="destructive" className="gap-2">
              <LogOut className="w-4 h-4" />
              Odhlásit
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Hledat položky..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-2xl font-bold text-primary">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateQuantity(item.id, -1)}
                        variant="outline"
                        size="sm"
                        className="h-10 w-10 p-0"
                        disabled={item.quantity <= 0}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={() => updateQuantity(item.id, 1)}
                        variant="outline"
                        size="sm"
                        className="h-10 w-10 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-10 w-10 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Smazat položku</AlertDialogTitle>
                          <AlertDialogDescription>
                            Opravdu chcete smazat položku "{item.name}"? Tuto akci nelze vrátit zpět.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Zrušit</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteItem(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Smazat
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Aktualizováno: {new Date(item.lastUpdated).toLocaleString('cs-CZ')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'Žádné položky nenalezeny' : 'Zatím žádné položky ve skladu'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;