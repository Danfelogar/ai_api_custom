const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  async fetch(req) {
    return new Response("Bun API is running!");
  },
});

console.log(`server is working om ${server.url}:${server.port}`);
