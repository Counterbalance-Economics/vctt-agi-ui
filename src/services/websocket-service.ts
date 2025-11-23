
import { io, Socket } from 'socket.io-client';

/**
 * WebSocket Service - Phase 3 Full Autonomy
 * 
 * Real-time connection to execution gateway for live updates.
 */

class WebSocketService {
  private socket: Socket | null = null;
  private readonly baseUrl: string;
  private readonly namespace = '/execution';
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://vctt-agi-engine-3q3r.onrender.com';
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.socket?.connected) {
      console.log('🔌 WebSocket already connected');
      return this.socket;
    }

    const url = `${this.baseUrl}${this.namespace}`;
    console.log(`🔌 Connecting to WebSocket: ${url}`);

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    return this.socket;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 WebSocket disconnected');
    }
  }

  /**
   * Subscribe to goal execution updates
   */
  subscribeToGoal(goalId: number, callbacks: {
    onExecutionStarted?: (data: any) => void;
    onExecutionProgress?: (data: any) => void;
    onExecutionCompleted?: (data: any) => void;
    onExecutionError?: (data: any) => void;
    onActivity?: (data: any) => void;
  }) {
    if (!this.socket?.connected) {
      console.warn('⚠️  Socket not connected, connecting now...');
      this.connect();
    }

    // Subscribe to goal
    this.socket?.emit('subscribe_goal', goalId);

    // Register callbacks
    if (callbacks.onExecutionStarted) {
      this.socket?.on('execution_started', callbacks.onExecutionStarted);
    }
    if (callbacks.onExecutionProgress) {
      this.socket?.on('execution_progress', callbacks.onExecutionProgress);
    }
    if (callbacks.onExecutionCompleted) {
      this.socket?.on('execution_completed', callbacks.onExecutionCompleted);
    }
    if (callbacks.onExecutionError) {
      this.socket?.on('execution_error', callbacks.onExecutionError);
    }
    if (callbacks.onActivity) {
      this.socket?.on('activity', callbacks.onActivity);
    }

    console.log(`📡 Subscribed to goal ${goalId} execution updates`);
  }

  /**
   * Unsubscribe from goal execution updates
   */
  unsubscribeFromGoal(goalId: number) {
    this.socket?.emit('unsubscribe_goal', goalId);
    
    // Remove all listeners for this goal
    this.socket?.off('execution_started');
    this.socket?.off('execution_progress');
    this.socket?.off('execution_completed');
    this.socket?.off('execution_error');
    this.socket?.off('activity');

    console.log(`📡 Unsubscribed from goal ${goalId} execution updates`);
  }

  /**
   * Listen to system status updates
   */
  onSystemStatus(callback: (data: any) => void) {
    if (!this.socket?.connected) {
      this.connect();
    }

    this.socket?.on('system_status', callback);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
