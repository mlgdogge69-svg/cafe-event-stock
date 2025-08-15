import React, { createContext, useContext, useState, ReactNode } from 'react';
import bcrypt from 'bcryptjs';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType } from '@/types';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (username: string, pin: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        toast.error('Uživatel nenalezen');
        return false;
      }

      const isValidPin = await bcrypt.compare(pin, data.pin_hash);
      if (!isValidPin) {
        toast.error('Nesprávný PIN');
        return false;
      }

      const userData: User = {
        id: data.id,
        username: data.username,
        pinHash: data.pin_hash,
        createdAt: data.created_at
      };

      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      toast.success('Úspěšně přihlášen');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Chyba při přihlašování');
      return false;
    }
  };

  const register = async (username: string, pin: string): Promise<boolean> => {
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        toast.error('Uživatelské jméno již existuje');
        return false;
      }

      // Hash the PIN
      const pinHash = await bcrypt.hash(pin, 10);

      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          username,
          pin_hash: pinHash
        })
        .select()
        .single();

      if (error || !data) {
        toast.error('Chyba při vytváření účtu');
        return false;
      }

      const userData: User = {
        id: data.id,
        username: data.username,
        pinHash: data.pin_hash,
        createdAt: data.created_at
      };

      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      toast.success('Účet úspěšně vytvořen');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Chyba při vytváření účtu');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    toast.success('Odhlášen');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};