import { io, Socket } from "socket.io-client";

const socket: Socket = io(import.meta.env.VITE_SERVER_URL, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;