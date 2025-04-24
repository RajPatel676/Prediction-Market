import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";
import fs from "fs";

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create a temporary file path
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `${uuidv4()}.mp3`);

    // Convert the file to a buffer and write to a temporary file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempFilePath, buffer);

    try {
      // Create a translation job using the path-based approach
      const translation = await groq.audio.translations.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-large-v3",
        response_format: "json",
        temperature: 0.0,
      });

      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);

      // Get the transcribed text
      const transcribedText = translation.text;

      return NextResponse.json({
        text: transcribedText,
      });
    } catch (error) {
      // Make sure to clean up even if there's an error
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error("Error cleaning up temporary file:", cleanupError);
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in audio route:", error);
    return NextResponse.json(
      { error: "Failed to process audio" },
      { status: 500 }
    );
  }
}
