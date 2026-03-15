import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Scenario {
  id: string;
  title: string;
  category: string;
  description: string;
  challenge: string;
  initialCode: string;
  language: "python" | "sql";
}

export interface Feedback {
  isCorrect: boolean;
  explanation: string;
  simulatedOutput: string;
  suggestions: string[];
}

export const CATEGORIES = [
  "BigQuery & SQL",
  "ETL with Pandas",
  "Airflow Orchestration",
  "Spark & PySpark",
  "Cloud Storage & Dataflow",
  "ML with PyTorch",
  "Docker & Containers"
];

export async function getFeedback(scenario: Scenario, userCode: string): Promise<Feedback> {
  const cacheKey = `feedback_${scenario.id}_${btoa(userCode).substring(0, 32)}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Scenario: ${scenario.title}
      Category: ${scenario.category}
      Challenge: ${scenario.challenge}
      User Code:
      \`\`\`${scenario.language}
      ${userCode}
      \`\`\`

      Evaluate the code. Provide feedback in JSON format.
      - isCorrect: boolean
      - explanation: brief explanation of why it's correct or what's wrong
      - simulatedOutput: what would be the result of running this (simulated)
      - suggestions: array of 2-3 tips for improvement or related concepts (e.g., optimization, best practices)
    `,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          explanation: { type: Type.STRING },
          simulatedOutput: { type: Type.STRING },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["isCorrect", "explanation", "simulatedOutput", "suggestions"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  localStorage.setItem(cacheKey, JSON.stringify(result));
  return result;
}

export const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: "bq-1",
    title: "BigQuery Partitioning",
    category: "BigQuery & SQL",
    description: "Optimize a large table query using partitioning.",
    challenge: "Write a SQL query to select all transactions from 'sales_table' for the year 2023, ensuring you use the 'transaction_date' partition column to minimize bytes scanned.",
    initialCode: "SELECT * FROM `project.dataset.sales_table` WHERE ...",
    language: "sql"
  },
  {
    id: "pandas-1",
    title: "Pandas Data Cleaning",
    category: "ETL with Pandas",
    description: "Clean a messy dataset with missing values.",
    challenge: "Given a DataFrame 'df' with columns ['id', 'price', 'category'], fill missing 'price' values with the mean price of their respective 'category'.",
    initialCode: "import pandas as pd\n\n# df is already loaded\n",
    language: "python"
  },
  {
    id: "airflow-1",
    title: "Airflow DAG Definition",
    category: "Airflow Orchestration",
    description: "Create a simple dependency chain.",
    challenge: "Define a DAG with two tasks: 'extract_data' and 'transform_data'. Set 'transform_data' to run only after 'extract_data' completes successfully.",
    initialCode: "from airflow import DAG\nfrom airflow.operators.python import PythonOperator\n\n# Define your tasks and dependencies here",
    language: "python"
  },
  {
    id: "pytorch-1",
    title: "PyTorch Tensor Operations",
    category: "ML with PyTorch",
    description: "Basic tensor manipulation and CUDA check.",
    challenge: "Create a random 3x3 tensor, check if CUDA is available, and move the tensor to GPU if it is.",
    initialCode: "import torch\n\n# Create and move tensor",
    language: "python"
  }
];
