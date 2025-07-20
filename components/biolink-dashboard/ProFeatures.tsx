'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Zap, 
  BarChart3, 
  Palette, 
  Globe, 
  Download, 
  Star,
  Check,
  X
} from 'lucide-react'

interface ProStatus {
  isPremium: boolean
  subscription?: {
    planId: string
    status: string
    renewal: string
  } | null
}

export function ProFeatures() {
  const [proStatus, setProStatus] = useState<ProStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  const fetchProStatus = async () => {
    try {
      const response = await fetch('/api/user/pro/upgrade')
      if (response.ok) {
        const data = await response.json()
        setProStatus(data)
      }
    } catch (error) {
      console.error('Error fetching Pro status:', error)
    } finally {
      setLoading(false)
    }
  }

  const upgradeToPro = async () => {
    setUpgrading(true)
    try {
      const response = await fetch('/api/user/pro/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProStatus(data.user)
        alert('Erfolgreich zu Pro upgegradet! 🎉')
      } else {
        const error = await response.json()
        alert(`Fehler beim Upgrade: ${error.error}`)
      }
    } catch (error) {
      alert('Fehler beim Upgrade. Bitte versuchen Sie es erneut.')
    } finally {
      setUpgrading(false)
    }
  }

  useEffect(() => {
    fetchProStatus()
  }, [])

  const features = [
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Erweiterte Analytics',
      description: 'Detaillierte Einblicke in deine Performance',
      free: 'Basis-Statistiken',
      pro: 'Erweiterte Charts & Export'
    },
    {
      icon: <Palette className="w-5 h-5" />,
      title: 'Individuelle Textfarben',
      description: 'Vollständige Kontrolle über das Design',
      free: 'Standard-Farben',
      pro: 'Individuelle Farben für jeden Text'
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: 'Geo-Analytics',
      description: 'Sieh wo deine Besucher herkommen',
      free: 'Nicht verfügbar',
      pro: 'Länder- & Städte-Analytics'
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: 'CSV-Export',
      description: 'Exportiere deine Daten für weitere Analyse',
      free: 'Nicht verfügbar',
      pro: 'Vollständiger Datenexport'
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: 'Prioritäts-Support',
      description: 'Schnelle Hilfe bei Fragen',
      free: 'Community-Support',
      pro: 'Prioritäts-E-Mail-Support'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Erweiterte Links',
      description: 'Mehr Links und erweiterte Funktionen',
      free: '10 Links',
      pro: 'Unbegrenzte Links'
    }
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (proStatus?.isPremium) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Crown className="w-6 h-6" />
            Pro Account aktiv
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-green-700">
              Du hast Zugriff auf alle Pro-Features! 🎉
            </p>
            {proStatus.subscription && (
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Plan:</strong> {proStatus.subscription.planId}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> {proStatus.subscription.status}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Erneuerung:</strong> {new Date(proStatus.subscription.renewal).toLocaleDateString('de-DE')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pro Banner */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Crown className="w-6 h-6" />
            Upgrade zu Pro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-purple-700">
              Entfessele die volle Kraft von Linkulike mit erweiterten Analytics, 
              individuellen Designs und mehr!
            </p>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-purple-800">€9.99</div>
              <div className="text-sm text-purple-600">/ Monat</div>
            </div>
            <Button 
              onClick={upgradeToPro} 
              disabled={upgrading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {upgrading ? 'Wird verarbeitet...' : 'Jetzt upgraden'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature-Vergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-purple-600">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <X className="w-4 h-4" />
                    {feature.free}
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="w-4 h-4" />
                    {feature.pro}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pro Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Warum Pro?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">📈 Bessere Insights</h3>
              <p className="text-sm text-blue-700">
                Verstehe deine Audience mit detaillierten Analytics und Geo-Daten.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🎨 Vollständige Kontrolle</h3>
              <p className="text-sm text-green-700">
                Individuelle Farben für jeden Text und erweiterte Design-Optionen.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">📊 Datenexport</h3>
              <p className="text-sm text-purple-700">
                Exportiere deine Analytics für weitere Analyse in anderen Tools.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">🚀 Unbegrenzte Links</h3>
              <p className="text-sm text-orange-700">
                Erstelle so viele Links wie du möchtest ohne Einschränkungen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 