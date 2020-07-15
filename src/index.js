//const { router, telegram, text } = require('bottender/router');
const { router, telegram, text } = require('bottender/router')
const { StartAction, ShowKeyboard, AnswerKeyboard } = require('./inlineKeyboard.js')

async function ShowKeyboard2(context) {
    const replyMarkup = {
        keyboard: [
            [
                {
                    text: '🍔',
                },
                {
                    text: '🍕',
                },
            ],
            [
                {
                    text: '🌮',
                },
                {
                    text: '🍱',
                },
            ],
        ],
        oneTimeKeyboard: true,
    }
    await context.sendText('Which one is your favorite food?', { replyMarkup })
}
async function AnswerKeyboard2(context) {
    const replyMarkup = {
        removeKeyboard: true,
    }
    await context.sendText(`Your favorite food is ${context.event.text}.`, {
        replyMarkup,
    })
}

module.exports = async function App(context) {
    console.log('context')
    return router([
        // text('show1', ShowKeyboard),
        // text('show2', ShowKeyboard2),
        text(/\/start/, StartAction),
        text(/[🍔🍕🌮🍱]/u, AnswerKeyboard2),
        telegram.callbackQuery(AnswerKeyboard),
        // telegram.any(StartAction),
    ])
}
