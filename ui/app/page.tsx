"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Search,
  Zap,
  Users,
  ArrowRight,
  Sparkles,
  Brain,
  MessageCircleQuestion,
  Plus,
  ChevronRight,
  Star,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const router = useRouter();

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI搭載検索",
      description: "自然言語でFAQを検索。AIが最適な回答を瞬時に見つけます。",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Plus className="h-8 w-8" />,
      title: "簡単FAQ作成",
      description: "直感的なインターフェースで、誰でも簡単にFAQを作成・管理できます。",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "チーム協業",
      description: "チームメンバーと知識を共有し、組織全体の生産性を向上させます。",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "リアルタイム更新",
      description: "変更は即座に反映され、常に最新の情報を提供します。",
      color: "from-orange-500 to-red-500",
    },
  ]

  const steps = [
    {
      step: "01",
      title: "アカウント作成",
      description: "無料でアカウントを作成し、すぐに始められます。",
      icon: <Users className="h-6 w-6" />,
    },
    {
      step: "02",
      title: "FAQを追加",
      description: "よくある質問と回答を追加して、ナレッジベースを構築します。",
      icon: <Plus className="h-6 w-6" />,
    },
    {
      step: "03",
      title: "AI検索を活用",
      description: "自然言語で検索し、AIが最適な回答を提案します。",
      icon: <Search className="h-6 w-6" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                FAQ Knowledge
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-blue-600"
              onClick={() => router.push("/login")}
              > 
                サインイン
              </Button>
              <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              onClick={() => router.push("/signup")}
              >
                無料で始める
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl transform -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              次世代の
            </span>
            <br />
            <span className="text-gray-800">ナレッジベース</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            AIを活用したFAQ管理システムで、チームの知識を効率的に整理・共有。
            <br />
            自然言語検索で、必要な情報を瞬時に見つけることができます。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl text-lg px-8 py-4"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              無料で始める
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 text-lg px-8 py-4 bg-transparent">
              <MessageCircleQuestion className="h-5 w-5 mr-2" />
              デモを見る
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">なぜFAQ Knowledgeなのか？</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              従来のFAQシステムを超えた、AI駆動の次世代ナレッジ管理プラットフォーム
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardHeader className="pb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
                {hoveredFeature === index && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none" />
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">簡単3ステップで始める</h2>
            <p className="text-xl text-gray-600">数分でナレッジベースを構築し、チームの生産性を向上させましょう</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                      {step.step}
                    </div>
                    <CardTitle className="text-xl flex items-center justify-center gap-2">
                      {step.icon}
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="h-8 w-8 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90"></div>
            <CardContent className="relative py-16 px-8">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                  <Sparkles className="h-12 w-12" />
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-4">今すぐ始めませんか？</h2>
              <p className="text-xl mb-8 text-blue-100">
                無料プランで全機能をお試しいただけます。クレジットカード不要。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl text-lg px-8 py-4">
                  <Star className="h-5 w-5 mr-2" />
                  無料アカウント作成
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 bg-transparent"
                >
                  サインイン
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">FAQ Knowledge</span>
              </div>
              <p className="text-gray-400">AIを活用した次世代ナレッジベース管理システム</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">製品</h3>
              <ul className="space-y-2 text-gray-400">
                <li>機能</li>
                <li>価格</li>
                <li>API</li>
                <li>統合</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">サポート</h3>
              <ul className="space-y-2 text-gray-400">
                <li>ヘルプセンター</li>
                <li>ドキュメント</li>
                <li>お問い合わせ</li>
                <li>ステータス</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">会社</h3>
              <ul className="space-y-2 text-gray-400">
                <li>会社概要</li>
                <li>ブログ</li>
                <li>採用情報</li>
                <li>プライバシー</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FAQ Knowledge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
