import { assertEquals } from "https://deno.land/std/assert/assert_equals.ts";
import { convertCSVToQuestionAnswers } from "../modules/csvParser.ts";

Deno.test(
  "convertCSVToQuestionAnswers should return an array of QuestionAnswer objects",
  async () => {
    const csvPath = "./data/test.csv"; // replace with the path to your test CSV file
    const expected: { question: string; answer: string }[] = [
      { question: "test question 1", answer: "test answer 1" },
      { question: "test question 2", answer: "test answer 2" },
      // add more expected results as needed
    ];

    const result = await convertCSVToQuestionAnswers(csvPath);

    assertEquals(result, expected);
  }
);

Deno.test(
  "convertCSVToQuestionAnswers should handle an empty CSV file",
  async () => {
    const csvPath = "./data/empty.csv"; // replace with the path to an empty CSV file
    const expected: { question: string; answer: string }[] = [];

    const result = await convertCSVToQuestionAnswers(csvPath);

    assertEquals(result, expected);
  }
);
