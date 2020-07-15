//const { router, telegram, text } = require('bottender/router');
const { router, telegram, text } = require('bottender/router')

function generateInlineKeyboard(table) {
    return {
        inlineKeyboard: table.map((row) =>
            row.map((cell) => ({
                text: cell,
                callbackData: cell,
            }))
        ),
    }
}

const mainMenu = {
    text: 'This is main menu, please click an option.',
    replyMarkup: generateInlineKeyboard([
        ['A', 'B'],
        ['C', 'D'],
    ]),
}

const submenuA = {
    text: 'This is submenu A.',
    replyMarkup: generateInlineKeyboard([['A1', 'A2'], ['A3', 'A4'], ['< back to main menu']]),
}

const submenuB = {
    text: 'This is submenu B.',
    replyMarkup: generateInlineKeyboard([['B1', 'B2'], ['B3', 'B4'], ['< back to main menu']]),
}

const submenuC = {
    text: 'This is submenu C.',
    replyMarkup: generateInlineKeyboard([['C1', 'C2'], ['C3', 'C4'], ['< back to main menu']]),
}

const submenuD = {
    text: 'This is submenu D.',
    replyMarkup: generateInlineKeyboard([['D1', 'D2'], ['D3', 'D4'], ['< back to main menu']]),
}

const menuMapping = {
    '< back to main menu': mainMenu,
    A: submenuA,
    B: submenuB,
    C: submenuC,
    D: submenuD,
}

async function DefaultAction(context) {
    //await context.sendText('Please type "show keyboard" to show the keyboard.');
    if (context.event.isText) {
        console.log('======test log=====', context.event.message)
        // const chat_id = '@gingerlive_channel';
        const {
            text,
            message_id,
            message: {
                chat: { id: chat_id },
            },
        } = context.event
        return await context.sendMessage(text, { chat_id })
    }
}

async function ShowKeyboard(context) {
    await context.sendText(mainMenu.text, { replyMarkup: mainMenu.replyMarkup })
}
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
async function AnswerKeyboard(context) {
    const callbackQuery = context.event.callbackQuery
    const messageId = callbackQuery.message.messageId
    const data = callbackQuery.data
    const menu = menuMapping[data]
    console.log(data, menu)
    if (menu) {
        await context.editMessageText(messageId, menu.text, {
            replyMarkup: menu.replyMarkup,
        })
    } else {
        await context.editMessageText(messageId, `Your final choice is ${data}.`)
    }
}

module.exports = async function App(context) {
    return router([
        text('show1', ShowKeyboard),
        text('show2', ShowKeyboard2),
        text(/[🍔🍕🌮🍱]/u, AnswerKeyboard2),
        telegram.callbackQuery(AnswerKeyboard),
        telegram.any(DefaultAction),
    ])
}
