'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, Key, Copy , Eye, EyeOff, Plus, Bookmark, Brain, Loader2, TrendingUp,  AlertTriangle, CheckCircle, } from "lucide-react"

type Stat = {
  label: string;
  p50: number;
  p95: number;
  p99: number;
  count: number;
};

type Endpoint = {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Stat[]>([]);
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [endpointName, setEndpointName] = useState("")
  const [endpointUrl, setEndpointUrl] = useState("")
  const [registeredEndpoints, setRegisteredEndpoints] = useState<Endpoint[]>([])
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string;
    insights: {
      title: string;
      description: string;
      type: "warning" | "success" | "info";
    }[];
    recommendations: string[];
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    if (storedToken) {
      fetchUser(storedToken);
      fetchRegisteredEndpoints(storedToken);
      fetchMetrics();

      const interval = setInterval(() => {
        fetchMetrics();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
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
  };

  const fetchRegisteredEndpoints = async (token: string) => {
    try {
      const res = await fetch("http://localhost:8080/monitor/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRegisteredEndpoints(data);
    } catch (e) {
      console.error("Failed to fetch endpoints:", e);
    }
  };

  const registerEndpoint = async () => {
    if (!endpointName || !endpointUrl || !token) return;
        try {
      const res = await fetch("http://localhost:8080/monitor/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: endpointUrl,
          label: endpointName,
          active: true
        }),
      });

      if (!res.ok) {
        console.error("Failed to register endpoint:", await res.json());
        return;
      }

      setEndpointName("");
      setEndpointUrl("");
      fetchRegisteredEndpoints(token); // 再取得
    } catch (e) {
      console.error("Error registering endpoint:", e);
    }
  };

  const toggleMonitoring = async (endpointId: string, shouldActivate: boolean) => {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:8080/monitor/toggle", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: endpointId, active: shouldActivate }),
      });

      if (!res.ok) {
        console.error("Failed to toggle monitoring:", await res.text());
        return;
      }
      
      fetchRegisteredEndpoints(token); // 状態更新
    } catch (e) {
      console.error("Failed to toggle monitoring:", e);
    }
  };

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

  const analyzeLatency = async () => {
  try {
    setIsAnalyzing(true);
    const res = await fetch("http://localhost:8080/LLM/analyze", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    setAnalysisResult({
      summary: data.summary,
      insights: [],
      recommendations: [],
  });
  } catch (e) {
    console.error("LLM analysis failed:", e);
  } finally {
    setIsAnalyzing(false);
  }
};

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
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
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
                <Button onClick={fetchApiKey} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
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
              <Button onClick={registerEndpoint} className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
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
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{endpoint.name}</p>
                          <p className="text-sm text-gray-600 font-mono">{endpoint.url}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant="secondary"
                            className={endpoint.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {endpoint.active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            onClick={() => toggleMonitoring(endpoint.id, !endpoint.active)}
                            variant={endpoint.active ? "outline" : "default"}
                            size="sm"
                            className={
                              endpoint.active
                                ? "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                : "bg-green-600 hover:bg-green-700 text-white"
                            }
                          >
                            {endpoint.active ? "Stop" : "Start"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* メトリクステーブル */}
          <Card className="shadow-lg bg-white/95 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <span>Latency Metrics</span>
                </CardTitle>
                <CardDescription>
                  Real-time performance metrics showing P50, P95, and P99 latencies for your endpoints.
                </CardDescription>
              </div>
              <Button
                onClick={analyzeLatency}
                disabled={isAnalyzing || !metrics || metrics.length === 0}
                variant="default"
                className="bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isAnalyzing ? (
                    <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                    </>
                  ) : (
                    <>
                    <Brain className="h-4 w-4 mr-2" />
                    LLMに分析させる
                    </>
                  )}
              </Button>
              </div>
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
                              {stat.p50.toFixed(2)}ms
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {stat.p95.toFixed(2)}ms
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              {stat.p99.toFixed(2)}ms
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

          {/* AI分析結果セクション */}
          {analysisResult && (
            <Card className="shadow-lg bg-white/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-orange-600" />
                  <span>AI Analysis Results</span>
                </CardTitle>
                <CardDescription>
                  AI-powered insights and recommendations based on your latency metrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 分析サマリー */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                  <p className="text-gray-700 leading-relaxed">{analysisResult.summary}</p>
                </div>

                {/* インサイト */}
                {analysisResult.insights && analysisResult.insights.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Insights</h4>
                    <div className="space-y-3">
                      {analysisResult.insights.map((insight, index) => (
                        <Alert
                          key={index}
                          className={
                            insight.type === "warning"
                              ? "border-yellow-200 bg-yellow-50"
                              : insight.type === "success"
                                ? "border-green-200 bg-green-50"
                                : "border-blue-200 bg-blue-50"
                          }
                        >
                          <div className="flex items-start space-x-2">
                            {insight.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                            {insight.type === "success" && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                            {insight.type === "info" && <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />}
                            <div>
                              <AlertDescription>
                                <strong className="font-medium">{insight.title}</strong>
                                <p className="mt-1">{insight.description}</p>
                              </AlertDescription>
                            </div>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* 推奨事項 */}
                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </main>
  );
}