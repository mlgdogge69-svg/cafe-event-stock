# Skladový systém pro kavárnu a svatby

Webová aplikace pro správu inventáře s uživatelskou autentizací pomocí uživatelského jména a PIN kódu.

## Funkce

- **Autentizace**: Přihlášení pomocí uživatelského jména a 4-místného PIN kódu
- **Správa inventáře**: Přidávání, úprava a sledování zásob
- **QR kódy**: Automatické generování QR kódů pro každou položku
- **Historie změn**: Kompletní evidence všech změn v inventáři
- **Responzivní design**: Funguje na mobilních telefonech i počítačích
- **Bezpečnost**: PIN kódy jsou hashovány pomocí bcrypt

## Požadavky

- Node.js (verze 18 nebo vyšší)
- npm nebo yarn
- Supabase účet (již nakonfigurován)

## Instalace a spuštění

### 1. Naklonujte projekt
```bash
git clone <repository-url>
cd skladovy-system
```

### 2. Nainstalujte závislosti
```bash
npm install
```

### 3. Spusťte vývojový server
```bash
npm run dev
```

Aplikace bude dostupná na `http://localhost:5173`

### 4. Vytvoření prvního uživatele
1. Otevřete aplikaci v prohlížeči
2. Klikněte na "Nemáte účet? Vytvořte si ho"
3. Zadejte uživatelské jméno a 4-místný PIN
4. Klikněte na "Vytvořit účet"

## Nasazení na production

### Možnost 1: Lovable Hosting (doporučeno)
1. V Lovable editoru klikněte na tlačítko "Publish" v pravém horním rohu
2. Následujte pokyny pro nasazení
3. Vaše aplikace bude dostupná na `https://yourapp.lovable.app`

### Možnost 2: Vercel
1. Připojte GitHub repository k Vercel
2. Nastavte build command: `npm run build`
3. Nastavte output directory: `dist`
4. Nasaďte aplikaci

### Možnost 3: Netlify
1. Připojte GitHub repository k Netlify
2. Nastavte build command: `npm run build`
3. Nastavte publish directory: `dist`
4. Nasaďte aplikaci

## Struktura databáze

### Tabulka `users`
- `id` (UUID, Primary Key)
- `username` (Text, Unique)
- `pin_hash` (Text, hashed PIN)
- `created_at` (Timestamp)

### Tabulka `inventory`
- `id` (UUID, Primary Key)
- `name` (Text)
- `quantity` (Numeric)
- `unit` (Text)
- `qr_code` (Text)
- `last_updated` (Timestamp)
- `created_at` (Timestamp)

### Tabulka `history`
- `id` (UUID, Primary Key)
- `item_name` (Text)
- `change_amount` (Numeric)
- `username` (Text)
- `date` (Timestamp)

## Použití aplikace

### Přihlášení
1. Otevřete aplikaci
2. Zadejte uživatelské jméno a PIN
3. Klikněte na "Přihlásit se"

### Správa inventáře
1. Na hlavní stránce vidíte seznam všech položek
2. Použijte tlačítka + a - pro změnu množství
3. Použijte vyhledávání pro rychlé nalezení položek

### Přidání nové položky
1. Klikněte na "Přidat položku"
2. Vyplňte název, počáteční množství a jednotku
3. QR kód se vygeneruje automaticky

### Sledování historie
1. Klikněte na "Historie" pro zobrazení všech změn
2. Historie je seřazena od nejnovější
3. Můžete filtrovat podle položky nebo uživatele

### Skenování QR kódů
1. Klikněte na "Skenovat QR"
2. Zadejte QR kód manuálně nebo ho vložte
3. Vyberte množství k odebrání a potvrďte

## Bezpečnost

- **PIN kódy**: Všechny PIN kódy jsou hashovány pomocí bcrypt
- **Row Level Security**: Supabase RLS je povoleno pro všechny tabulky
- **Autentizace**: Chráněné stránky vyžadují přihlášení
- **Validace**: Všechny vstupy jsou validovány na frontend i backend

## Řešení problémů

### Problém s přihlášením
- Zkontrolujte, zda je PIN přesně 4 číslice
- Ujistěte se, že uživatelské jméno existuje

### Chyby databáze
- Zkontrolujte připojení k Supabase
- Ověřte, zda jsou všechny tabulky vytvořeny

### Problémy s QR kódy
- QR kódy se generují automaticky při přidání položky
- Pro manuální skenování zadejte ID položky

## Technologie

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database)
- **Autentizace**: Custom autentizace s bcrypt hashováním
- **QR kódy**: qrcode library
- **UI komponenty**: shadcn/ui
- **Ikony**: Lucide React
- **Notifikace**: Sonner

## Podpora

Pro technickou podporu nebo dotazy kontaktujte administrátora systému.