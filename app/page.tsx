import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Star, 
  Users, 
  Zap, 
  Palette, 
  BarChart3, 
  Smartphone, 
  Globe,
  Check,
  Instagram,
  Twitter,
  Youtube,
  Github
} from "lucide-react"
import { getTranslations } from "@/lib/i18n"
import { getLangFromHost } from "@/lib/server-utils"
import { PublicNav } from "@/components/navigation/public-nav"

export default async function LandingPage() {
  const lang = await getLangFromHost()
  const t = getTranslations(lang)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <PublicNav />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            ✨ {t.description}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            {t.heroTitle}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6">
                {t.heroCta}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                {t.featuresTitle}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">{t["statsActiveUsers"] || "Active Users"}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">1M+</div>
              <div className="text-gray-600">{t["statsLinksCreated"] || "Links Created"}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">5M+</div>
              <div className="text-gray-600">{t["statsClicksTracked"] || "Clicks Tracked"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.featuresTitle}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t["featuresDescription"] || "Powerful features designed to help you create stunning bio link pages and grow your online presence."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>{t["featureTheme"] || "Beautiful Themes"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t["featureThemeDesc"] || "Choose from dozens of stunning themes or create your own custom design with our intuitive editor."}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>{t["featureAnalytics"] || "Analytics & Insights"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t["featureAnalyticsDesc"] || "Track clicks, views, and engagement with detailed analytics to understand what works best."}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>{t["featureMobile"] || "Mobile Optimized"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t["featureMobileDesc"] || "Perfect on every device. Your bio link page looks great on phones, tablets, and desktops."}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>{t["featureFast"] || "Lightning Fast"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t["featureFastDesc"] || "Built with modern technology for instant loading and smooth performance worldwide."}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>{t["featureDomains"] || "Free Subdomain"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t["featureDomainsDesc"] || "Get a free subdomain like yourname.linkulike.com. Perfect for branding and easy to remember."}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>{t["featureSocial"] || "Social Integration"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t["featureSocialDesc"] || "Connect all your social media profiles with beautiful icons and seamless integration."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t["pricing"] || "Simple, Transparent Pricing"}
            </h2>
            <p className="text-xl text-gray-600">
              {t["pricingDesc"] || "Start free, upgrade when you need more features."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t["freePlan"] || "Free"}</CardTitle>
                <div className="text-4xl font-bold">$0</div>
                <p className="text-gray-600">{t["freePlanDesc"] || "Forever free"}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>{t["freePlan1"] || "1 bio link page"}</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>{t["freePlan2"] || "Basic themes"}</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>{t["freePlan3"] || "Analytics"}</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>{t["freePlan4"] || "Mobile optimized"}</span>
                </div>
                <Link href="/register" className="block">
                  <Button className="w-full">{t["start"] || "Get Started Free"}</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">{t["mostPopular"] || "Most Popular"}</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold">$9</div>
                <p className="text-gray-600">{t["proPlanDesc"] || "per month"}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>{t["proPlan1"] || "Unlimited bio link pages"}</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>{t["proPlan2"] || "Premium themes"}</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>{t["proPlan3"] || "Advanced analytics"}</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>{t["proPlan4"] || "Advanced customization"}</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>{t["proPlan5"] || "Priority support"}</span>
                </div>
                <Link href="/register" className="block">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600">
                    {t["proPlanCta"] || "Start Pro Trial"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t["ctaTitle"] || "Ready to Create Your Bio Link Page?"}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t["ctaText"] || "Join thousands of creators who are already using LikeUlike to grow their online presence."}
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-6">
              {t["ctaCta"] || "Create Your Bio Link Page"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="font-bold text-xl">linkulike</span>
              </div>
              <p className="text-gray-400">
                {t["footerClaim"] || "The ultimate bio link platform for creators and entrepreneurs."}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t["footerProduct"] || "Product"}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t["footerFeatures"] || "Features"}</a></li>
                <li><a href="#" className="hover:text-white">{t["footerPricing"] || "Pricing"}</a></li>
                <li><a href="#" className="hover:text-white">{t["footerTemplates"] || "Themes"}</a></li>
                <li><a href="#" className="hover:text-white">{t["footerFaq"] || "Analytics"}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t["footerSupport"] || "Company"}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t["footerHelp"] || "About"}</a></li>
                <li><a href="#" className="hover:text-white">{t["footerContact"] || "Blog"}</a></li>
                <li><a href="#" className="hover:text-white">{t["footerFaq"] || "Careers"}</a></li>
                <li><a href="#" className="hover:text-white">{t["footerContact"] || "Contact"}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t["footerLegal"] || "Follow Us"}</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 linkulike. {t["footerCopyright"] || "All rights reserved."}</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 