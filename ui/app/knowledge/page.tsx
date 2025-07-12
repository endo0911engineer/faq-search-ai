"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit3, Trash2, Search, BookOpen, MessageCircleQuestion, Sparkles, Save, X, Brain } from "lucide-react"
import { askFAQ, createFAQ, deleteFAQ, fetchFAQs, updateFAQ } from "@/services/api"

type FAQ = {
  id: string
  question: string
  answer: string
}

export default function KnowledgePage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  const [searchQuestion, setSearchQuestion] = useState("")
  const [searchResult, setSearchResult] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResult, setShowSearchResult] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      router.push("/signin")
      return
    }
    setToken(storedToken)
  }, [])

  useEffect(() => {
    if(token) {
      fetchFAQs(token).then(setFaqs).catch(console.error)
    }
  }, [token])

  const createNewFAQ = async () => {
    if (!question || !answer) return
     try {
      await createFAQ(token!, question, answer)
      const updatedFaqs = await fetchFAQs(token!)
      setFaqs(updatedFaqs)
      setQuestion("")
      setAnswer("")
    } catch (e) {
      console.error(e)
    }
  }

  const updateExistingFAQ = async () => {
    if (!editingId) return
    try {
      await updateFAQ(token!, editingId, question, answer)
      const updatedFaqs = await fetchFAQs(token!)
      setFaqs(updatedFaqs)
      setEditingId(null)
      setQuestion("")
      setAnswer("")
    } catch (e) {
      console.error(e)
    }
  }

  const deleteExistingFAQ = async (id: string) => {
    try {
      await deleteFAQ(token!, id)
      const updatedFaqs = await fetchFAQs(token!)
      setFaqs(updatedFaqs)
    } catch (e) {
      console.error(e)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setQuestion("")
    setAnswer("")
  }

  const askQuestion = async () => {
    if (!searchQuestion) return
    setIsSearching(true)
    try {
      const data = await askFAQ(token!, searchQuestion)
      setSearchResult(data.answer)
      setShowSearchResult(true)
    } catch (e) {
      console.error("質問に対する回答取得に失敗しました", e)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FAQ ナレッジベース
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">AIを活用した次世代ナレッジ管理システム</p>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {faqs.length} 件のFAQ
            </Badge>
          </div>
        </div>

        {/* AI Search Section */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-purple-50 to-pink-50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Brain className="h-6 w-6 text-purple-600" />
              AI検索
              <Badge className="bg-purple-100 text-purple-700 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                LLM Powered
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600">自然言語でナレッジベースを検索できます</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                value={searchQuestion}
                onChange={(e) => setSearchQuestion(e.target.value)}
                placeholder="何について知りたいですか？（例：ログイン方法について教えて）"
                className="border-2 focus:border-purple-500 transition-colors"
                onKeyPress={(e) => e.key === "Enter" && askQuestion()}
              />
              <Button
                onClick={askQuestion}
                disabled={!searchQuestion || isSearching}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg min-w-[100px]"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    検索
                  </>
                )}
              </Button>
            </div>

            {showSearchResult && (
              <Card className="bg-white/80 border-purple-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      AI回答
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowSearchResult(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{searchResult}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              {editingId ? (
                <>
                  <Edit3 className="h-5 w-5 text-blue-600" />
                  FAQを編集
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-green-600" />
                  新しいFAQを追加
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MessageCircleQuestion className="h-4 w-4" />
                質問
              </label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="よくある質問を入力してください..."
                className="border-2 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Search className="h-4 w-4" />
                回答
              </label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="詳細な回答を入力してください..."
                className="border-2 focus:border-blue-500 transition-colors min-h-[100px]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={editingId ? updateExistingFAQ : createNewFAQ}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                disabled={!question || !answer}
              >
                {editingId ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    更新する
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    追加する
                  </>
                )}
              </Button>
              {editingId && (
                <Button onClick={cancelEdit} variant="outline" className="border-2 bg-transparent">
                  <X className="h-4 w-4 mr-2" />
                  キャンセル
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* FAQ List - Compact Grid Layout */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              ナレッジ一覧
            </h2>
            <Badge variant="outline" className="text-sm">
              {faqs.length} 件
            </Badge>
          </div>

          {faqs.length === 0 ? (
            <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">まだFAQがありません</h3>
                <p className="text-gray-400">最初のFAQを追加して、ナレッジベースを構築しましょう</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {faqs.slice().reverse().map((faq, index) => (
                <Card
                  key={faq.id}
                  className="shadow-md border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-xs shrink-0">
                        #{index + 1}
                      </Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(faq.id)
                            setQuestion(faq.question)
                            setAnswer(faq.answer)
                          }}
                          className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteExistingFAQ(faq.id)}
                          className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-sm leading-relaxed text-gray-800 line-clamp-2">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}