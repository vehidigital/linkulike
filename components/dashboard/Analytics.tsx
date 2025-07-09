"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Eye, MousePointer, Globe, Download, Smartphone, MapPin, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string;
  isActive: boolean;
  position: number;
  clicks?: any[];
}

interface AnalyticsProps {
  links: any[];
  t?: any;
  currentLang?: "de" | "en";
  isProUser?: boolean;
}

export default function Analytics({ links, t: tProp, currentLang = "en", isProUser = false }: AnalyticsProps) {
  const t = tProp || ((x: string) => x);
  // States für Zeitbereich, Ladezustand, Fehler, Daten
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // TODO: Echte Daten von API laden
  // const [kpiData, setKpiData] = useState<KPIData|null>(null);
  // const [chartData, setChartData] = useState<ChartData[]>([]);
  // const [geoData, setGeoData] = useState<GeoData[]>([]);
  // const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  // const [referrerData, setReferrerData] = useState<ReferrerData[]>([]);
  // const [recentActivity, setRecentActivity] = useState<ActivityData[]>([]);

  // Platzhalter für KPIs (ersetzt durch API)
  const totalClicks = links.reduce((total, link) => total + (link.clicks?.length || 0), 0);
  const activeLinks = links.filter(link => link.isActive).length;
  const profileViews = Math.floor(totalClicks * 0.3);
  const clickRate = activeLinks > 0 ? Math.round((totalClicks / activeLinks) * 10) / 10 : 0;

  // Top Links sortiert
  const topLinks = links
    .filter(link => link.isActive)
    .sort((a, b) => (b.clicks?.length || 0) - (a.clicks?.length || 0))
    .slice(0, isProUser ? 10 : 3);

  // Zeitbereiche
  const timeRanges = isProUser ? ["7d", "30d", "90d", "365d", "custom"] : ["7d", "30d"];

  // UI Helper
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // --- UI ---
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardContent className="p-6 flex items-center"><BarChart3 className="w-7 h-7 text-blue-600 bg-blue-100 rounded-lg p-1" /><div className="ml-4"><p className="text-sm text-gray-600">{t.statsTotalClicks}</p><p className="text-2xl font-bold text-gray-900">{formatNumber(totalClicks)}</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center"><TrendingUp className="w-7 h-7 text-green-600 bg-green-100 rounded-lg p-1" /><div className="ml-4"><p className="text-sm text-gray-600">{t.statsActiveLinks}</p><p className="text-2xl font-bold text-gray-900">{activeLinks}</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center"><Eye className="w-7 h-7 text-purple-600 bg-purple-100 rounded-lg p-1" /><div className="ml-4"><p className="text-sm text-gray-600">{t.statsProfileViews}</p><p className="text-2xl font-bold text-gray-900">{formatNumber(profileViews)}</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center"><MousePointer className="w-7 h-7 text-orange-600 bg-orange-100 rounded-lg p-1" /><div className="ml-4"><p className="text-sm text-gray-600">{t.statsTheme}</p><p className="text-2xl font-bold text-gray-900">{clickRate}</p></div></CardContent></Card>
      </div>

      {/* Zeitbereich-Selector & Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.analytics}</CardTitle>
            <div className="flex space-x-2">
              {timeRanges.map(range => (
                <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1 text-sm rounded-md transition-colors ${timeRange === range ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{range}</button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Chart-Placeholder */}
          <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            {/* TODO: Echte Chart-Komponente mit Daten */}
            <span>{isProUser ? t.analyticsChartPro : t.analyticsChartFree}</span>
          </div>
        </CardContent>
      </Card>

      {/* Top Links */}
      <Card>
        <CardHeader>
          <CardTitle>{t.topLinks}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topLinks.length === 0 && <div className="text-gray-400 text-center">{t.noData}</div>}
            {topLinks.map((link, idx) => (
              <div key={link.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">{idx + 1}</Badge>
                  <span className="text-xl">🌐</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{link.title}</h3>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{link.url}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatNumber(link.clicks?.length || 0)}</p>
                  <p className="text-sm text-gray-500">{t.statsTotalClicks}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Pro-Upgrade CTA für Free-User */}
          {!isProUser && (
            <div className="mt-6 text-center">
              <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow-lg font-semibold">
                {t.upgradeForProAnalytics}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pro-Only: Geo, Geräte, Referrer, Export, Recent Activity */}
      {isProUser && (
        <>
          <Card>
            <CardHeader><CardTitle>{t.geoStats}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                {/* TODO: Geo-Chart/Map */}
                <span>{t.geoStatsPlaceholder}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t.deviceStats}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                {/* TODO: Geräte-Chart */}
                <span>{t.deviceStatsPlaceholder}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t.referrerStats}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                {/* TODO: Referrer-Chart */}
                <span>{t.referrerStatsPlaceholder}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>{t.recentActivity}</CardTitle><button className="flex items-center gap-2 text-blue-600 font-medium hover:underline"><Download className="w-4 h-4" /> {t.exportCSV}</button></CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                {/* TODO: Recent Activity Table */}
                <span>{t.recentActivityPlaceholder}</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 