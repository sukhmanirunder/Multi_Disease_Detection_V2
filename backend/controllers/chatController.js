const { OpenAI } = require("openai");
const axios = require("axios");
const Prediction = require("../models/Prediction");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// =========================================================
// DEMOGRAPHIC IMPUTATION LOGIC (For missing lab values)
// =========================================================
function fillMissingValues(features) {
  const { Age, Sex } = features;
  if (!Age || !Sex) return features;

  // 1. Establish Defaults (Standard Clinical Medians)
  let baseChol = 200;
  let baseBP = 120;
  let baseHR = 150;

  // 2. Use exact medians from your dataset (Females < 50)
  // 3. Use clinical rules for older patients (BP goes up, HR goes down)
  if (Sex === "F" && Age < 40) {
    baseChol = 182; baseBP = 110; baseHR = 170;
  } else if (Sex === "F" && Age >= 40 && Age < 50) {
    baseChol = 223; baseBP = 120; baseHR = 150; 
  } else if (Age >= 50 && Age < 60) {
    baseChol = 210; baseBP = 130; baseHR = 140;
  } else if (Age >= 60 && Age < 70) {
    baseChol = 195; baseBP = 140; baseHR = 130;
  } else if (Age >= 70) {
    baseChol = 180; baseBP = 145; baseHR = 120;
  }

  // Apply only if AI didn't get them from user
  if (!features.Cholesterol) features.Cholesterol = baseChol;
  if (!features.RestingBP) features.RestingBP = baseBP;
  if (!features.MaxHR) features.MaxHR = baseHR;
  
  // Defaults for other missing features
  if (!features.FastingBS) features.FastingBS = 0;
  if (!features.RestingECG) features.RestingECG = "Normal";
  if (!features.Oldpeak) features.Oldpeak = 0.0;
  if (!features.ST_Slope) features.ST_Slope = "Up";

  return features;
}

// Define the tools
const tools = [
  {
    type: "function",
    function: {
      name: "run_basic_prediction",
      description: "Run the diabetes prediction using ONLY basic features (no lab values). Use this if the user does NOT know their HbA1c or Glucose.",
      parameters: {
        type: "object",
        properties: {
          gender: { type: "string", enum: ["Male", "Female", "Other"] },
          age: { type: "number" },
          hypertension: { type: "number", enum: [0, 1], description: "0 = no, 1 = yes" },
          heart_disease: { type: "number", enum: [0, 1], description: "0 = no, 1 = yes" },
          smoking_history: { type: "string", enum: ["never", "former", "current", "ever", "not current"] },
          bmi: { type: "number" },
        },
        required: ["gender", "age", "hypertension", "heart_disease", "smoking_history", "bmi"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_complete_prediction",
      description: "Run the diabetes prediction using COMPLETE features (with lab values). Use this if the user KNOWS their HbA1c and Glucose.",
      parameters: {
        type: "object",
        properties: {
          gender: { type: "string", enum: ["Male", "Female", "Other"] },
          age: { type: "number" },
          hypertension: { type: "number", enum: [0, 1] },
          heart_disease: { type: "number", enum: [0, 1] },
          smoking_history: { type: "string", enum: ["never", "former", "current", "ever", "not current"] },
          bmi: { type: "number" },
          HbA1c_level: { type: "number" },
          blood_glucose_level: { type: "number" },
        },
        required: ["gender", "age", "hypertension", "heart_disease", "smoking_history", "bmi", "HbA1c_level", "blood_glucose_level"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_heart_prediction",
      description: "Run the heart disease prediction. Ensure all categorical values are mapped to the exact short codes.",
      parameters: {
        type: "object",
        properties: {
          Age: { type: "number" },
          Sex: { type: "string", enum: ["M", "F"] },
          ChestPainType: { 
            type: "string", 
            enum: ["ATA", "NAP", "ASY", "TA"], 
            description: "ATA = Atypical Angina, NAP = Non-Anginal, ASY = Asymptomatic, TA = Typical Angina" 
          },
          RestingBP: { type: "number" },
          Cholesterol: { type: "number" },
          FastingBS: { type: "number", enum: [0, 1] },
          RestingECG: { type: "string", enum: ["Normal", "ST", "LVH"] },
          MaxHR: { type: "number" },
          ExerciseAngina: { type: "string", enum: ["N", "Y"] },
          Oldpeak: { type: "number" },
          ST_Slope: { type: "string", enum: ["Up", "Flat", "Down"] },
        },
        required: ["Age", "Sex", "ChestPainType", "RestingBP", "Cholesterol", "FastingBS", "RestingECG", "MaxHR", "ExerciseAngina", "Oldpeak", "ST_Slope"],
      },
    },
  },
];

exports.handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    const messages = [
      {
        role: "system",
        content: `You are MediScan, a friendly and empathetic health assistant.

RULES:
1. If the user mentions chest pain or heart issues, use the "run_heart_prediction" tool.
2. You must collect all 11 features. Ask 1-2 questions at a time.
3. CRITICAL: The model only accepts specific short codes. You MUST map the user's answers to these codes:
   - Chest Pain: "TA" (typical), "ATA" (atypical), "NAP" (non-anginal), "ASY" (asymptomatic)
   - Sex: "M" (male) or "F" (female)
   - RestingECG: "Normal", "ST", "LVH"
   - ExerciseAngina: "Y" (yes) or "N" (no)
   - ST_Slope: "Up", "Flat", "Down"
4. Do NOT send full words for these categories. Use the codes above.
5. IMPUTATION RULE: If the user says "I don't know" for Cholesterol, RestingBP, or MaxHR, tell them: "That's perfectly fine. I will use the average medical values for someone of your age and gender." Then immediately call the "run_heart_prediction" tool anyway (our backend will fill in the missing numbers).
6. When giving advice after the prediction, focus on lifestyle (diet, exercise). Do not prescribe medicine.`,
      },
      ...history.map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text,
      })),
      { role: "user", content: message },
    ];

    // 1. Ask Groq
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      temperature: 0.5,
    });

    const responseMessage = response.choices[0].message;

    // 2. If the AI called a prediction tool
    if (responseMessage.tool_calls) {
      const toolCall = responseMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      
      // Extract features
      let features = JSON.parse(toolCall.function.arguments);
      
      let endpoint = "";
      let mode = "basic";
      let diseaseName = "Diabetes";

      // Route to the correct FastAPI endpoint
      if (functionName === "run_basic_prediction") {
        endpoint = "/predict/diabetes/basic";
        mode = "basic";
      } else if (functionName === "run_complete_prediction") {
        endpoint = "/predict/diabetes";
        mode = "complete";
      } else if (functionName === "run_heart_prediction") {
        endpoint = "/predict/heart";
        mode = "complete";
        diseaseName = "Heart Disease";
        
        // 🚨 APPLY IMPUTATION FOR HEART DISEASE HERE 🚨
        features = fillMissingValues(features);
      }

      // Call FastAPI
      const fastApiRes = await axios.post(`${ML_SERVICE_URL}${endpoint}`, features);
      const result = fastApiRes.data;

      // Save to MongoDB
      await Prediction.create({
        userId: req.user.userId,
        disease: diseaseName,
        mode: mode,
        symptoms: [history[0]?.text || "Chat"],
        inputData: features,
        prediction: Number(result.prediction),
        probability: result.probability,
        riskLevel: result.riskLevel,
        modelName: result.modelName,
        modelVersion: result.modelVersion,
      });

      // Ask AI for advice (STRICT FORMATTING)
      const adviceRes = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          ...messages,
          responseMessage,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          },
          {
            role: "user",
            content: `The user's risk is ${result.riskLevel}. 
            
            Write a short summary based on this result.
            Then, provide exactly 4 Lifestyle Recommendations.
            
            FORMATTING RULES:
            - Use bold headers (e.g., **Diet**, **Exercise**).
            - Use bullet points for the tips.
            - Keep each bullet point under 15 words.
            - Do NOT write long paragraphs.
            - Add a final one-sentence medical disclaimer.`
          }
        ],
      });

      return res.json({
        status: "complete",
        reply: adviceRes.choices[0].message.content,
        result: result,
      });
    }

    // 3. Normal chat
    return res.json({
      status: "chatting",
      reply: responseMessage.content,
    });

  } catch (error) {
    console.error("GROQ ERROR:", error.message);
    return res.status(500).json({ reply: "I'm having a little trouble connecting right now. Could you repeat that?" });
  }
};