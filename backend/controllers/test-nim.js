const { OpenAI } = require("openai");

const nim = new OpenAI({
  apiKey: "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", // 👈 paste your key here
  baseURL: "https://integrate.api.nvidia.com/v1",
});

async function test() {
  try {
    console.log("Testing NVIDIA NIM...");
    const response = await nim.chat.completions.create({
      model: "google/gemma-4-31b-it",
      messages: [{ role: "user", content: "Hello, are you working?" }],
      max_tokens: 20,
    });
    console.log("✅ SUCCESS! Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("❌ FAILED! Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

test();