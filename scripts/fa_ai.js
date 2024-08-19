/*
    AI function
*/
async function aiRewrite(original, prompt) {
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Organization': `${OPENAI_ORGANIZATION_ID}`,
            'OpenAI-Project': `${OPENAI_PROJECT_ID}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system", 
                    content: `
                        You are a support agent for an Shopify App platform.
                        You are about to rewrite the chat I provide based on the content I give you
                        Your job is to assist customers with any issues they encounter while using the platform, ensuring that responses are clear, empathetic, and solution-oriented
                        Always maintain a friendly and professional tone, and provide concise and actionable guidance, sometime funny
                        Don't make the message feel like bot, make it human
                        The prompt will include message to rewrite and the note when rewrite
                        If the note is empty, please ignore
                        Provide rewritten text only, don't include anything else
                    ` 
                },
                {
                    role: "user",
                    content: `
                        message to rewrite: ${original}.
                        note when rewrite: ${prompt}
                    `
                }
            ],
            temperature: 0.3
        })
    }

    // Send
    // Send the request and return the suggestion
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', request);
        const data = await response.json();

        const suggestion = data.choices[0].message.content;
        
        return suggestion;
    } catch (error) {
        return null;
    }
}