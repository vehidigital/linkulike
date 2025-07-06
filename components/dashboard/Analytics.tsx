"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Eye, MousePointer } from "lucide-react";
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
  links: Link[];
}

interface ClickData {
  date: string;
  clicks: number;
}

export default function Analytics({ links }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState("7d");
  const [clickData, setClickData] = useState<ClickData[]>([]);

  useEffect(() => {
    // Mock data - in a real app, you'd fetch this from your API
    const generateMockData = () => {
      const data: ClickData[] = [];
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          clicks: Math.floor(Math.random() * 50) + 1,
        });
      }
      return data;
    };

    setClickData(generateMockData());
  }, [timeRange]);

  const totalClicks = links.reduce((total, link) => total + (link.clicks?.length || 0), 0);
  const activeLinks = links.filter(link => link.isActive).length;
  const topPerformingLink = links.reduce((top, link) => {
    const clicks = link.clicks?.length || 0;
    return clicks > (top.clicks?.length || 0) ? link : top;
  }, links[0]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getIconDisplay = (iconValue: string) => {
    const iconMap: { [key: string]: string } = {
      globe: "🌐",
      instagram: "📷",
      youtube: "📺",
      twitter: "🐦",
      facebook: "📘",
      linkedin: "💼",
      github: "💻",
      tiktok: "🎵",
      spotify: "🎧",
      twitch: "🎮",
      discord: "💬",
      telegram: "📱",
      whatsapp: "📞",
      email: "✉️",
      phone: "📞",
      location: "📍",
      calendar: "📅",
      shop: "🛍️",
      book: "📚",
      heart: "❤️",
    };
    return iconMap[iconValue] || "🌐";
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(totalClicks)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Links</p>
                <p className="text-2xl font-bold text-gray-900">{activeLinks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(Math.floor(totalClicks * 0.3))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MousePointer className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeLinks > 0 ? Math.round((totalClicks / activeLinks) * 10) / 10 : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Clicks Over Time</CardTitle>
            <div className="flex space-x-2">
              {["7d", "30d", "90d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === range
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2">
            {clickData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{
                    height: `${(data.clicks / Math.max(...clickData.map(d => d.clicks))) * 200}px`,
                  }}
                />
                <span className="text-xs text-gray-500 mt-2">
                  {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Links */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {links
              .filter(link => link.isActive)
              .sort((a, b) => (b.clicks?.length || 0) - (a.clicks?.length || 0))
              .slice(0, 5)
              .map((link, index) => (
                <div key={link.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <span className="text-xl">{getIconDisplay(link.icon)}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{link.title}</h3>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{link.url}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatNumber(link.clicks?.length || 0)}
                    </p>
                    <p className="text-sm text-gray-500">clicks</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {links
              .filter(link => link.clicks && link.clicks.length > 0)
              .flatMap(link => 
                (link.clicks || []).map((click: any, index: number) => ({
                  ...click,
                  linkTitle: link.title,
                  linkIcon: link.icon,
                }))
              )
              .sort((a, b) => new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime())
              .slice(0, 10)
              .map((click, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">{getIconDisplay(click.linkIcon)}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{click.linkTitle}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(click.clickedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">Click</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 