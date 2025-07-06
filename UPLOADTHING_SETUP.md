# Uploadthing Setup für Avatar Upload

## 1. .env Datei erstellen

Erstelle eine `.env` Datei im Root-Verzeichnis mit folgenden Uploadthing-Variablen:

```env
# Uploadthing Configuration
UPLOADTHING_SECRET="your-uploadthing-secret-here"
UPLOADTHING_APP_ID="your-uploadthing-app-id-here"
```

## 2. Uploadthing Account einrichten

1. Gehe zu [uploadthing.com](https://uploadthing.com)
2. Erstelle einen Account
3. Erstelle eine neue App
4. Kopiere `UPLOADTHING_SECRET` und `UPLOADTHING_APP_ID` aus den App-Einstellungen

## 3. Server neu starten

Nach dem Erstellen der `.env` Datei:

```bash
npm run dev
```

## 4. Testen

1. Gehe zum Dashboard
2. Klicke auf "Foto ändern"
3. Wähle ein Bild aus
4. Croppe das Bild
5. Das Avatar sollte jetzt angezeigt werden

## Fehlerbehebung

- **Uploadthing Response: null**: Überprüfe die `.env` Variablen
- **Keine Backend-Logs**: Server neu starten nach `.env` Änderungen
- **Avatar wird nicht angezeigt**: Überprüfe die Browser-Konsole für Fehler 