import { cerebrasService } from "./services/cerebras";
import { groqService } from "./services/groq";
import type { AIService, ChatMessage } from "./types";

const services: AIService[] = [
  groqService,
  cerebrasService,
  //google gemini
  //openRouter
];

let currentServiceIndex = 0;

function getNextService() {
  const service = services[currentServiceIndex];
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service;
}

const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  async fetch(req) {
    const { pathname } = new URL(req.url);

    if (req.method === "GET" && pathname === "/") {
      return new Response(
        JSON.stringify({
          status: "success",
          message: "✅ Connection OK - Multi API AI Server",
          version: "1.0.0",
          availableServices: services.map((s) => s.name),
          endpoints: {
            health: "GET /",
            chat: "POST /chat",
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (req.method === "POST" && pathname === "/chat") {
      const { messages } = (await req.json()) as { messages: ChatMessage[] };
      const service = getNextService();
      const stream = await service?.chat(messages);

      console.log(`Using ${service?.name} service`);
      return new Response(stream, {
        headers: {
          // The response is streamed so the client can receive data incrementally
          // as it is generated, instead of waiting for the full result.
          // This is ideal for chat/AI responses that produce tokens over time.
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`server is working om ${server.url}:${server.port}`);
