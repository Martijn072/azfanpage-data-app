import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'nl-NL-Standard-B', speed = 0.9 } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const apiKey = Deno.env.get('GOOGLE_TTS_API_KEY');
    if (!apiKey) {
      throw new Error('Google TTS API key not configured');
    }

    console.log('🔊 TTS Request:', {
      textLength: text.length,
      voice,
      speed,
      timestamp: new Date().toISOString()
    });

    // Clean HTML from text
    const cleanText = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Split into chunks if text is too long (Google TTS has 5000 character limit)
    const maxChars = 4500;
    const chunks = [];
    
    if (cleanText.length <= maxChars) {
      chunks.push(cleanText);
    } else {
      // Split by sentences to maintain natural breaks
      const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim());
      let currentChunk = '';
      
      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChars && currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? '. ' : '') + sentence;
        }
      }
      
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
    }

    console.log(`📝 Split text into ${chunks.length} chunks`);

    // Generate audio for each chunk
    const audioChunks = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`🎵 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);

      const ttsResponse = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { text: chunk },
            voice: {
              languageCode: voice.substring(0, 5), // nl-NL
              name: voice,
              ssmlGender: 'MALE',
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: speed,
              pitch: -3.0,
              volumeGainDb: 0,
              sampleRateHertz: 24000,
            },
          }),
        }
      );

      if (!ttsResponse.ok) {
        const error = await ttsResponse.text();
        console.error(`❌ TTS API Error for chunk ${i + 1}:`, error);
        throw new Error(`TTS API error: ${error}`);
      }

      const ttsData = await ttsResponse.json();
      audioChunks.push(ttsData.audioContent);
    }

    console.log(`✅ Generated ${audioChunks.length} audio chunks`);

    // Return audio data and metadata
    return new Response(
      JSON.stringify({
        success: true,
        audioChunks,
        totalChunks: chunks.length,
        characterCount: cleanText.length,
        voice,
        speed
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );

  } catch (error) {
    console.error('❌ TTS Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});