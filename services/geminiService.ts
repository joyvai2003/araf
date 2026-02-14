
import { GoogleGenAI } from "@google/genai";
import { LiveEntry, Expense } from "../types";

export const getFinancialAdvice = async (liveEntries: LiveEntry[], expenses: Expense[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const incomeSummary = liveEntries.map(e => 
    `${e.date}: ${e.type} - ${e.amount} টাকা`
  ).join('\n');

  const expenseSummary = expenses.map(e => 
    `${e.date}: ${e.name} - ${e.amount} টাকা`
  ).join('\n');

  const prompt = `
    তুমি একজন প্রফেশনাল বিজনেস কনসালট্যান্ট। নিচের দোকানের আয় এবং ব্যয়ের তালিকা দেখে বাংলায় একটি সংক্ষিপ্ত পরামর্শ দাও।
    দোকানদারকে জানাও কোন খাতে আয় বাড়ছে আর কোথায় খরচ কমানো জরুরি। 

    আয় (ফটোকপি/প্রিন্ট):
    ${incomeSummary}

    ব্যয়:
    ${expenseSummary}

    উত্তরটি অবশ্যই পেশাদার বাংলা ভাষায় এবং পয়েন্ট আকারে দেবে।
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "দুঃখিত, কোনো পরামর্শ পাওয়া যায়নি।";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "এআই এর সাথে সংযোগ স্থাপন করা সম্ভব হচ্ছে না।";
  }
};
