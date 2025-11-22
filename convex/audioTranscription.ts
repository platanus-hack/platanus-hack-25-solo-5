"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { createGroq } from "@ai-sdk/groq";

export const transcribeAudio = internalAction({
  args: {
    phoneNumber: v.string(),
    audioUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ text: string }> => {
    console.log(`🎵 [transcribeAudio] START - phone: ${args.phoneNumber}`);
    console.log(`🔗 [transcribeAudio] Audio URL: ${args.audioUrl?.substring(0, 50)}...`);

    try {
      console.log('📥 [transcribeAudio] Fetching audio from URL...');
      const audioResponse = await fetch(args.audioUrl);

      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
      }

      const audioBlob = await audioResponse.blob();
      console.log(`✅ [transcribeAudio] Audio downloaded, size: ${audioBlob.size} bytes`);

      const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });

      const groq = createGroq({
        apiKey: process.env.GROQ_API_KEY,
      });

      console.log('🤖 [transcribeAudio] Calling Groq Whisper-large-v3-turbo...');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: (() => {
          const formData = new FormData();
          formData.append('file', audioFile);
          formData.append('model', 'whisper-large-v3-turbo');
          formData.append('language', 'es');
          formData.append('response_format', 'json');
          formData.append('temperature', '0.2');
          return formData;
        })(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [transcribeAudio] Groq API error:', errorText);
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const transcription = await response.json();
      console.log(`✅ [transcribeAudio] Transcription completed: "${transcription.text}"`);

      return {
        text: transcription.text,
      };

    } catch (error) {
      console.error('❌ [transcribeAudio] ERROR:', error);
      throw new Error(`Transcription failed: ${(error as Error).message}`);
    }
  },
});
