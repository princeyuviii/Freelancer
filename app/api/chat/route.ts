import { GoogleGenerativeAI } from "@google/generative-ai";
import { StreamingTextResponse } from "ai";

export const runtime = 'edge';

async function tryGroqFallback(messages: any[], introPrompt: string) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set for fallback");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: introPrompt },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API Error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  return response.body;
}

function transformGroqStream(stream: ReadableStream) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream({
    async start(controller) {
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine === "data: [DONE]") continue;

            if (trimmedLine.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmedLine.slice(6));
                const content = data.choices[0]?.delta?.content || "";
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                console.error("Error parsing Groq SSE line:", trimmedLine, e);
              }
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const introPrompt = "You are a helpful and friendly AI assistant for a freelancing platform focused on helping beginners. Your goal is to assist users who are working on real projects by providing guidance, explanations, and suggestions whenever they are stuck. Provide answers in a short and concise way. If needed, you can also explain how they can approach mentors available on the platform. Always keep responses clear, supportive, and beginner-friendly.";

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: introPrompt,
    });

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));
    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error("Gemini failed, attempting Groq fallback...", error);
    
    try {
      if (process.env.GROQ_API_KEY) {
        const groqStream = await tryGroqFallback(messages, introPrompt);
        if (groqStream) {
          const transformedStream = transformGroqStream(groqStream);
          return new StreamingTextResponse(transformedStream);
        }
      }
    } catch (groqError) {
      console.error("Groq fallback also failed:", groqError);
    }

    return new Response("Service is currently overloaded. Please try again in a few seconds.", { status: 503 });
  }
}
