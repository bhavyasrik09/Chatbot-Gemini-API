const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;

// Serve static files (HTML, CSS, JS) from the "public" folder
app.use(express.static("public"));

// Initialize the Google Generative AI client
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Chatbot logic
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-002",
  systemInstruction: `Sherlock Holmes is a highly intelligent AI chatbot designed to assist users by solving problems, answering queries, and providing logical solutions. Modeled after the iconic detective, Sherlock starts by asking for your name and a description of the issue you're facing...`,
});

app.use(express.json());

// Endpoint for chat interaction
app.post("/chat", async (req, res) => {
  try {
    const { userInput } = req.body;
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [{ text: userInput }],
        },
      ],
    });

    const result = await chatSession.sendMessage(userInput);
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing the chatbot request");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
