"use client";

import React, { useState } from "react";
import { Send, Terminal, Sparkles, AlertTriangle } from "lucide-react";

interface TaskInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export function TaskInput({ onSendMessage, disabled = false }: TaskInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const quickPrompts = [
    "Verify with redis-cli monitor",
    "Show failing stack trace",
    "Request manual code sign-off",
    "Escalate to human",
  ];

  return (
    <div className="border-t dark:border-zinc-800/80 border-zinc-200 dark:bg-zinc-950/90 bg-white/95 backdrop-blur-md p-3.5 space-y-2 transition-colors">
      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] dark:text-zinc-400 text-zinc-600 font-mono scrollbar-none">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="dark:text-zinc-500 text-zinc-500 shrink-0">Directives:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(prompt)}
            disabled={disabled}
            className="rounded-full border dark:border-zinc-800 border-zinc-300 dark:bg-zinc-900/60 bg-zinc-100 px-2.5 py-0.5 whitespace-nowrap dark:hover:border-zinc-600 hover:border-zinc-400 dark:hover:text-zinc-200 hover:text-zinc-900 dark:text-zinc-400 text-zinc-700 transition-colors disabled:opacity-40 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3 flex items-center pointer-events-none text-zinc-500">
          <Terminal className="w-4 h-4 text-zinc-400" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder="Send guidance or directive to Shogun, Samurai, Sentinel or Shadow..."
          className="w-full rounded-xl border dark:border-zinc-700/80 border-zinc-300 dark:bg-zinc-900/80 bg-zinc-100 pl-9 pr-12 py-2.5 text-xs dark:text-zinc-100 text-zinc-900 placeholder-zinc-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="absolute right-2 flex items-center justify-center rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:hover:bg-rose-600 p-1.5 text-white transition-colors"
          title="Send instruction to agents"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
