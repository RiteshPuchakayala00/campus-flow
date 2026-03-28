const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

router.post('/chat', auth, async (req, res) => {
    try {
        const { messages, apiKey } = req.body;

        // Priority: 
        // 1. Server-side .env key (Preferred for "Login" experience)
        // 2. Client-provided key (Fallback/Override)
        const geminiKey = process.env.GEMINI_API_KEY || apiKey;

        if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
            return res.status(401).json({
                error: 'No API key configured',
                message: 'Campus AI is not configured. Please contact the administrator or provide a Gemini API Key.'
            });
        }

        const ai = new GoogleGenAI(geminiKey);
        const model = ai.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "" // We will pass this in the content/prompt or use the newer syntax
        });

        // Fetch DB Context
        const [venues, bookings] = await Promise.all([
            Venue.find().select('name type capacity').lean(),
            Booking.find({ status: 'approved' })
                .populate('venue', 'name')
                .select('date startTime endTime purpose venue')
                .lean()
        ]);

        // Construct System Prompt
        const systemContext = `You are "Campus AI", the intelligent booking assistant for Campus Flow.
        
Your role is to help users find available venues, answer questions about bookings, and guide them. Keep your answers concise, friendly, and formatted neatly with emojis where appropriate.

CURRENT CONTEXT:
- Today: ${new Date().toLocaleDateString()}
- User: ${req.user.username} (${req.user.role})

VENUES:
${venues.map(v => `- ${v.name} (${v.type}, capacity: ${v.capacity})`).join('\n')}

APPROVED BOOKINGS (Occupied):
${bookings.map(b => `- ${b.venue?.name}: ${new Date(b.date).toLocaleDateString()} ${b.startTime}-${b.endTime} (${b.purpose})`).join('\n')}

If asked to book, guide them to the booking page. Do not perform bookings yourself.
`;

        // Format history for Gemini SDK
        const chat = model.startChat({
            history: messages.slice(0, -1).map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            })),
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        // Add system context to the final message or as a preamble
        const lastMsg = messages[messages.length - 1].text;
        const fullPrompt = `System Context: ${systemContext}\n\nUser Question: ${lastMsg}`;

        const result = await chat.sendMessage(fullPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (err) {
        console.error('AI Chat Error:', err);
        res.status(500).json({ error: 'AI Error', message: err.message || 'Failed to communicate with AI' });
    }
});

module.exports = router;
