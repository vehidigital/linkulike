#!/bin/bash

echo "🔧 Konfiguriere lokale Subdomains für linkulike..."

# Check if entries already exist
if grep -q "linkulike.local" /etc/hosts; then
    echo "✅ Subdomains sind bereits konfiguriert"
else
    echo "📝 Füge Subdomains zur /etc/hosts hinzu..."
    echo "127.0.0.1 linkulike.local" | sudo tee -a /etc/hosts
    echo "127.0.0.1 de.linkulike.local" | sudo tee -a /etc/hosts
    echo "✅ Subdomains hinzugefügt"
fi

# Flush DNS cache
echo "🗑️ Leere DNS-Cache..."
sudo dscacheutil -flushcache

echo "🎉 Setup abgeschlossen!"
echo ""
echo "Du kannst jetzt folgende URLs verwenden:"
echo "  🇬🇧 http://linkulike.local:3000"
echo "  🇩🇪 http://de.linkulike.local:3000"
echo "  🔗 http://linkulike.local:3000/@username"
echo "  🔗 http://de.linkulike.local:3000/@username" 