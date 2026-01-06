import { Groq } from "groq-sdk";
import type { AIService, ChatMessage } from "../types";

const groq = new Groq();

export const groqService: AIService = {
  name: "Groq",
  async chat(messages: ChatMessage[]) {
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "moonshotai/kimi-k2-instruct-0905",
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 1,
      stream: true,
      stop: null,
    });

    // function *: It is a generating function that allows the response fragment to be returned as it is generated or as the responses from the service arrive
    //yield allows us to return a rezsponse as we obtain it
    return (async function* () {
      for await (const chunk of chatCompletion) {
        yield chunk.choices[0]?.delta?.content || "";
      }
    })();
  },
};
