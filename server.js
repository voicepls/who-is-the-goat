const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { WebSocketServer } = require("ws");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
let port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const parsedUrl = parse(req.url, true);
    
    // Ignore Next.js internals / HMR
    if (parsedUrl.pathname.startsWith("/_next")) {
      return;
    }

    if (parsedUrl.pathname === "/api/votes/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
  });

  wss.on("connection", (ws) => {
    console.log("[WebSocket] Client connected");
    
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      console.log("[WebSocket] Client disconnected");
    });
  });

  // Keep-alive pings
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
  });

  // Register global broadcast function
  global.broadcastVotes = (data) => {
    const payload = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // 1 = OPEN
        client.send(payload);
      }
    });
  };

  // Port auto-fallback logic
  const startServer = (p) => {
    port = p;
    server.listen(p);
  };

  server.on("listening", () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`[Server] Port ${port} is already in use. Retrying on port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("[Server] Error:", err);
    }
  });

  startServer(port);
});
