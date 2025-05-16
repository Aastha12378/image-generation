import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Ensure you have this environment variable set
  dangerouslyAllowBrowser: true, // Enable this option to allow usage in browser-like environments
});

export { openai };