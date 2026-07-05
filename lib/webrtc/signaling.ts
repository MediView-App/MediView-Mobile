/**
 * WebRTC 시그널링 클라이언트.
 * 백엔드 WebRtcSignalingHandler(/ws/webrtc/{roomId}) 프로토콜:
 *  - 송신: {"type":"offer|answer|ice-candidate","payload":{...}}
 *  - 수신: {"type":..., "senderId":..., "payload":{...}} 및
 *          {"type":"peer-joined|peer-left","peerId":...,"peerCount":n}
 */
export type SignalMessage = {
  type: string;
  senderId?: string;
  peerId?: string;
  peerCount?: number;
  payload?: unknown;
};

type Handler = (msg: SignalMessage) => void;

export class Signaling {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<Handler>>();
  private url: string;

  constructor(wsUrl: string, roomId: string, ticket: string | null) {
    const q = ticket ? `?ticket=${encodeURIComponent(ticket)}` : "";
    this.url = `${wsUrl}/ws/webrtc/${encodeURIComponent(roomId)}${q}`;
  }

  connect(onOpen?: () => void, onClose?: () => void, onError?: (e: unknown) => void) {
    const ws = new WebSocket(this.url);
    this.ws = ws;
    ws.onopen = () => onOpen?.();
    ws.onclose = () => onClose?.();
    ws.onerror = (e) => onError?.(e);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(String(event.data)) as SignalMessage;
        this.handlers.get(msg.type)?.forEach((h) => h(msg));
        this.handlers.get("*")?.forEach((h) => h(msg));
      } catch {
        // ignore malformed
      }
    };
  }

  on(type: string, handler: Handler) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }

  send(type: string, payload: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  close() {
    try {
      this.ws?.close();
    } catch {
      // ignore
    }
    this.ws = null;
    this.handlers.clear();
  }
}
