import { io, Socket } from "socket.io-client";
import { getApiUrl } from "../config/api";

export interface PhaseEvent {
  phase: string;
  description: string;
  progress: number;
  emoji: string;
  status: "in_progress" | "complete" | "error";
  timestamp: string;
}

export interface StreamChunk {
  type: "chunk" | "phase" | "complete" | "error";
  content?: string;
  phase?: PhaseEvent;
  error?: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private baseUrl: string | null;

  constructor() {
    this.baseUrl = getApiUrl();
  }

  connect(): Socket | null {
    if (!this.baseUrl) {
      console.warn("No backend URL configured, WebSocket disabled");
      return null;
    }

    if (this.socket?.connected) {
      return this.socket;
    }

    try {
      this.socket = io(`${this.baseUrl}/stream`, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on("connect", () => {
        console.log("✅ WebSocket connected");
      });

      this.socket.on("disconnect", () => {
        console.log("❌ WebSocket disconnected");
      });

      this.socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
      });

      return this.socket;
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  streamQuery(
    sessionId: string,
    input: string,
    onChunk: (chunk: string) => void,
    onPhase: (phase: PhaseEvent) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): void {
    const socket = this.connect();
    if (!socket) {
      onError("WebSocket not available");
      return;
    }

    // Register event listeners
    socket.on("stream_chunk", (data: { content: string }) => {
      onChunk(data.content);
    });

    socket.on("stream_phase", (phase: PhaseEvent) => {
      onPhase(phase);
    });

    socket.on("stream_complete", () => {
      onComplete();
    });

    socket.on("stream_error", (data: { error: string }) => {
      onError(data.error);
    });

    // Emit query
    socket.emit("query", { session_id: sessionId, input });
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.off("stream_chunk");
      this.socket.off("stream_phase");
      this.socket.off("stream_complete");
      this.socket.off("stream_error");
    }
  }
}

export const websocketService = new WebSocketService();
