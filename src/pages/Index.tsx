import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Package, History, QrCode, UserCheck, BarChart3 } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/inventory');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Načítám...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Skladový systém
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Moderní řešení pro správu zásob a inventáře. Sledujte množství, historii změn a spravujte své položky jednoduše a efektivně.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">Správa zásob</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sledujte množství všech položek v reálném čase
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <QrCode className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">QR kódy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Rychlé úpravy pomocí skenování QR kódů
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <History className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">Historie změn</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Kompletní přehled všech úprav a pohybů
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">Přehledy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Analýzy a statistiky pro lepší rozhodování
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="space-y-3">
              <Button onClick={() => navigate('/auth')} size="lg" className="w-full max-w-md">
                <UserCheck className="w-5 h-5 mr-2" />
                Přihlásit se / Registrovat
              </Button>
              <Button onClick={() => navigate('/login')} size="lg" variant="outline" className="w-full max-w-md">
                Starý systém (PIN)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;