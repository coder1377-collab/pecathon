"use client";

import React, { useState } from "react";
import { DiffViewer } from "./DiffViewer";
import { TerminalViewer } from "./TerminalViewer";
import { FilesViewer } from "./FilesViewer";
import { StateViewer } from "./StateViewer";
import { AgentGraph } from "./AgentGraph";
import { Scene } from "@/components/Scene";
import { MissionState, AgentType } from "@/types/events";
import { FileDiff, Terminal, FolderOpen, Database, Network, Moon } from "lucide-react";

interface RightPanelProps {
  missionState: MissionState;
  activeAgent: AgentType | null;
  missionId?: string;
}

type TabType = "diff" | "terminal" | "files" | "state" | "graph" | "scene";

export function RightPanel({ missionState, activeAgent, missionId = "mission_001" }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("diff");

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: "diff",
      label: "Diff",
      icon: <FileDiff className="w-3.5 h-3.5" />,
      badge: "+42 -11",
    },
    {
      id: "terminal",
      label: "Terminal",
      icon: <Terminal className="w-3.5 h-3.5" />,
      badge: missionState.terminalLogs.length,
    },
    {
      id: "files",
      label: "Files",
      icon: <FolderOpen className="w-3.5 h-3.5" />,
      badge: missionState.modifiedFiles.length || 2,
    },
    {
      id: "state",
      label: "State",
      icon: <Database className="w-3.5 h-3.5" />,
    },
    {
      id: "graph",
      label: "Agent Graph",
      icon: <Network className="w-3.5 h-3.5" />,
      badge: missionState.retryCount > 0 ? `Loop ${missionState.retryCount}` : undefined,
    },
    {
      id: "scene",
      label: "Kyoto Night",
      icon: <Moon className="w-3.5 h-3.5 text-amber-300" />,
      badge: "3D",
    },
  ];

  return (
    <div className="h-full flex flex-col dark:bg-zinc-950 bg-white border-l dark:border-zinc-800/80 border-zinc-200 transition-colors">
      {/* Tab Navigation Header */}
      <div className="h-14 flex items-center border-b dark:border-zinc-800/80 border-zinc-200 dark:bg-zinc-900/80 bg-zinc-50 px-2 overflow-x-auto scrollbar-none shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "dark:bg-zinc-800 bg-white dark:text-zinc-100 text-zinc-900 font-semibold shadow-sm border dark:border-zinc-700/80 border-zinc-300"
                  : "dark:text-zinc-400 text-zinc-600 dark:hover:text-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800/50 hover:bg-zinc-200/70"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-0.5 rounded px-1.5 py-0.2 text-[9px] font-bold ${
                    isActive
                      ? "dark:bg-rose-950 bg-rose-100 dark:text-rose-300 text-rose-700 border dark:border-rose-800/60 border-rose-300"
                      : "dark:bg-zinc-800 bg-zinc-200 dark:text-zinc-400 text-zinc-600"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "diff" && <DiffViewer missionId={missionId} />}
        {activeTab === "terminal" && <TerminalViewer logs={missionState.terminalLogs} />}
        {activeTab === "files" && <FilesViewer modifiedFiles={missionState.modifiedFiles} />}
        {activeTab === "state" && <StateViewer state={missionState} />}
        {activeTab === "graph" && (
          <AgentGraph
            activeAgent={activeAgent}
            retryCount={missionState.retryCount}
          />
        )}
        {activeTab === "scene" && (
          <div className="h-full w-full relative">
            <Scene />
          </div>
        )}
      </div>
    </div>
  );
}
