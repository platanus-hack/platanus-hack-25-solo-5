"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

export const getExerciseReferenceVideo: any = internalAction({
  args: {
    exercise: v.string(),
  },
  handler: async (ctx, args): Promise<{ videoUrl: string | null; videoTitle: string | null }> => {
    console.log('🎥 [getExerciseReferenceVideo] START', { exercise: args.exercise });

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('❌ [getExerciseReferenceVideo] GOOGLE_GENERATIVE_AI_API_KEY not configured');
      return { videoUrl: null, videoTitle: null };
    }

    const searchQuery = `${args.exercise} técnica correcta español`;
    console.log('🔍 [getExerciseReferenceVideo] Search query:', searchQuery);

    const youtubeApiUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    youtubeApiUrl.searchParams.append('part', 'snippet');
    youtubeApiUrl.searchParams.append('q', searchQuery);
    youtubeApiUrl.searchParams.append('type', 'video');
    youtubeApiUrl.searchParams.append('maxResults', '1');
    youtubeApiUrl.searchParams.append('regionCode', 'ES');
    youtubeApiUrl.searchParams.append('relevanceLanguage', 'es');
    youtubeApiUrl.searchParams.append('videoDuration', 'medium');
    youtubeApiUrl.searchParams.append('order', 'relevance');
    youtubeApiUrl.searchParams.append('key', process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    try {
      console.log('📡 [getExerciseReferenceVideo] Calling YouTube API...');
      const response = await fetch(youtubeApiUrl.toString());

      if (!response.ok) {
        console.error('❌ [getExerciseReferenceVideo] YouTube API error:', response.status, await response.text());
        return { videoUrl: null, videoTitle: null };
      }

      const data: any = await response.json();
      console.log('✅ [getExerciseReferenceVideo] YouTube API response:', JSON.stringify(data, null, 2).substring(0, 500));

      if (!data.items || data.items.length === 0) {
        console.warn('⚠️ [getExerciseReferenceVideo] No videos found for:', searchQuery);
        return { videoUrl: null, videoTitle: null };
      }

      const bestVideo = data.items[0];
      const videoId = bestVideo.id.videoId;
      const videoTitle = bestVideo.snippet.title;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      console.log('✅ [getExerciseReferenceVideo] Found video:', { videoUrl, videoTitle });

      return {
        videoUrl,
        videoTitle,
      };
    } catch (error) {
      console.error('❌ [getExerciseReferenceVideo] ERROR:', error);
      return { videoUrl: null, videoTitle: null };
    }
  },
});
