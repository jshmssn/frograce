import { useEffect, useRef, useState, useCallback } from "react";
import PartySocket from "partysocket";
import type { RoomState, ClientMessage, ServerMessage } from "../lib/types";

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST ?? "localhost:1999";

export function useRoom(roomId: string, playerId: React.MutableRefObject<string>) {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<PartySocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomId,
      id: playerId.current,
    });

    socketRef.current = socket;

    socket.addEventListener("open", () => setConnected(true));
    socket.addEventListener("close", () => setConnected(false));

    socket.addEventListener("message", (evt) => {
      try {
        const msg = JSON.parse(evt.data) as ServerMessage;
        if (msg.type === "state") {
          setRoomState(msg.state);
        }
      } catch {
        // ignore malformed
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
      setConnected(false);
      setRoomState(null);
    };
  }, [roomId]);

  const send = useCallback((msg: ClientMessage) => {
    socketRef.current?.send(JSON.stringify(msg));
  }, []);

  return { roomState, connected, send };
}
