import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const { query } = await request.json();

    let text =
      "I want to see in what job I am good at so I can choose my career, here are the list of jobs and their states :\n";

    query.forEach(element => {
      text += `${element.answer[0].toUpperCase() + element.answer.slice(1)} at ${element.question}\n`;
    });

    text += `\nHERE IS THE EXACT TEMPLATE HOW YOUR RESPONSE HAS TO BE : 
"{
    "Data Scientist" : 78,
    "Customer Service Executive": 74
    "Software Developer": 54
}"

RESULT MUST BE IN THE FOLLOWING FORMAT { "PROFESSION": PERCENTAGE }, SHOW ONLY 3 OBJECTS IN RESPONSE WHICH ARE THE CLOSEST TO THE ANSWERS PROVIDED.
`;

    const data = await axios({
      method: "POST",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINIAI_KEY}`,
      data: { contents: [{ parts: [{ text }] }] },
    })

    const message = await data.data.candidates[0].content.parts[0].text;

    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
