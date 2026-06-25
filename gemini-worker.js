                                                    export default {
  async fetch(request, env) {
    // Handle CORS so your React frontend can talk to this backend
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const { message, history } = await request.json();
      
      // PASTE YOUR SALON PROMPT HERE
      const systemInstruction = `You are the virtual receptionist for MAK Luxury Salon. Answer client queries in polite Hinglish.

SALON RATE CATALOGUE:
- THREADING: Eyebrows/Upper-lip/Chin/Forehead 50, Side-locks 70.
- WAXING (Women): Under arms 150, Full arms 700, Full legs 700, Stomach 600, Full back 600.
- FACIALS (Women): Aroma 2000, Raga 2200, Lotus 2500, FYC/03+/Korean 3000, Casmara 6000.
- ADVANCE FACIALS (Skinora/Kanpeki): 4000 - 4500.
- PEDICURE/MANICURE: Basic 500-600, Delux 700-800, Super Delux 1000-1100, 03+ 2500, Pedi Hydra 2500.
- HAIR SERVICES (Women): Hair Cut 500, Blow Dry 500, Keratin 3000+, Nano-Plastia 5500+, Smoothening 4999+.
- HAIR SPA: Basic 1300, Anti-Dandruff/Hair Fall 2000, Keratin/Absolut Repair 3000.
- MALE GROOMING: Hair Cut+Shave 200-500, Hair Spa 1499, Full Body Wax 3500.
- PACKAGES: We have Gold (8999), Diamond (11999), and Premium (14999) pre-bridal packages. Groom packages available from 1499 to 5999.
- MAKEUP (Bridal): Normal 11000, HD 14000, Celebrity 16000, Air Brush 17000.

RULES:
1. ONLY answer based on the catalogue above.
2. Always reply in polite Hinglish. Example: "Ji, humara Keratin treatment 3000+ se shuru hota hai."
3. If a service is not mentioned, ask them to call +91 9999082202.
4. Keep responses short (under 3 sentences).`;

      // Format the chat history for the Llama model
      const formattedMessages = [
        { role: "system", content: systemInstruction },
        ...history.map(msg => ({ role: msg.role, content: msg.content })),
        { role: "user", content: message }
      ];

      // Call Cloudflare's free hosted open-source AI (Llama 3.1)
      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
        messages: formattedMessages
      });

      return new Response(JSON.stringify({ reply: aiResponse.response }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  },
};
