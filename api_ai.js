// Vercel Serverless Function - API Key SECURIZAT
// API Key-ul se pune în Vercel Dashboard → Settings → Environment Variables → OPENAI_API_KEY

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, prompt, messages } = req.body;

    // API Key din Environment Variables (SECURIZAT!)
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'API Key not configured. Add OPENAI_API_KEY in Vercel Dashboard.' });
    }

    try {
        let systemPrompt = '';
        let userPrompt = prompt;

        switch (action) {
            case 'chat':
                systemPrompt = `You are DigitalPulse AI Assistant, a helpful expert on making money online, AI tools, side hustles, freelancing, investing, and productivity. 
                
Rules:
- Be friendly, helpful, and conversational
- Give practical, actionable advice
- Use emojis occasionally to be engaging
- Keep responses concise but informative
- If asked about illegal activities, politely decline
- Recommend DigitalPulse articles when relevant`;
                break;

            case 'generate-article':
                systemPrompt = `You are an expert SEO content writer for DigitalPulse, a top blog about making money online. 

Write a comprehensive, SEO-optimized article with:
- Engaging title with numbers/power words
- Meta description (150-160 chars)
- Introduction hook
- H2 subheadings with keywords
- Bullet points and numbered lists
- Actionable tips
- Internal linking suggestions
- Call to action at the end
- 1500+ words

Format the response as JSON:
{
    "title": "...",
    "metaDescription": "...",
    "category": "money|ai|sidehustle|freelancing|investing|productivity",
    "readTime": 10,
    "content": "<h2>...</h2><p>...</p>..."
}`;
                break;

            case 'summarize':
                systemPrompt = `Summarize the following content in 2-3 concise bullet points. Be clear and informative.`;
                break;

            case 'improve-seo':
                systemPrompt = `You are an SEO expert. Analyze and improve the following content for better search rankings. Suggest:
- Better title with keywords
- Improved meta description
- Additional keywords to include
- Content structure improvements
- Internal/external linking opportunities`;
                break;

            case 'generate-ideas':
                systemPrompt = `You are a content strategist for a blog about making money online, AI, side hustles, freelancing, investing, and productivity.

Generate 10 unique, trending article ideas that would rank well on Google in 2024-2025. For each idea provide:
1. Catchy title with numbers/power words
2. Target keyword
3. Search intent
4. Brief outline (3-4 points)

Format as a numbered list.`;
                break;

            case 'translate':
                systemPrompt = `Translate the following content to the requested language while maintaining SEO optimization and natural flow. Keep formatting intact.`;
                break;

            default:
                systemPrompt = 'You are a helpful assistant for DigitalPulse blog.';
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Cost-effective and powerful
                messages: messages || [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: 4000,
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        return res.status(200).json({
            success: true,
            response: data.choices[0].message.content,
            usage: data.usage
        });

    } catch (error) {
        console.error('OpenAI API Error:', error);
        return res.status(500).json({ error: 'Failed to process request' });
    }
}
