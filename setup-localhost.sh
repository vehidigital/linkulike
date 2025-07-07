#!/bin/bash

echo "🔧 Konfiguriere localhost Subdomains..."

# Check if entry already exists
if grep -q "de.localhost" /etc/hosts; then
    echo "✅ Subdomain ist bereits konfiguriert"
else
    echo "📝 Füge Subdomain zur /etc/hosts hinzu..."
    echo "127.0.0.1 de.localhost" | sudo tee -a /etc/hosts
    echo "✅ Subdomain hinzugefügt"
fi

# Flush DNS cache
echo "🗑️ Leere DNS-Cache..."
sudo dscacheutil -flushcache

echo "🎉 Setup abgeschlossen!"
echo ""
echo "Du kannst jetzt folgende URLs verwenden:"
echo "  🇩🇪 http://de.localhost:3000"
echo "  🇬🇧 http://localhost:3000"
echo "  🔗 http://de.localhost:3000/@username"
echo "  🔗 http://localhost:3000/@username" 