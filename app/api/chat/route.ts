import { NextResponse } from "next/server";
import { initializeChatChain, getChatChain } from "@/app/utils/langchain";

// Initialize the chat chain when the API route is first loaded
const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
if (!apiKey) {
  throw new Error("GROQ_API_KEY is not set");
}
initializeChatChain(apiKey);

export async function POST(req: Request) {
  try {
    const { message, walletAddress, isConnected } = await req.json();
    const chain = getChatChain();

    // Add wallet context to the message if available
    const enhancedMessage = walletAddress
      ? `[Connected Wallet: ${walletAddress}] ${message}`
      : message;

    // Add connection status to the context
    const contextMessage = isConnected
      ? `[Wallet Status: Connected] ${enhancedMessage}`
      : `[Wallet Status: Not Connected] ${enhancedMessage}`;

    const response = await chain.call({
      input: contextMessage,
    });

    return NextResponse.json({ response: response.response });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
