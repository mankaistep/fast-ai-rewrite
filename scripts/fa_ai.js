/*
    AI function
*/
async function aiRewrite(original, prompt, agentId) {
    let agent = AGENTS.find(a => a.id == agentId);

    const content = agent.content;

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
                    content: `${content}` 
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
        const sentAt = Date.now();
        const response = await fetch('https://api.openai.com/v1/chat/completions', request);
        const data = await response.json();
        const receivedAt = Date.now();

        const suggestion = data.choices[0].message.content;

        console.log(`[FastAI Rewrite] <${agent.name}> + <${prompt}> + <${original}> => <<${suggestion}>>`)
        console.log(`[FastAI Rewrite] Took ${receivedAt - sentAt}ms`)
        
        return suggestion;
    } catch (error) {
        console.log(error);
        return "Duma sorry :( some errors happened!";
    }
}