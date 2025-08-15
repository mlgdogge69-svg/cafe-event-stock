import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Coffee } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !pin) return;

    setLoading(true);
    const success = isRegistering 
      ? await register(username, pin) 
      : await login(username, pin);
    
    if (success) {
      navigate('/inventory');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Coffee className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">
            {isRegistering ? 'Vytvořit účet' : 'Přihlášení'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Uživatelské jméno</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Zadejte uživatelské jméno"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">PIN (4 číslice)</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                maxLength={4}
                pattern="\d{4}"
                placeholder="1234"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !username || pin.length !== 4}
            >
              {loading ? 'Zpracovávám...' : (isRegistering ? 'Vytvořit účet' : 'Přihlásit se')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm"
            >
              {isRegistering 
                ? 'Již máte účet? Přihlaste se' 
                : 'Nemáte účet? Vytvořte si ho'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;