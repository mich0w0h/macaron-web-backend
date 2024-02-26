import { ChatOpenAI } from "npm:@langchain/openai";
import { RunInput } from "npm:@langchain/core";
import {
  FewShotPromptTemplate,
  PromptTemplate,
} from "npm:@langchain/core/prompts";
import { StringOutputParser } from "npm:@langchain/core/output_parsers";
import { convertCSVToQuestionAnswers } from "./csvParser.ts";
import { containsKanji } from "./characterChecker.ts";
import { QuestionAnswer } from "../types/index.d.ts";

// Create reusable objects
const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  maxTokens: 50,
});

const outputParser = new StringOutputParser();

const characterQuestionAnswers = await convertCSVToQuestionAnswers(
  "./data/line_examples.csv"
);

function createFewShotTemplate(
  examples: QuestionAnswer[],
  prefix: string
): FewShotPromptTemplate {
  const examplePrompt = new PromptTemplate({
    template: "質問: {question}\n{answer}",
    inputVariables: ["question", "answer"],
  });
  const suffix = "質問： {commentText}";

  const fewShotTemplate = new FewShotPromptTemplate({
    examples,
    examplePrompt,
    prefix: prefix,
    suffix: suffix,
    inputVariables: ["commentText"],
  });

  return fewShotTemplate;
}

function createPromptToConvertKanji(): FewShotPromptTemplate {
  const examples = [
    { input: "私は猫が好きです。", output: "わたしはねこがすきです。" },
    {
      input: "私はお金が欲しいです。",
      output: "わたしはおかねがほしいです。",
    },
    // カタカナはそのままにする
    {
      input: "私はスイカが好きです。",
      output: "わたしはスイカがすきです。",
    },
    { input: "名前はマカロンだよ！", output: "なまえはマカロンだよ！" },
    {
      input: "マカロンの誕生日はいつだ！",
      output: "マカロンのたんじょうびはいつだ！",
    },
  ];

  const examplePrompt = new PromptTemplate({
    template: "入力：{input}\n出力：{output}",
    inputVariables: ["input", "output"],
  });

  const fewShotPrompt = new FewShotPromptTemplate({
    examples,
    examplePrompt,
    prefix:
      "次の文章の漢字をひらがなに変換してください。カタカナは変換しないでカタカナのまま出力してください。",
    suffix: "入力：{input_string}\n出力：",
    inputVariables: ["input_string"],
  });

  return fewShotPrompt;
}

async function invokeFewShot(
  promptTemplate: FewShotPromptTemplate,
  chainInput: RunInput
): Promise<string> {
  const chain = promptTemplate.pipe(model).pipe(outputParser);
  const stringResult = (await chain.invoke(chainInput)) as string;

  console.log("[LangChain] response generated: ", stringResult);

  return stringResult;
}

export async function generateLLMResponse(
  commentText: string
): Promise<string> {
  const prefix = `入力された質問に対し、マカロンというキャラクターの返答を生成してください。
  マカロンは世間知らずなキャラクターで、一人称は「マカロン」です。
  返答は10文字以内で作成してください。話し方の例はこんな感じです：`;

  const promptTemplate = createFewShotTemplate(
    characterQuestionAnswers,
    prefix
  );

  let stringResult: string = await invokeFewShot(promptTemplate, {
    commentText: commentText,
  });

  if (containsKanji(stringResult)) {
    const kanjiConversionPrompt = createPromptToConvertKanji();
    stringResult = await invokeFewShot(kanjiConversionPrompt, {
      input_string: stringResult,
    });
  }

  return stringResult;
}
