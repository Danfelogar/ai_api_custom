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
  const nextServiceIndex = (currentServiceIndex + 1) % services.length;
  currentServiceIndex = nextServiceIndex;
  return services[nextServiceIndex];
}

const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  async fetch(req) {
    const { pathname } = new URL(req.url);

    if (req.method === "POST" && pathname === "/chat") {
      const { message } = (await req.json()) as { message: ChatMessage[] };
      const service = getNextService();
      const stream = await service?.chat(message);

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
