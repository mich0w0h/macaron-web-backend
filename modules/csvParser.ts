import { parse } from "https://deno.land/std@0.207.0/csv/mod.ts";
import type { QuestionAnswer } from "../types/index.d.ts";

/**
 * This function converts a CSV file into an array of QuestionAnswer objects.
 *
 * @param csvPath - The path to the CSV file. The CSV file should have two columns: "質問" and "回答".
 *
 * @returns A Promise that resolves to an array of QuestionAnswer objects. Each object has a "question" property and an "answer" property.
 *
 * @example
 *
 * convertCSVToQuestionAnswers('path/to/file.csv')
 * .then(data => console.log(data))
 * .catch(err => console.error(err));
 *
 * The CSV file should be in the following format:
 * 質問,回答
 * "What is your name?","My name is John."
 * "Where do you live?","I live in New York."
 *
 * The output will be:
 * [
 *   { question: "What is your name?", answer: "My name is John." },
 *   { question: "Where do you live?", answer: "I live in New York." }
 * ]
 */
export async function convertCSVToQuestionAnswers(
  csvPath: string
): Promise<QuestionAnswer[]> {
  const text = await Deno.readTextFile(csvPath);

  if (text.trim() === "") {
    return [];
  }

  const csvData = parse(text, {
    columns: ["questions", "answers"],
    skipFirstRow: true,
  });

  const data: QuestionAnswer[] = csvData.map((row: Record<string, string>) => {
    return {
      question: row["questions"],
      answer: row["answers"],
    };
  });

  return data;
}
