"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DevPilotEvent, AgentType, MissionState } from "@/types/events";
import { reduceMissionState, initialMissionState } from "@/lib/mission-state";

export type EventSourceType = "replay" | "sse";

export interface UseEventStreamOptions {
  missionId?: string;
  sourceType?: EventSourceType;
  autoPlay?: boolean;
}

export interface UseEventStreamReturn {
  events: DevPilotEvent[];
  allEvents: DevPilotEvent[];
  currentEvent: DevPilotEvent | null;
  activeAgent: AgentType | null;
  isPlaying: boolean;
  speed: 1 | 2 | 5;
  isFinished: boolean;
  missionState: MissionState;
  sourceType: EventSourceType;
  play: () => void;
  pause: () => void;
  restart: () => void;
  step: () => void;
  setSpeed: (speed: 1 | 2 | 5) => void;
  postApproval: (approvalId: string, decision: "approved" | "rejected", notes?: string) => Promise<void>;
  submitClarification: (questionId: string, answer: string) => void;
  addUserInstruction: (instruction: string) => void;
}

export function useEventStream(options: UseEventStreamOptions = {}): UseEventStreamReturn {
  const envSource = (process.env.NEXT_PUBLIC_EVENT_SOURCE as EventSourceType) || "replay";
  const sourceType = options.sourceType || envSource;
  const missionId = options.missionId || "mission_001";

  const [allEvents, setAllEvents] = useState<DevPilotEvent[]>([]);
  const [streamedEvents, setStreamedEvents] = useState<DevPilotEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(options.autoPlay ?? true);
  const [speed, setSpeed] = useState<1 | 2 | 5>(1);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Replay Source: fetch events.jsonl
  useEffect(() => {
    let cancelled = false;

    if (sourceType === "replay") {
      fetch(`/runs/${missionId}/events.jsonl`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.text();
        })
        .then((text) => {
          if (cancelled) return;
          const lines = text
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          const parsed: DevPilotEvent[] = [];
          for (const line of lines) {
            try {
              parsed.push(JSON.parse(line));
            } catch (e) {
              console.warn("Failed to parse event line:", line, e);
            }
          }

          setAllEvents(parsed);
          setStreamedEvents([]);
          setCurrentIndex(0);
          setIsFinished(false);
        })
        .catch((err) => {
          console.error("Error loading replay file:", err);
        });
    } else {
      // SSESource stub
      console.info(`[SSESource] Connecting to http://localhost:8000/missions/${missionId}/events`);
      try {
        const eventSource = new EventSource(`http://localhost:8000/missions/${missionId}/events`);
        eventSource.onmessage = (e) => {
          try {
            const ev: DevPilotEvent = JSON.parse(e.data);
            setStreamedEvents((prev) => [...prev, ev]);
          } catch (err) {
            console.error("Failed to parse SSE event", err);
          }
        };
        eventSource.onerror = (err) => {
          console.warn("[SSESource] Connection error or backend offline. Reverting to stub.", err);
          eventSource.close();
        };

        return () => {
          eventSource.close();
        };
      } catch (e) {
        console.warn("[SSESource] Could not establish EventSource connection:", e);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [missionId, sourceType]);

  // Replay tick loop
  useEffect(() => {
    if (sourceType !== "replay") return;
    if (!isPlaying) return;
    if (allEvents.length === 0) return;
    if (currentIndex >= allEvents.length) {
      setIsFinished(true);
      setIsPlaying(false);
      return;
    }

    // Base delay between events (approx 1500ms, divided by speed)
    const baseDelay = 1600;
    const delay = Math.max(300, Math.floor(baseDelay / speed));

    timerRef.current = setTimeout(() => {
      const nextEvent = allEvents[currentIndex];
      if (nextEvent) {
        setStreamedEvents((prev) => [...prev, nextEvent]);
        setCurrentIndex((prev) => prev + 1);
      }
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [sourceType, isPlaying, currentIndex, allEvents, speed]);

  const play = useCallback(() => {
    if (currentIndex >= allEvents.length) {
      // If at the end, restart from beginning
      setStreamedEvents([]);
      setCurrentIndex(0);
      setIsFinished(false);
    }
    setIsPlaying(true);
  }, [currentIndex, allEvents.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const restart = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStreamedEvents([]);
    setCurrentIndex(0);
    setIsFinished(false);
    setIsPlaying(true);
  }, []);

  const step = useCallback(() => {
    if (currentIndex < allEvents.length) {
      const nextEvent = allEvents[currentIndex];
      setStreamedEvents((prev) => [...prev, nextEvent]);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, allEvents]);

  // Handle human approval
  const postApproval = useCallback(
    async (approvalId: string, decision: "approved" | "rejected", notes?: string) => {
      console.log(`[Approval API] POST /missions/${missionId}/approval`, {
        approvalId,
        decision,
        notes,
      });

      if (sourceType === "sse") {
        try {
          await fetch(`http://localhost:8000/missions/${missionId}/approval`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ approvalId, decision, notes }),
          });
        } catch (err) {
          console.warn("[Approval API] Failed to contact backend:", err);
        }
      }

      // In replay mode or local execution, synthesize approval event if not already present
      const now = new Date().toISOString();
      const syntheticEvent: DevPilotEvent =
        decision === "approved"
          ? {
              id: Date.now(),
              ts: now,
              type: "approval_granted",
              agent: "orchestrator",
              data: {
                approvalId,
                approvedBy: "Human Operator (You)",
                notes: notes || "Manual sign-off via DevPilot Mission Control",
              },
            }
          : {
              id: Date.now(),
              ts: now,
              type: "approval_rejected",
              agent: "orchestrator",
              data: {
                approvalId,
                rejectedBy: "Human Operator (You)",
                reason: notes || "Rejected by user in approval card",
              },
            };

      setStreamedEvents((prev) => [...prev, syntheticEvent]);
    },
    [missionId, sourceType]
  );

  // Submit clarification response
  const submitClarification = useCallback((questionId: string, answer: string) => {
    console.log(`[Clarification API] Answer to ${questionId}:`, answer);
    const now = new Date().toISOString();
    const clarificationAnswerEvent: DevPilotEvent = {
      id: Date.now(),
      ts: now,
      type: "tool_result",
      agent: "shogun",
      data: {
        tool: "human_clarification",
        output: `User responded: "${answer}"`,
        verified: true,
      },
    };
    setStreamedEvents((prev) => [...prev, clarificationAnswerEvent]);
  }, []);

  // Add ad-hoc user instruction
  const addUserInstruction = useCallback((instruction: string) => {
    const now = new Date().toISOString();
    const event: DevPilotEvent = {
      id: Date.now(),
      ts: now,
      type: "clarification_requested",
      agent: "shogun",
      data: {
        questionId: `user-${Date.now()}`,
        question: `Operator instruction: ${instruction}`,
        context: "Direct user intervention from DevPilot timeline input.",
      },
    };
    setStreamedEvents((prev) => [...prev, event]);
  }, []);

  const currentEvent = streamedEvents[streamedEvents.length - 1] || null;
  const activeAgent = currentEvent?.agent || null;
  const missionState = reduceMissionState(streamedEvents);

  return {
    events: streamedEvents,
    allEvents,
    currentEvent,
    activeAgent,
    isPlaying,
    speed,
    isFinished,
    missionState,
    sourceType,
    play,
    pause,
    restart,
    step,
    setSpeed,
    postApproval,
    submitClarification,
    addUserInstruction,
  };
}
