'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Stat = {
  label: string;
  p50: number;
  p95: number;
  p99: number;
  count: number;
};

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");
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
    const data = await res.json();
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
        Authorization: `Bearer ${token}`,
       },
      body: JSON.stringify({ url, duration }),
    });

    alert(`Request took ${Math.round(duration)} ms`);
  };

  const fetchUrls = async () => {
    const res = await fetch("http://localhost:8080/urls", {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUrls(data.urls);
  };

  const handleAddUrl = async () => {
    if (!newUrl) return;
    await fetch("/api/urls", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: newUrl }),
    });
    setNewUrl("");
    fetchUrls();
  };

  const fetchMetrics = async () => {
    try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:8080/metrics", {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
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
    fetchUrls();
    fetchMetrics();
    fetchUser();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
  <main className="flex h-screen font-sans">
    {/* 左カラム：履歴・登録済みURL一覧 */}
    <aside className="w-1/4 bg-gray-100 p-6 border-r border-gray-300">
      <h2 className="text-xl font-semibold mb-4">Registered URLs</h2>
      <div className="mb-4">
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://api.example.com/endpoint"
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={handleAddUrl}
          className="mt-2 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Add
        </button>
      </div>
      <ul className="text-sm space-y-1">
        {urls.map((url, idx) => (
          <li key={idx} className="bg-white px-2 py-1 rounded border">{url}</li>
        ))}
      </ul>
    </aside>

    {/* 右カラム：ダッシュボード本体 */}
    <section className="flex-1 p-8 overflow-y-auto">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Latency Dashboard</h1>
        <div className="text-right text-sm text-gray-600 space-y-1">
          {username && (
            <div>Logged in as <strong>{username}</strong></div>
          )}
          <button onClick={logout} className="text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </div>

      {/* APIキー取得 */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">API Key</label>
        <div className="flex gap-2">
          <button
            onClick={fetchApiKey}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Show API Key
          </button>
          {isVisible && (
            <>
              <input
                value={apiKey}
                readOnly
                className="border px-2 py-1 rounded bg-gray-100 w-full"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Copy
              </button>
            </>
          )}
        </div>
      </div>

      {/* リクエスト送信 */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Test an Endpoint</label>
        <div className="flex gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/api"
            className="border border-gray-300 rounded px-4 py-2 w-full"
          />
          <button
            onClick={sendRequest}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send Request
          </button>
        </div>
      </div>

      {/* メトリクステーブル */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Latency Metrics</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Label</th>
              <th className="border px-4 py-2">P50</th>
              <th className="border px-4 py-2">P95</th>
              <th className="border px-4 py-2">P99</th>
              <th className="border px-4 py-2">Count</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(metrics) && metrics.length > 0 ? (
              metrics.map((stat) => (
                <tr key={stat.label} className="text-center">
                  <td className="border px-4 py-2">{stat.label}</td>
                  <td className="border px-4 py-2">{stat.p50}</td>
                  <td className="border px-4 py-2">{stat.p95}</td>
                  <td className="border px-4 py-2">{stat.p99}</td>
                  <td className="border px-4 py-2">{stat.count}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No metrics available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  </main>
  );
}