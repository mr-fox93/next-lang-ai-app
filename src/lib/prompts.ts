export const getFlashcardsPrompt = (count: number, message: string) => {
  return `
Wygeneruj ${count} unikalnych i zróżnicowanych fiszek do nauki języka angielskiego w formacie JSON, bazując na poniższej informacji:
"${message}"

Wytyczne:
1. Fiszki muszą być ściśle związane z podanym tematem lub opisem sytuacji, niezależnie czy jest to pojedyncza kategoria (np. "wakacje") czy bardziej szczegółowy opis (np. "mam rozmowę kwalifikacyjną w korporacji jedzeniowej").
2. Każda fiszka powinna zawierać:
   - "origin_text": słowo lub fraza po angielsku,
   - "translate_text": tłumaczenie na język polski,
   - "example_using": przykładowe zdanie ilustrujące użycie danego słowa lub frazy w kontekście podanego tematu.
3. Zadbaj o to, aby:
   - Słowa i frazy były unikalne i nie powtarzały się,
   - Przykłady użycia były różnorodne oraz adekwatne do podanego kontekstu,
   - Unikać nadmiernie prostych lub oczywistych słów.
4.Format odpowiedzi musi być ściśle zgodny z poniższym wzorem, bez żadnych dodatkowych komentarzy ani tekstu:
{"flashcards": [{"origin_text": "przykładowe słowo", "translate_text": "przykładowe tłumaczenie", "example_using": "przykładowe zdanie"}]}


    `;
};
