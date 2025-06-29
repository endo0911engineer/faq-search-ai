'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Edit3, Trash2, Search, BookOpen, MessageCircleQuestion, Sparkles, Save, X } from "lucide-react"

type FAQ = {
  id: number;
  question: string;
  answer: string;
};

export default function KnowledgePage() {
  const [username, setUsername] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

    useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);
    fetchFAQs(storedToken);
  }, []);

    const fetchFAQs = async (token: string) => {
    const res = await fetch("http://localhost:8080/faqs", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setFaqs(data);
  };

  const createFAQ = async () => {
    if (!question || !answer) return;

    const res = await fetch("http://localhost:8080/faqs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question, answer }),
    });

    if (res.ok) {
      fetchFAQs(token!);
      setQuestion("");
      setAnswer("");
    }
  };

  const updateFAQ = async () => {
    if (!editingId) return;

    const res = await fetch(`http://localhost:8080/faqs/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question, answer }),
    });

    if (res.ok) {
      fetchFAQs(token!);
      setEditingId(null);
      setQuestion("");
      setAnswer("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null)
    setQuestion("")
    setAnswer("")
  }


  const deleteFAQ = async (id: number) => {
    const res = await fetch(`http://localhost:8080/faqs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) fetchFAQs(token!);
  };

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
                onClick={editingId ? updateFAQ : createFAQ}
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

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.length === 0 ? (
            <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">まだFAQがありません</h3>
                <p className="text-gray-400">最初のFAQを追加して、ナレッジベースを構築しましょう</p>
              </CardContent>
            </Card>
          ) : (
            faqs.map((faq, index) => (
              <Card
                key={faq.id}
                className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          FAQ #{index + 1}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-relaxed text-gray-800">{faq.question}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(faq.id)
                          setQuestion(faq.question)
                          setAnswer(faq.answer)
                        }}
                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteFAQ(faq.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <Separator className="mx-6" />
                <CardContent className="pt-4">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}