// app/api/chat/route.js

export async function POST(request) {
    const { messages } = await request.json();
    console.log("before")
    console.log(process.env.OPENAI_API_KEY)
    console.log("after")

    if (!messages || !Array.isArray(messages)) {
        return new Response(
            JSON.stringify({ message: 'Invalid request payload' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages,
            }),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error('OpenAI API Error:', errorDetails);
            return new Response(
                JSON.stringify({ message: 'Error communicating with OpenAI API.' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Server Error:', error.message);
        return new Response(
            JSON.stringify({ message: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
