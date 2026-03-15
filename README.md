# Immobilien Investment Analyse

Interaktives Tool zur Analyse von Immobilieninvestments mit Portfolio-Übersicht, Finanzierung, Cashflow, Steuerberechnung und Exit-Rechnung.

---

## Schnellstart

### Option 1: Lokal starten (empfohlen zum Testen)

```bash
# Node.js installieren (falls noch nicht vorhanden): https://nodejs.org
# Dann im Projektordner:

npm install
npm run dev
```

Öffne http://localhost:5173 im Browser. Fertig.

### Option 2: Bauen & auf eigenem Server hosten

```bash
npm install
npm run build
```

Der fertige `dist/`-Ordner kann auf jeden Webserver kopiert werden.

---

## Online deployen (kostenlos) – für dich & deine Freunde

### Vercel (empfohlen – 30 Sekunden)

1. Erstelle ein Konto auf https://vercel.com (kostenlos, Login mit GitHub/Google)
2. Klicke "Add New Project" → "Upload" (Ordner-Symbol)
3. Ziehe den gesamten `immo-tool`-Ordner ins Fenster
4. Klicke "Deploy"
5. Du bekommst eine URL wie `immo-analyse.vercel.app` → teile diese mit deinen Freunden

### Netlify (Alternative)

1. Gehe zu https://app.netlify.com/drop
2. Baue das Projekt erst: `npm install && npm run build`
3. Ziehe den `dist/`-Ordner in den Browser
4. Fertig – du bekommst eine URL

### GitHub Pages (dauerhaft kostenlos)

1. Erstelle ein GitHub-Repository
2. Pushe den Code
3. In Settings → Pages → Source: "GitHub Actions"
4. Nutze das Vite Deploy Template

---

## Auf dem Handy als App installieren

### iPhone / iPad
1. Öffne die URL in **Safari**
2. Tippe auf das **Teilen-Symbol** (□↑)
3. Wähle **"Zum Home-Bildschirm"**
4. Das Tool erscheint als App-Icon auf deinem Homescreen
5. Es öffnet sich im Vollbild – sieht aus wie eine echte App

### Android
1. Öffne die URL in **Chrome**
2. Tippe auf die **drei Punkte** (⋮) oben rechts
3. Wähle **"App installieren"** oder **"Zum Startbildschirm hinzufügen"**
4. Das Tool wird als PWA installiert und funktioniert auch offline

### Mac / Windows
1. Öffne die URL in **Chrome**
2. Klicke auf das **Installieren-Symbol** in der Adressleiste (⊕)
3. Oder: Menü (⋮) → "Seite als App installieren"
4. Das Tool öffnet sich in einem eigenen Fenster ohne Browser-Leiste

---

## Features

- **3 Objekte** gleichzeitig verwalten und vergleichen
- **Live-Berechnung** – alle Werte aktualisieren sich sofort
- **Sondertilgung** ein/ausschaltbar pro Objekt
- **Steuerberechnung** mit Gehalt und V+V-Verlustverrechnung
- **Portfolio-Dashboard** mit Gesamtübersicht
- **Exit-Rechnung** mit Spekulationssteuer-Check
- **Dark/Light Mode** – Toggle oben rechts
- **PWA** – installierbar, funktioniert offline
- **Responsive** – optimiert für Handy, Tablet und Desktop

---

## Hinweis

Alle Berechnungen sind vereinfacht und ersetzen keine professionelle Steuerberatung.
Die AfA-Sätze basieren auf dem deutschen Steuerrecht (Stand 2025).
