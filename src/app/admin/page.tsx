"use client";

import { useState, useEffect } from "react";
import { Play, Activity, Database, FilePlus, ChevronRight } from "lucide-react";

/**
 * Admin Panel.
 * Includes a manual pipeline trigger, article status overview, and crawl stats.
 */
export default function AdminPage() {
    const [isRunning, setIsRunning] = useState(false);
    const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
    const [activeSources, setActiveSources] = useState(0);
    const [healthStatus, setHealthStatus] = useState<string>('Healthy');
    const [failingCount, setFailingCount] = useState(0);

    // Load initial stats
    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/sources?status=fresh&limit=1");
                const data = await res.json();
                if (data.total !== undefined) setActiveSources(data.total);

                const healthRes = await fetch("/api/admin/health");
                const healthData = await healthRes.json();
                if (healthData.systemStatus) {
                    setHealthStatus(healthData.systemStatus);
                    setFailingCount(healthData.failingCount || 0);
                }
            } catch (err) {
                console.error("Failed to fetch admin stats:", err);
            }
        }
        fetchStats();
    }, []);

    const triggerPipeline = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setPipelineLogs(["Initializing Pipeline...", "Executing Crawl Runner..."]);

        try {
            const res = await fetch("/api/pipeline/run", { method: "POST" });
            const data = await res.json();

            if (data.success) {
                setPipelineLogs(prev => [
                    ...prev,
                    "Crawl complete: " + data.crawlStats.newInserted + " items discovered.",
                    "AI Pipeline successful.",
                    "Generated Article ID: " + data.articleId,
                    "Theme: " + data.theme,
                    "Draft saved."
                ]);
                // Update fresh source count
                const res2 = await fetch("/api/sources?status=fresh&limit=1").then(r => r.json());
                if (res2.total !== undefined) setActiveSources(res2.total);
            } else {
                setPipelineLogs(prev => [...prev, "Pipeline Failure: " + (data.error || "Unknown Error")]);
            }
        } catch (err) {
            setPipelineLogs(prev => [...prev, "Network Error: " + String(err)]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b-2 border-slate-100">
                <div className="space-y-2">
                    <h1 className="text-4xl font-sans font-black tracking-tighter text-accent uppercase">Editorial Control</h1>
                    <p className="text-sm font-sans font-bold text-slate-400 uppercase tracking-widest">Journal Management & Pipeline Orchestration</p>
                </div>
                <button
                    onClick={triggerPipeline}
                    disabled={isRunning}
                    className="inline-flex items-center px-10 py-4 bg-accent text-white font-sans font-black text-xs tracking-widest uppercase hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-accent/20 active:scale-95"
                >
                    {isRunning ? "Running..." : "Trigger New Volume"} <Play className="ml-3 w-5 h-5 fill-current" />
                </button>
            </header>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-slate-50 border border-slate-200 rounded animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center space-x-3 mb-6">
                        <Database className="w-5 h-5 text-accent" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Knowledge Base</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-5xl font-sans font-black text-accent">{activeSources}</span>
                        <span className="text-xs font-sans font-black text-slate-400 uppercase tracking-widest">Fresh Sources</span>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border border-slate-200 rounded animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <div className="flex items-center space-x-3 mb-6 text-slate-400">
                        <Activity className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Pipeline Status</span>
                    </div>
                    <p className="text-sm font-serif italic text-slate-500">
                        {isRunning ? "Pipeline active: Synthesizing current data stream." : "Standby: Ready for manual or scheduled trigger."}
                    </p>
                </div>

                <div className="p-8 bg-slate-50 border border-slate-200 rounded animate-in fade-in slide-in-from-bottom-2 duration-1000">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3 text-slate-400">
                            <Activity className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Source Vitality</span>
                        </div>
                        {healthStatus === 'Healthy' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                        {healthStatus === 'Degraded' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
                        {healthStatus === 'Critical' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                    </div>
                    <p className="text-sm font-serif text-slate-500 leading-relaxed">
                        {healthStatus === 'Healthy'
                            ? "All data providers are operating within normal parameters."
                            : `${failingCount} providers are currently returning errors and require attention.`}
                    </p>
                </div>
            </div>

            {/* Pipeline Logs Console */}
            <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-2" /> Live Execution Stream
                </h3>
                <div className="bg-slate-900 rounded p-8 font-mono text-sm space-y-2 text-indigo-300 min-h-64 shadow-inner overflow-y-auto max-h-96">
                    {pipelineLogs.length === 0 ? (
                        <p className="text-slate-600 italic">Waiting for manual execution trigger...</p>
                    ) : (
                        pipelineLogs.map((log, i) => (
                            <div key={i} className="flex items-start">
                                <span className="text-slate-700 mr-4">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                                <span className={log.includes('Failure') || log.includes('Error') ? 'text-red-400' : 'text-slate-300'}>
                                    {log}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
