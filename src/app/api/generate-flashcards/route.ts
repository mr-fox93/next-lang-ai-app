import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { count, message } = await req.json();

    if (!count || count <= 0) {
      return NextResponse.json(
        { error: "Liczba fiszek musi być większa niż 0" },
        { status: 400 }
      );
    }

    const prompt = `
      Wygeneruj ${count} fiszek do nauki angielskiego w formacie JSON.
      Fiszki powinny bazować na podanym przez użytkownika zdaniu: ${message}.
      Zdanie to może być np 'rozmowa rekrutacyjna' co oznacza, że fiszki powinny zawierać słowa związane z rozmową rekrutacyjną. Jej przebiegiem w korporacji. 
      Jeśli na przykład user wpisze 'zamawianie jedzenia' / 'wizyta w restauracji' to również fiszki powinny być związane z tematyką restauracji, jedzenia, zamawiania jedzenia.
      Chodzi kontakst, żeby fiszki były związane z tematem zdania.
        
      Każda fiszka powinna zawierać:
      - "origin_text": słowo lub frazę po angielsku
      - "translate_text": tłumaczenie na język polski
      - "example_using": przykład użycia w zdaniu

      Format odpowiedzi:
      [{"origin_text": "...", "translate_text": "...", "example_using": "..."}]
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: prompt }],
      //   response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500,
    });

    const parsedData = JSON.parse(response.choices[0].message.content || "[]");

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Błąd generowania fiszek:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas generowania fiszek" },
      { status: 500 }
    );
  }
}
