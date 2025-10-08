// A simple stateful bot logic handler.
// You can later expand this for multiple bots and flows.

import { getBotByPhoneNumberId, updateBotState } from './db.js';

export async function processIncomingMessage({ client, phoneId, from, text }) {
  // 1. Load bot definition from DB (linked to phoneId)
  const bot = await getBotByPhoneNumberId(phoneId);
  if (!bot) {
    console.warn("No bot found for phone:", phoneId);
    return "Hi! Your message was received.";
  }

  // 2. Get or initialize user state
  let state = bot.userStates?.[from] || { step: 0 };
  const flow = bot.flow || [];

  // If new user
  if (state.step === 0) {
    const greeting = bot.firstStatement || "Hi! Let's get started.";
    state.step = 1;
    await updateBotState(bot.id, from, state);
    return greeting;
  }

  // 3. Find current question
  const currentQuestion = flow[state.step - 1];
  if (!currentQuestion) {
    return "Thanks for chatting!";
  }

  // 4. Validate answer
  const matchedAnswer = currentQuestion.answers?.find(
    a => a.text.toLowerCase() === text.toLowerCase()
  );

  if (matchedAnswer) {
    // Correct/recognized answer → move forward
    state.step++;
    await updateBotState(bot.id, from, state);

    const nextQuestion = flow[state.step - 1];
    return nextQuestion
      ? nextQuestion.question
      : "Thanks! That’s the end of this flow.";
  }

  // 5. If “open reply” type
  if (currentQuestion.allowOpenReply) {
    state.step++;
    await updateBotState(bot.id, from, state);

    const nextQuestion = flow[state.step - 1];
    return nextQuestion
      ? nextQuestion.question
      : "Thanks! That’s all for now.";
  }

  // 6. Unrecognized answer
  return "Sorry, I didn’t understand that. Please choose one of the options.";
}
