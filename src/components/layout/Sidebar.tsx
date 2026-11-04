"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Plus,
  Compass,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Settings,
  Flame,
  Radio,
  Server,
} from "lucide-react";
import { EventSourceType } from "@/hooks/useEventStream";

interface SidebarProps {
  currentMissionId: string;
  onSelectMission: (id: string) => void;
  isPlaying: boolean;
  speed: 1 | 2 | 5;
  isFinished: boolean;
  eventsCount: number;
  totalEventsCount: number;
  sourceType: EventSourceType;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onStep: () => void;
  onSetSpeed: (speed: 1 | 2 | 5) => void;
}

interface MissionItem {
  id: string;
  title: string;
  status: "active" | "completed" | "escalated";
  repo: string;
  time: string;
}

export function Sidebar({
  currentMissionId,
  onSelectMission,
  isPlaying,
  speed,
  isFinished,
  eventsCount,
  totalEventsCount,
  sourceType,
  onPlay,
  onPause,
  onRestart,
  onStep,
  onSetSpeed,
}: SidebarProps) {
  const [showSettings, setShowSettings] = useState(false);

  const missions: MissionItem[] = [
    {
      id: "mission_001",
      title: "Fix Stripe Webhook Idempotency & Auth Leak",
      status: "active",
      repo: "billing-service",
      time: "Just now",
    },
    {
      id: "mission_002",
      title: "Migrate Session Auth to WebAuthn Passkeys",
      status: "completed",
      repo: "identity-gateway",
      time: "2h ago",
    },
    {
      id: "mission_003",
      title: "Resolve Redis Memory OOM in Pipeline",
      status: "escalated",
      repo: "event-streamer",
      time: "Yesterday",
    },
  ];

  return (
    <aside className="h-full flex flex-col justify-between dark:bg-zinc-950 bg-white border-r dark:border-zinc-800/80 border-zinc-200 w-72 shrink-0 font-mono text-xs select-none transition-colors">
      {/* Top Header & Brand */}
      <div>
        <div className="h-14 flex items-center justify-between px-4 border-b dark:border-zinc-800/80 border-zinc-200 dark:bg-zinc-900/40 bg-zinc-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-600 via-rose-700 to-amber-600 flex items-center justify-center text-white font-bold shadow-glow text-sm">
              ⚔
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider dark:text-zinc-100 text-zinc-900 flex items-center gap-1.5">
                DEVPILOT
                <span className="text-[9px] font-semibold text-rose-500 uppercase tracking-widest px-1 py-0.2 rounded dark:bg-rose-950 bg-rose-100 dark:border-rose-900/60 border-rose-300">
                  OPS
                </span>
              </div>
              <div className="text-[10px] dark:text-zinc-500 text-zinc-600 tracking-tight">
                Autonomous AI Engineering
              </div>
            </div>
          </div>
        </div>

        {/* New Mission Button */}
        <div className="p-3">
          <button
            onClick={() => onRestart()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold py-2 px-3 text-xs shadow-glow transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Mission</span>
          </button>
        </div>

        {/* Replay Playback Controller Card */}
        <div className="mx-3 mb-4 rounded-xl border dark:border-zinc-800 border-zinc-200 dark:bg-zinc-900/60 bg-zinc-50 p-3 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] dark:text-zinc-400 text-zinc-600 font-semibold border-b dark:border-zinc-800/80 border-zinc-200 pb-1.5">
            <span className="flex items-center gap-1.5 dark:text-zinc-200 text-zinc-800">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              Event Stream Control
            </span>
            <span className="text-[10px] dark:text-zinc-500 text-zinc-600 font-mono">
              {eventsCount}/{totalEventsCount || 22}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full dark:bg-zinc-800 bg-zinc-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-amber-500 h-1.5 transition-all duration-300"
              style={{
                width: `${
                  totalEventsCount > 0
                    ? Math.min(100, (eventsCount / totalEventsCount) * 100)
                    : 0
                }%`,
              }}
            />
          </div>

          {/* Controls: Play/Pause, Step, Restart */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {isPlaying ? (
                <button
                  onClick={onPause}
                  className="flex items-center gap-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 text-xs transition-colors"
                  title="Pause stream"
                >
                  <Pause className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={onPlay}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 text-xs font-semibold shadow-emeraldGlow transition-colors"
                  title="Play stream"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isFinished ? "Replay" : "Stream"}</span>
                </button>
              )}

              <button
                onClick={onStep}
                disabled={isPlaying || isFinished}
                className="flex items-center gap-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 px-2 py-1 text-xs transition-colors"
                title="Advance single event"
              >
                <StepForward className="w-3.5 h-3.5" />
                <span>Step</span>
              </button>
            </div>

            <button
              onClick={onRestart}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Reset stream"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Selector (1x, 2x, 5x) */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[10px]">
            <span className="text-zinc-500">Speed multiplier:</span>
            <div className="flex items-center gap-1 bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
              {([1, 2, 5] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => onSetSpeed(s)}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    speed === s
                      ? "bg-rose-600 text-white shadow-glow"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Missions Navigation List */}
        <div className="px-3 space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider dark:text-zinc-500 text-zinc-600 px-2 py-1">
            Past Missions
          </div>
          {missions.map((m) => {
            const isSelected = currentMissionId === m.id;
            return (
              <div
                key={m.id}
                onClick={() => onSelectMission(m.id)}
                className={`group flex flex-col gap-1 p-2.5 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? "dark:bg-zinc-900 bg-zinc-100 dark:border-zinc-700/80 border-zinc-300 dark:text-zinc-100 text-zinc-900 shadow-sm"
                    : "bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/50 dark:text-zinc-400 text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono dark:text-zinc-500 text-zinc-600 group-hover:text-zinc-800 dark:group-hover:text-zinc-400">
                    {m.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {m.status === "active" && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                    {m.status === "completed" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    {m.status === "escalated" && (
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span className="text-[10px] dark:text-zinc-500 text-zinc-600">{m.time}</span>
                  </div>
                </div>
                <div className="text-xs font-semibold truncate leading-tight">
                  {m.title}
                </div>
                <div className="text-[10px] dark:text-zinc-500 text-zinc-600">{m.repo}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Settings & Status Bar */}
      <div className="border-t dark:border-zinc-800/80 border-zinc-200 dark:bg-zinc-900/60 bg-zinc-50 p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] dark:text-zinc-400 text-zinc-600">
          <div className="flex items-center gap-1.5">
            <Radio
              className={`w-3.5 h-3.5 ${
                sourceType === "replay" ? "text-amber-500" : "text-emerald-500"
              }`}
            />
            <span className="capitalize">{sourceType} Mode</span>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 dark:text-zinc-400 text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            title="Settings & Config"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {showSettings && (
          <div className="rounded-lg border dark:border-zinc-800 border-zinc-300 dark:bg-black/80 bg-white p-2.5 text-[10px] space-y-1.5 dark:text-zinc-400 text-zinc-600 shadow-sm">
            <div className="flex justify-between items-center">
              <span>Event Source:</span>
              <span className="dark:text-zinc-200 text-zinc-800 font-bold uppercase">{sourceType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Endpoint:</span>
              <span className="dark:text-zinc-400 text-zinc-600 truncate max-w-[120px]">
                {sourceType === "replay"
                  ? "/runs/mission_001/events.jsonl"
                  : "localhost:8000/missions/events"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Environment:</span>
              <span className="text-emerald-500 font-bold">localhost:3000</span>
            </div>
          </div>
        )}

        <div className="text-[10px] dark:text-zinc-500 text-zinc-600 text-center">
          DevPilot v1.0 • Samurai AI Architecture
        </div>
      </div>
    </aside>
  );
}
