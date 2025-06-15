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

  const sendRequest = async () => {
    if (!url) return;
    const start = performance.now();

    try {
      await fetch(url);
    } catch (e) {
      console.error("Request failed:", e);
    }

    const duration = performance.now() - start;

    await fetch("/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, duration }),
    });

    alert(`Request took ${Math.round(duration)} ms`);
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/metrics");
      const data: Stat[] = await res.json();
      setMetrics(data);
    } catch (e) {
      console.error("Error fetching metrics:", e);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Latency Report</h1>
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
          {metrics.map((stat) => (
            <tr key={stat.label}>
              <td className="border border-gray-300 px-4 py-2">{stat.label}</td>
              <td className="border border-gray-300 px-4 py-2">{stat.p50}</td>
              <td className="border border-gray-300 px-4 py-2">{stat.p95}</td>
              <td className="border border-gray-300 px-4 py-2">{stat.p99}</td>
              <td className="border border-gray-300 px-4 py-2">{stat.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}