"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface BluffReceipt {
  id: string;
  category: string;
  severity: string;
  title: string;
  claimed_label: string;
  claimed_value: string;
  actual_label: string;
  actual_value: string;
  discrepancy: string;
  screenshot?: string | null;
  badge_color: "red" | "amber" | "purple";
}

export interface CounterStrikeData {
  script: string;
  audio_base64: string;
  savings: number;
  proposed_rate: number;
  original_rate: number;
  compilation_ms: number;
  total_bluffs: number;
}

export function useWiretapSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [isWarming, setIsWarming] = useState(false);
  const [stopwatch, setStopwatch] = useState(0.0);
  const [isCarrierSpeaking, setIsCarrierSpeaking] = useState(false);
  const [isCounterSpeaking, setIsCounterSpeaking] = useState(false);
  
  const [transcriptDeltas, setTranscriptDeltas] = useState<Array<{ word: string; entities: string[] }>>([]);
  const [partialTranscript, setPartialTranscript] = useState("");
  
  const [swarmLanes, setSwarmLanes] = useState<{
    lane1: {
      status: "STANDBY" | "HUNTING" | "VERIFIED";
      delta?: string;
      title?: string;
      spotLabel?: string;
      spotValue?: string;
      claimedLabel?: string;
      claimedValue?: string;
      markup?: string;
    };
    lane2: {
      status: "STANDBY" | "HUNTING" | "VERIFIED";
      summary?: string;
      title?: string;
      snapshotUrl?: string;
      targetUrl?: string;
    };
    lane3: { status: "STANDBY" | "HUNTING" | "VERIFIED"; streamUrl?: string };
  }>({
    lane1: { status: "STANDBY" },
    lane2: { status: "STANDBY" },
    lane3: { status: "STANDBY" },
  });

  const [bluffReceipts, setBluffReceipts] = useState<BluffReceipt[]>([]);
  const [counterStrike, setCounterStrike] = useState<CounterStrikeData | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const carrierAudioRef = useRef<HTMLAudioElement | null>(null);
  const counterAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Connect WebSocket
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    function connect() {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname || "localhost";
      const envWsUrl = process.env.NEXT_PUBLIC_WS_URL;
      const wsUrl = envWsUrl || `${protocol}//${host}:8000/ws/wiretap`;

      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleMessage(msg);
        } catch (err) {
          console.error("Failed to parse WS frame:", err);
        }
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((msg: any) => {
    switch (msg.type) {
      case "WIRETAP_STARTED":
        setIsIntercepting(true);
        setTranscriptDeltas([]);
        setPartialTranscript("");
        setBluffReceipts([]);
        setCounterStrike(null);
        setSwarmLanes({
          lane1: { status: "STANDBY" },
          lane2: { status: "STANDBY" },
          lane3: { status: "STANDBY" },
        });

        // Start stopwatch
        setStopwatch(0.0);
        if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        const startTime = Date.now();
        stopwatchIntervalRef.current = setInterval(() => {
          setStopwatch(Number(((Date.now() - startTime) / 1000).toFixed(2)));
        }, 50);
        break;

      case "AUDIO_STREAM_STARTED":
        if (msg.audio_base64) {
          try {
            const audio = new Audio(msg.audio_base64);
            carrierAudioRef.current = audio;
            setIsCarrierSpeaking(true);
            audio.onended = () => {
              setIsCarrierSpeaking(false);
            };
            audio.play().catch(() => {});
          } catch (e) {}
        }
        break;

      case "TRANSCRIPT_DELTA":
        setTranscriptDeltas((prev) => [...prev, { word: msg.word, entities: msg.entities || [] }]);
        setPartialTranscript(msg.partial_text || "");
        break;

      case "SWARM_DISPATCHED":
        setSwarmLanes((prev) => {
          if (msg.lane === 1) return { ...prev, lane1: { status: "HUNTING" } };
          if (msg.lane === 2) return { ...prev, lane2: { status: "HUNTING" } };
          if (msg.lane === 3) return { ...prev, lane3: { status: "HUNTING" } };
          return prev;
        });
        break;

      case "BROWSER_STREAM_URL":
        setSwarmLanes((prev) => ({
          ...prev,
          lane3: { ...prev.lane3, streamUrl: msg.url, status: "HUNTING" },
        }));
        break;

      case "BLUFF_RECEIPT_READY":
        const raw = msg.receipt || {};
        const normalizedReceipt: BluffReceipt = {
          id: raw.id || `receipt_${Date.now()}`,
          category: raw.category || "DISCREPANCY",
          severity: raw.severity || "HIGH",
          title: raw.title || "Fact-Check Receipt",
          claimed_label: raw.claimed_label || "WHAT WAS STATED",
          claimed_value: String(raw.claimed_value || raw.claimed || ""),
          actual_label: raw.actual_label || raw.truth_label || "VERIFIED TRUTH",
          actual_value: String(raw.actual_value || raw.truth || ""),
          discrepancy: String(raw.discrepancy || raw.variance || "Contradiction Detected"),
          screenshot: raw.screenshot || null,
          badge_color: raw.badge_color || "red",
        };
        setBluffReceipts((prev) => {
          const exists = prev.some((r) => r.id === normalizedReceipt.id);
          if (exists) return prev;
          return [...prev, normalizedReceipt];
        });
        // Transition only the targeted lane to VERIFIED based on receipt lane or category
        const targetLane = raw.lane || (raw.category === "FUEL_INDEX" ? 1 : raw.category === "WATCHLIST_IDENTITY" ? 3 : 2);
        setSwarmLanes((prev) => {
          if (targetLane === 1) return { ...prev, lane1: { ...prev.lane1, status: "VERIFIED" } };
          if (targetLane === 2) return { ...prev, lane2: { ...prev.lane2, status: "VERIFIED" } };
          if (targetLane === 3) return { ...prev, lane3: { ...prev.lane3, status: "VERIFIED" } };
          return prev;
        });
        break;

      case "SWARM_LANE_UPDATE":
        setSwarmLanes((prev) => {
          if (msg.lane === 2) {
            return {
              ...prev,
              lane2: {
                ...prev.lane2,
                status: msg.status || "VERIFIED",
                title: msg.title || prev.lane2.title,
                snapshotUrl: msg.snapshot_url || prev.lane2.snapshotUrl,
                targetUrl: msg.target_url || prev.lane2.targetUrl,
              },
            };
          }
          if (msg.lane === 3) {
            return {
              ...prev,
              lane3: {
                ...prev.lane3,
                status: msg.status || "VERIFIED",
                streamUrl: msg.stream_url || prev.lane3.streamUrl,
              },
            };
          }
          return {
            ...prev,
            lane1: {
              ...prev.lane1,
              status: msg.status || "VERIFIED",
              title: msg.title || prev.lane1.title,
              spotLabel: msg.spot_label || prev.lane1.spotLabel,
              spotValue: msg.spot_value || prev.lane1.spotValue,
              claimedLabel: msg.claimed_label || prev.lane1.claimedLabel,
              claimedValue: msg.claimed_value || prev.lane1.claimedValue,
              markup: msg.markup_badge || prev.lane1.markup,
            },
          };
        });
        break;

      case "COUNTER_AUDIO_READY":
        setCounterStrike({
          script: msg.script,
          audio_base64: msg.audio_base64,
          savings: msg.savings,
          proposed_rate: msg.proposed_rate,
          original_rate: msg.original_rate,
          compilation_ms: msg.compilation_ms,
          total_bluffs: msg.total_bluffs,
        });

        // Arm counter audio player in memory
        if (msg.audio_base64) {
          const audio = new Audio(msg.audio_base64);
          counterAudioRef.current = audio;
        }
        break;

      case "AUDIO_STREAM_FINISHED":
        setIsIntercepting(false);
        if (stopwatchIntervalRef.current) {
          clearInterval(stopwatchIntervalRef.current);
          stopwatchIntervalRef.current = null;
        }
        break;

      case "PREWARM_COMPLETE":
        setIsWarming(false);
        break;

      default:
        break;
    }
  }, []);

  const startWiretap = useCallback((mode: "inject" | "mic" = "inject") => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "START_WIRETAP", mode }));

      if (mode === "mic") {
        const SpeechRec =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          try {
            const recognition = new SpeechRec();
            recognitionRef.current = recognition;
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            setIsCarrierSpeaking(true);

            recognition.onresult = (event: any) => {
              let interimTranscript = "";
              let finalTranscript = "";

              for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                  finalTranscript += transcript + " ";
                } else {
                  interimTranscript += transcript;
                }
              }

              const combined = (finalTranscript + interimTranscript).trim();
              setPartialTranscript(combined);

              const words = combined.split(/\s+/).filter(Boolean);
              setTranscriptDeltas(
                words.map((w) => {
                  const isEntity =
                    /\$?\d+(\.\d{2})?/.test(w) ||
                    /MC[- ]?\d+/i.test(w) ||
                    /truck/i.test(w) ||
                    /diesel/i.test(w) ||
                    /spotless/i.test(w) ||
                    /brazil/i.test(w) ||
                    /usd|inr|rupee|dollar|currency|\b\d+\b/i.test(w);
                  return { word: w, entities: isEntity ? [w] : [] };
                })
              );

              if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(
                  JSON.stringify({
                    type: "LIVE_SPEECH_DELTA",
                    text: combined,
                    latest_word: words[words.length - 1] || "",
                  })
                );
              }
            };

            recognition.onerror = (event: any) => {
              console.warn("Speech recognition error:", event.error);
              setIsCarrierSpeaking(false);
            };

            recognition.onend = () => {
              setIsCarrierSpeaking(false);
              if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(
                  JSON.stringify({
                    type: "LIVE_SPEECH_FINISHED",
                  })
                );
              }
            };

            recognition.start();
          } catch (err) {
            console.error("Failed to start SpeechRecognition:", err);
            setIsCarrierSpeaking(false);
          }
        } else {
          alert("Web Speech API is not supported in this browser. Please use Chrome, Edge, or Arc.");
        }
      }
    }
  }, []);

  const prewarmSwarm = useCallback(() => {
    setIsWarming(true);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "PREWARM_REQUEST" }));
    }
  }, []);

  const playCounterAudio = useCallback(() => {
    // If audio is already loaded or in ref, play it
    if (counterAudioRef.current) {
      counterAudioRef.current.currentTime = 0;
      setIsCounterSpeaking(true);
      counterAudioRef.current.onended = () => {
        setIsCounterSpeaking(false);
      };
      counterAudioRef.current.play().catch((err) => {
        console.error("Audio playback error:", err);
        setIsCounterSpeaking(false);
      });
    } else {
      // Fallback direct URL playback
      const envBackend = process.env.NEXT_PUBLIC_BACKEND_URL;
      const host = typeof window !== "undefined" ? window.location.hostname || "localhost" : "localhost";
      const backendUrl = envBackend || `http://${host}:8000`;
      const audio = new Audio(`${backendUrl}/api/audio/counter.wav?t=${Date.now()}`);
      counterAudioRef.current = audio;
      setIsCounterSpeaking(true);
      audio.onended = () => {
        setIsCounterSpeaking(false);
      };
      audio.play().catch((err) => {
        console.error("Audio playback error:", err);
        setIsCounterSpeaking(false);
      });
    }
  }, []);

  const stopVoice = useCallback(() => {
    if (counterAudioRef.current) {
      counterAudioRef.current.pause();
      counterAudioRef.current.currentTime = 0;
    }
    if (carrierAudioRef.current) {
      carrierAudioRef.current.pause();
      carrierAudioRef.current.currentTime = 0;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsCounterSpeaking(false);
    setIsCarrierSpeaking(false);
  }, []);

  const verifyJudgeStatement = useCallback((statement: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "START_WIRETAP",
          mode: "judge_statement",
          statement,
        })
      );
    }
  }, []);

  return {
    isConnected,
    isIntercepting,
    isWarming,
    stopwatch,
    isCarrierSpeaking,
    isCounterSpeaking,
    transcriptDeltas,
    partialTranscript,
    swarmLanes,
    bluffReceipts,
    counterStrike,
    startWiretap,
    verifyJudgeStatement,
    prewarmSwarm,
    playCounterAudio,
    stopVoice,
  };
}
