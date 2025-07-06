#!/bin/bash

echo "🔧 Konfiguriere localhost Subdomains..."

# Check if entries already exist
if grep -q "de.localhost" /etc/hosts; then
    echo "✅ Subdomains sind bereits konfiguriert"
else
    echo "📝 Füge Subdomains zur /etc/hosts hinzu..."
    echo "127.0.0.1 de.localhost" | sudo tee -a /etc/hosts
    echo "127.0.0.1 en.localhost" | sudo tee -a /etc/hosts
    echo "✅ Subdomains hinzugefügt"
fi

# Flush DNS cache
echo "🗑️ Leere DNS-Cache..."
sudo dscacheutil -flushcache

echo "🎉 Setup abgeschlossen!"
echo ""
echo "Du kannst jetzt folgende URLs verwenden:"
echo "  🇩🇪 http://de.localhost:3002"
echo "  🇬🇧 http://en.localhost:3002"
echo "  🔗 http://de.localhost:3002/@username"
echo "  🔗 http://en.localhost:3002/@username" 