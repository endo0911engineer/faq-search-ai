'use client'

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
  const [metrics, setMetrics] = useState<Stat[]>([]);
  const [username, setUsername] = useState("")

  const sendRequest = async () => {
    if (!url) return;
    const start = performance.now();

    try {
      await fetch(url);
    } catch (e) {
      console.error("Request failed:", e);
    }

    const duration = performance.now() - start;

    const token = localStorage.getItem("token")
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
    fetchMetrics();
    fetchUser();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-8 font-sans">
        <div className="flex justify-between items-center mb-6"></div>
        <h1 className="text-2xl font-bold mb-4">Latency Report</h1>
        <div className="text-right text-gray-600">
            {username && (
            <span className="text-sm">
              Logged in as <strong>{username}</strong>
            </span>
          )}
        </div>

        <div className="mb-6 flex items-center gap-4">
            <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/api"
            className="border border-gray-300 rounded px-4 py-2 w-96"
            />
            <button
            onClick={sendRequest}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Send Request
            </button>
        </div>
        
        <table className="w-full border-collapse border border-gray-300">
            <thead>
                <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Label</th>
                <th className="border border-gray-300 px-4 py-2">P50</th>
                <th className="border border-gray-300 px-4 py-2">P95</th>
                <th className="border border-gray-300 px-4 py-2">P99</th>
                <th className="border border-gray-300 px-4 py-2">Count</th>
                </tr>
            </thead>
            <tbody>
                {Array.isArray(metrics) && metrics.length > 0 ? (
                    metrics.map((stat) => (
                        <tr key={stat.label}>
                        <td className="border border-gray-300 px-4 py-2">{stat.label}</td>
                        <td className="border border-gray-300 px-4 py-2">{stat.p50}</td>
                        <td className="border border-gray-300 px-4 py-2">{stat.p95}</td>
                        <td className="border border-gray-300 px-4 py-2">{stat.p99}</td>
                        <td className="border border-gray-300 px-4 py-2">{stat.count}</td>
                    </tr>
                ))
            ) : (
                <td colSpan={5} className="text-center py-4 text-gray-500">
                    No metrics available
                </td>
            )}
            </tbody>
        </table>
    </main>
  );
}