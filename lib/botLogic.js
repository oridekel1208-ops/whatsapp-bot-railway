// lib/botLogic.js
import { getBotByClientId, updateBotState } from './db.js';

/**
 * Process an incoming message from a user and determine the reply
 * @param {Object} params
 * @param {Object} params.client - The client object (from DB)
 * @param {string} params.phoneId - WhatsApp phone_number_id
 * @param {string} params.from - Sender WhatsApp number
 * @param {string} params.text - Incoming text
 */
export async function processIncomingMessage({ client, phoneId, from, text }) {
  if (!client) return "Sorry, bot not found.";

  // Get the bot for this client
  const bot = await getBotByClientId(client.id);
  if (!bot) return "Bot not configured yet.";

  const config = bot.config || {};
  const flows = config.flows || [];
  const userStates = config.userStates || {};
  const state = userStates[from] || { currentStep: 0 };

  const currentFlow = flows[state.currentStep];

  let reply = "";

  if (!currentFlow) {
    reply = config.welcome_message || "Hello! How can I help you?";
  } else {
    // Check possible answers
    if (currentFlow.answers && currentFlow.answers.length > 0) {
      // Match incoming text to an answer option
      const matched = currentFlow.answers.find(
        a => a.text && a.text.toLowerCase() === text?.toLowerCase()
      );

      if (matched) {
        reply = matched.reply || "Got it!";
      } else {
        // If no match and there's an open reply option
        const openAnswer = currentFlow.answers.find(a => !a.reply);
        if (openAnswer) {
          reply = openAnswer.text || "Thanks for your reply!";
        } else {
          reply = "Sorry, I didn't understand that.";
        }
      }
    } else {
      reply = currentFlow.question || "Next question?";
    }

    // Move to next step
    state.currentStep = Math.min(state.currentStep + 1, flows.length - 1);
  }

  // Save updated state
  await updateBotState(bot.id, from, state);

  return reply;
}
