exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");

    if (!message || !message.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message is required" })
      };
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are Maddi, a friendly technical assistant specializing in Microsoft Copilot, Microsoft 365 Copilot, Copilot Studio, Power Automate, Power Apps, SharePoint, Teams, and related Microsoft technologies. Give clear, concise, step-by-step answers. If uncertain, say so."
            }]
          },
          contents: [{
            role: "user",
            parts: [{
              text: message
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error?.message || "Gemini request failed"
        })
      };
    }

    const answer =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    return {
      statusCode: 200,
      body: JSON.stringify({
        answer: answer || "I could not generate an answer."
      })
    };

  } catch (error) {
    console.error("Function error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Maddi could not process the request."
      })
    };
  }
};
