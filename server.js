const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Allow requests from your frontend (widget.html opened via file:// or a local server)
app.use(cors({ origin: "*" }));
app.use(express.json());

// POST /api/chat — widget.html calls this instead of Groq directly
app.post("/api/chat", async (req, res) => {
  const { messages, model = "llama-3.3-70b-versatile" } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({ model, max_tokens: 300, messages }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Groq API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ DSU HelpBot backend running at http://localhost:${PORT}`);
});
