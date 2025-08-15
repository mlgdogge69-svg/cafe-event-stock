import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { HistoryEntry } from '@/types';
import { ArrowLeft, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .order('date', { ascending: false })
        .limit(100); // Limit to last 100 entries

      if (error) throw error;

      const historyEntries: HistoryEntry[] = data.map(entry => ({
        id: entry.id,
        itemName: entry.item_name,
        changeAmount: Number(entry.change_amount),
        username: entry.username,
        date: entry.date
      }));

      setHistory(historyEntries);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Chyba při načítání historie');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(entry =>
    entry.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedHistory = filteredHistory.reduce((groups, entry) => {
    const date = new Date(entry.date).toLocaleDateString('cs-CZ');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, HistoryEntry[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Načítám historii...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/inventory')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Historie změn</h1>
            <p className="text-muted-foreground">Posledních {history.length} záznamů</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Hledat podle položky nebo uživatele..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* History by Date */}
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([date, entries]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="text-lg">{date}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          entry.changeAmount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {entry.changeAmount > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{entry.itemName}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.username} • {new Date(entry.date).toLocaleTimeString('cs-CZ')}
                          </p>
                        </div>
                      </div>
                      <div className={`text-right font-semibold ${
                        entry.changeAmount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry.changeAmount > 0 ? '+' : ''}{entry.changeAmount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'Žádné záznamy nenalezeny' : 'Zatím žádná historie změn'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;