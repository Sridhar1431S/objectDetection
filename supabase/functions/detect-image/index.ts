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
    
    if (!image) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract base64 data from data URL
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Call Hugging Face free Inference API (DETR object detection - no API key needed)
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/detr-resnet-50',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: binaryData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HuggingFace API error:', errorText);
      return new Response(JSON.stringify({ error: 'Detection API failed', details: errorText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = await response.json();

    // HuggingFace DETR returns: [{ label, score, box: { xmin, ymin, xmax, ymax } }]
    const colors = [
      "hsl(150, 100%, 45%)", "hsl(45, 100%, 55%)", "hsl(200, 100%, 55%)",
      "hsl(340, 100%, 55%)", "hsl(0, 100%, 55%)", "hsl(270, 100%, 60%)",
      "hsl(30, 100%, 50%)", "hsl(180, 100%, 45%)", "hsl(60, 100%, 45%)",
      "hsl(300, 100%, 50%)",
    ];

    const detections = results.map((r: any, i: number) => ({
      id: i + 1,
      name: r.label,
      confidence: r.score,
      x: r.box.xmin,
      y: r.box.ymin,
      width: r.box.xmax - r.box.xmin,
      height: r.box.ymax - r.box.ymin,
      color: colors[i % colors.length],
    }));

    return new Response(JSON.stringify({ detections }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
