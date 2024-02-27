import { parse } from "https://deno.land/std@0.207.0/csv/mod.ts";

export async function convertCSVToQuestionAnswers(csvPath: string): Promise<
  {
    question: string;
    answer: string;
  }[]
> {
  const text = await Deno.readTextFile(csvPath);

  if (text.trim() === "") {
    return [];
  }

  const csvData = parse(text, {
    columns: ["questions", "answers"],
    skipFirstRow: true,
  });

  const data: { question: string; answer: string }[] = csvData.map(
    (row: Record<string, string>) => {
      return {
        question: row["questions"],
        answer: row["answers"],
      };
    }
  );

  return data;
}
