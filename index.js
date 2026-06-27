import OpenAI from "openai";
import readlinesync from "readline-sync";
const GROQ_API_KEY =
 'gsk_HMVL0WCgTwfCKiYVIuiaWGdyb3FYhVOTL2daE***********'

const client = new OpenAI({
    apiKey:GROQ_API_KEY,
    baseURL:"https://api.groq.com/openai/v1",
 });

function getWeatherDetails(city){
    if (city.toLowerCase() === 'bangalore') return '20°C';
    if (city.toLowerCase() === 'mumbai') return '31°C';
    if (city.toLowerCase() === 'delhi') return '35°C';
    if (city.toLowerCase() === 'chennai') return '33°C';
    if (city.toLowerCase() === 'hyderabad') return '29°C';
    if (city.toLowerCase() === 'kolkata') return '32°C';
    if (city.toLowerCase() === 'pune') return '27°C';
    if (city.toLowerCase() === 'jaipur') return '36°C';
}

const tools ={
    "getWeatherDetails": getWeatherDetails
}

const SYSTEM_PROMPT = `
You are an AI Assistant with START, PLAN, ACTION, Observation and Output State.
Wait for the user prompt and first PLAN usign available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action.
Once you get the observations, Return the AI response based on START prompt and observations

Strictly follow the JSON output format as in examples

Available Tools:
function getWeatherDetails (city: string): string
getWeatherDetails is a function that accepts city name as string and retuns the weather details

Example:
START 
{ "type": "user", "user": "What is the sum of weather of Banglore and Pune?" }
{ "type": "plan", "plan": "I will call the getWeatherDetails for Banglore" }
{ "type": "action", "function": "getWeatherDetails", "input": "bangalore" }
{ "type": "observation", "observation": "20°C" }
{ "type": "plan", "plan": "I will call getWeatherDetails for Pune" }
{ "type": "action", "function": "getWeatherDetails", "input": "pune" }
{ "type": "observation", "observation": "27°C" }
{ "type": "output", "output": "The sum of weather of Patiala and Mohali is 47°C }
`;

const messages = [{role:'system', content:SYSTEM_PROMPT}];

while (true){
    const query = readlinesync.question('>> ');
    const q = {
        type:'user',
        user: query,
    };
    messages.push({ role: 'user', content: JSON.stringify(q)});

    while (true) {
        const chat = await client.chat.completions.create({
          model: 'llama-3.3-70b-versatile',  
          messages: messages,
          response_format:{type: 'json_object'},
        });

    const result = chat.choices[0].message.content;
    messages.push({role: 'assistant', content: result});

    const call = JSON.parse(result)

    if (call.type == 'output') {
       console.log(`Bot: ${call.output}`);
       break;
    }else if (call.type =="action"){
        const fn= tools [call.function]
        const observation= fn(call.input)
        const obs = { "type": "observation", "observation": observation }
        messages.push({ role: "developer", content: JSON.stringify(obs) })
    }
    }
}