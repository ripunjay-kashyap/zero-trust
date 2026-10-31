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
    lane1: { status: "STANDBY" | "HUNTING" | "VERIFIED"; delta?: string };
    lane2: { status: "STANDBY" | "HUNTING" | "VERIFIED"; summary?: string };
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
      const wsUrl = `${protocol}//${host}:8000/ws/wiretap`;

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
        setBluffReceipts((prev) => {
          const exists = prev.some((r) => r.id === msg.receipt.id);
          if (exists) return prev;
          return [...prev, msg.receipt];
        });
        // Transition lane to VERIFIED
        setSwarmLanes((prev) => ({
          lane1: { ...prev.lane1, status: "VERIFIED" },
          lane2: { ...prev.lane2, status: "VERIFIED" },
          lane3: { ...prev.lane3, status: "VERIFIED" },
        }));
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
                    /brazil/i.test(w);
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
      const host = typeof window !== "undefined" ? window.location.hostname || "localhost" : "localhost";
      const audio = new Audio(`http://${host}:8000/api/audio/counter.wav?t=${Date.now()}`);
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
    prewarmSwarm,
    playCounterAudio,
  };
}
