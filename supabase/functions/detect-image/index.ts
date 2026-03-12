import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image || typeof image !== 'string' || !image.startsWith('data:image')) {
      return new Response(JSON.stringify({ error: 'No valid image data URL provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an object detection model. Given an image, identify all visible objects and estimate their bounding box coordinates in pixels relative to the image dimensions.

Return ONLY a valid JSON array (no markdown, no explanation). Each element must have:
- "label": string (object class name, lowercase)
- "score": number between 0 and 1 (your confidence)
- "box": { "xmin": number, "ymin": number, "xmax": number, "ymax": number }

Coordinates should be pixel values assuming the image's natural resolution. Be thorough - detect all distinct objects including people, animals, vehicles, furniture, food, electronics, etc. Only include objects with confidence >= 0.3.

IMPORTANT: Return valid JSON only. Do not duplicate keys. Each object must have exactly one "label", one "score", and one "box".

Example output:
[{"label":"cat","score":0.95,"box":{"xmin":50,"ymin":100,"xmax":300,"ymax":400}},{"label":"chair","score":0.7,"box":{"xmin":400,"ymin":200,"xmax":600,"ymax":500}}]`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: image }
              },
              {
                type: 'text',
                text: 'Detect all objects in this image. Return only the JSON array.'
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Detection API failed', details: `AI returned HTTP ${response.status}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';
    console.log('AI raw response:', content.substring(0, 500));

    // Parse the JSON from the response
    let parsed;
    try {
      // Strip markdown code fences
      let cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Fix malformed duplicate key patterns like "label": "label": "value" → "label": "value"
      cleaned = cleaned.replace(/"(\w+)":\s*"(\w+)":\s*/g, (_match: string, key1: string, key2: string) => {
        // If key1 === key2 it's a duplicate key bug from the model
        if (key1 === key2) return `"${key1}": `;
        // Otherwise it might be a real value followed by a colon (also malformed), try to keep second
        return `"${key1}": `;
      });

      // Remove any trailing commas before ] or }
      cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

      // Fix stray numbers not in key-value context (e.g. "ymin": 218, 490,)
      cleaned = cleaned.replace(/:\s*(\d+)\s*,\s*(\d+)\s*,/g, ': $1,');

      try {
        parsed = JSON.parse(cleaned);
      } catch {
        // Try to salvage complete objects
        const lastBrace = cleaned.lastIndexOf('}');
        if (lastBrace > 0) {
          let truncated = cleaned.substring(0, lastBrace + 1);
          if (!truncated.endsWith(']')) {
            truncated = truncated + ']';
          }
          parsed = JSON.parse(truncated);
        } else {
          throw new Error('No complete objects found');
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Failed to parse AI response:', msg, content.substring(0, 300));
      return new Response(JSON.stringify({ error: 'Could not parse detection results', raw: content.substring(0, 200) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const colors = [
      "hsl(150, 100%, 45%)", "hsl(45, 100%, 55%)", "hsl(200, 100%, 55%)",
      "hsl(340, 100%, 55%)", "hsl(0, 100%, 55%)", "hsl(270, 100%, 60%)",
      "hsl(30, 100%, 50%)", "hsl(180, 100%, 45%)", "hsl(60, 100%, 45%)",
      "hsl(300, 100%, 50%)",
    ];

    const detections = Array.isArray(parsed) ? parsed
      .filter((r: Record<string, unknown>) => r.label && r.score && r.box)
      .map((r: Record<string, unknown>, i: number) => {
        const box = r.box as Record<string, number>;
        return {
          id: i + 1,
          name: r.label as string,
          confidence: r.score as number,
          x: box.xmin,
          y: box.ymin,
          width: box.xmax - box.xmin,
          height: box.ymax - box.ymin,
          color: colors[i % colors.length],
        };
      }) : [];

    return new Response(JSON.stringify({ detections }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
