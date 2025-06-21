'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Activity, Key, Copy, Send, Eye, EyeOff, Plus, MessageSquare, Bookmark } from "lucide-react"

type Stat = {
  label: string;
  p50: number;
  p95: number;
  p99: number;
  count: number;
};

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [metrics, setMetrics] = useState<Stat[]>([]);
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const token = localStorage.getItem("token")

  const fetchApiKey = async () => {
    const res = await fetch("http://localhost:8080/me/apikey", {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch API key:", text);
    return;
    }

    const data = await res.json();
    localStorage.setItem("apiKey", data.api_key);
    console.log(localStorage.getItem("apiKey"))
    setApiKey(data.api_key);
    setIsVisible(true);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
  };

  const sendRequest = async () => {
    if (!url) return;
    const start = performance.now();

    try {
      await fetch(url);
    } catch (e) {
      console.error("Request failed:", e);
    }

    const duration = performance.now() - start;

    await fetch("http://localhost:8080/record", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-API-Key": localStorage.getItem("apiKey") || "",
       },
      body: JSON.stringify({ label: url, duration }),
    });

    await fetchMetrics();

    alert(`Request took ${Math.round(duration)} ms`);
  };

  const fetchMetrics = async () => {
    try {
        const apiKey = localStorage.getItem("apiKey")
        const res = await fetch("http://localhost:8080/metrics", {
            headers: {
              "X-API-Key": apiKey || "",
            }
        });

        if (!res.ok) {
        throw new Error(`Failed to fetch metrics: ${res.status}`);
        }
        
        const data: Stat[] = await res.json();
        setMetrics(data);
      } catch (e) {
        console.error("Error fetching metrics:", e);
      }
  };

  const fetchUser = async () => {
    try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:8080/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        const data = await res.json()
        if (res.ok && data.username) {
            setUsername(data.username)
        }
    } catch (e) {
        console.error("Error fetching user info:", e)
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
     <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Latency Dashboard</h1>
              <p className="text-gray-600">Monitor your API performance in real-time</p>
            </div>
          </div>
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="text-right text-sm space-y-2">
                {username && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Online
                    </Badge>
                    <span className="text-gray-600">
                      Logged in as <strong className="text-gray-900">{username}</strong>
                    </span>
                  </div>
                )}
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          {/* APIキー取得セクション */}
          <Card className="shadow-lg bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-blue-600" />
                <span>API Key Management</span>
              </CardTitle>
              <CardDescription>
                Use this API key to authenticate your requests and start monitoring your endpoints.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button onClick={fetchApiKey} className="bg-blue-600 hover:bg-blue-700">
                  {isVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {isVisible ? "Hide API Key" : "Show API Key"}
                </Button>
                {isVisible && (
                  <>
                    <div className="flex-1 relative">
                      <Input
                        value={apiKey}
                        readOnly
                        className="bg-gray-50 font-mono text-sm pr-12"
                        placeholder="Your API key will appear here"
                      />
                    </div>
                    <Button onClick={copyToClipboard} variant="outline" className="hover:bg-gray-50">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* エンドポイント登録セクション */}
          <Card className="shadow-lg bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bookmark className="h-5 w-5 text-indigo-600" />
                <span>Register Endpoint</span>
              </CardTitle>
              <CardDescription>Register your API endpoints for continuous monitoring and tracking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endpoint-name">Endpoint Name</Label>
                  <Input
                    id="endpoint-name"
                    type="text"
                    value={endpointName}
                    onChange={(e) => setEndpointName(e.target.value)}
                    placeholder="e.g., User API, Payment Service"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endpoint-register-url">Endpoint URL</Label>
                  <Input
                    id="endpoint-register-url"
                    type="text"
                    value={endpointUrl}
                    onChange={(e) => setEndpointUrl(e.target.value)}
                    placeholder="https://api.example.com/users"
                    className="font-mono"
                  />
                </div>
              </div>
              <Button onClick={registerEndpoint} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Register Endpoint
              </Button>

              {/* 登録済みエンドポイント一覧 */}
              {registeredEndpoints && registeredEndpoints.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Registered Endpoints</h4>
                  <div className="space-y-2">
                    {registeredEndpoints.map((endpoint) => (
                      <div key={endpoint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{endpoint.name}</p>
                          <p className="text-sm text-gray-600 font-mono">{endpoint.url}</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 自然言語でのエンドポイント登録セクション */}
          <Card className="shadow-lg bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span>Natural Language Registration</span>
              </CardTitle>
              <CardDescription>
                Describe your API endpoint in natural language and let AI help you register it automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="natural-language-input">Describe your endpoint</Label>
                <Textarea
                  id="natural-language-input"
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  placeholder="e.g., I want to monitor my user authentication API at https://api.myapp.com/auth/login that handles user login requests"
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={processNaturalLanguage} className="bg-purple-600 hover:bg-purple-700">
                <MessageSquare className="h-4 w-4 mr-2" />
                Process with AI
              </Button>
            </CardContent>
          </Card>

          {/* リクエスト送信セクション */}
          <Card className="shadow-lg bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5 text-green-600" />
                <span>Test Endpoint</span>
              </CardTitle>
              <CardDescription>
                Send a test request to any endpoint to see latency metrics in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="test-endpoint-url" className="sr-only">
                    Test Endpoint URL
                  </Label>
                  <Input
                    id="test-endpoint-url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/api/endpoint"
                    className="font-mono"
                  />
                </div>
                <Button onClick={sendRequest} className="bg-green-600 hover:bg-green-700 px-6">
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* メトリクステーブル */}
          <Card className="shadow-lg bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <span>Latency Metrics</span>
              </CardTitle>
              <CardDescription>
                Real-time performance metrics showing P50, P95, and P99 latencies for your endpoints.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-900">Endpoint</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center">P50 (ms)</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center">P95 (ms)</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center">P99 (ms)</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center">Requests</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(metrics) && metrics.length > 0 ? (
                      metrics.map((stat) => (
                        <TableRow key={stat.label} className="hover:bg-gray-50/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-mono text-sm">{stat.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {stat.p50}ms
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {stat.p95}ms
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              {stat.p99}ms
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-gray-600 font-medium">{stat.count}</span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center space-y-3">
                            <Activity className="h-12 w-12 text-gray-300" />
                            <div>
                              <p className="text-gray-500 font-medium">No metrics available</p>
                              <p className="text-gray-400 text-sm">Send a test request to see latency data</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}