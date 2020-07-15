const ruleText = require('../assets/note')
const dayNoteLists = require('../assets/daylist')
const { setDayNumber, getDayNumber } = require('./daySession')
function generateInlineKeyboard(table) {
    return {
        inlineKeyboard: table.map((row) =>
            row.map(({ text, data }) => ({
                text,
                callbackData: data,
            }))
        ),
    }
}

function generateInlineMenu(text, array) {
    return {
        text,
        replyMarkup: generateInlineKeyboard(array),
    }
}

const mainMenu = {
    text: `自主 21天 豐盛冥想

https://i.pinimg.com/564x/a4/08/26/a4082681e8bb82163c0c143cd0d61ca2.jpg`,
    replyMarkup: [
        [
            { text: '👀 規則說明', data: 'rule' },
            { text: '📝 開始練習', data: 'startWork' },
        ],
    ],
}

function getDayStartWork(event) {
    const dayNote = getDayNumber(event)
    const dayNumber = dayNote.day === 0 ? 1 : dayNote.day

    const replyMarkup = [
        [
            { text: '1) 冥想', data: `audioWork#${dayNumber}` },
            { text: '2) 金句', data: `todayWork#${dayNumber}` },
            { text: '3) 任務', data: `taskWork#${dayNumber}` },
        ],
        [
            { text: `Day ${dayNumber} done`, data: `doneWork#${dayNumber}` },
            { text: '< 返回', data: 'cancel' },
        ],
    ]
    const note = dayNoteLists[dayNumber]
    return { text: note.text, replyMarkup }
}

function doneDayWork(event) {
    setDayNumber(event)
    const [, day] = event.callbackQuery.data.split('#', 2)
    return {
        text: `⭐ ⭐ ⭐ 恭喜你~ 完成了第${day}天的練習 ⭐ ⭐ ⭐`,
        replyMarkup: [[{ text: `📝 進行 Day ${day + 1}`, data: `startDay#${day + 1}` }]],
    }
}

const submenuWork = {
    text: 'This is submenu B.',
    replyMarkup: generateInlineKeyboard([['B1', 'B2'], ['B3', 'B4'], ['< 返回']]),
}

const menuMapping = {
    cancel: mainMenu,
    rule: ruleText,
    // work: submenuWork,
}

async function StartAction(context) {
    await context.sendText(ruleText.text, {
        parseMode: 'markdown',
        replyMarkup: generateInlineKeyboard(ruleText.replyMarkup),
    })
}

// async function ShowKeyboard(context) {}

async function AnswerKeyboard(context) {
    const callbackQuery = context.event.callbackQuery
    const messageId = callbackQuery.message.messageId
    const data = callbackQuery.data
    let text = ''
    let replyMarkup = []

    if (data === 'startWork') {
        ;({ text, replyMarkup } = getDayStartWork(context.event))
    } else if (data === 'rule') {
        ;({ text, replyMarkup } = ruleText)
    } else if (data.match('Work#') != null) {
        if (data.match('doneWork') != null) {
            ;({ text } = doneDayWork(context.event))
        }
    }

    if (replyMarkup) {
        await context.editMessageText(messageId, text, {
            parseMode: 'markdown',
            replyMarkup: generateInlineKeyboard(replyMarkup),
        })
    } else if (text) {
        await context.editMessageText(messageId, text)
    }
}

module.exports = {
    generateInlineMenu,
    generateInlineKeyboard,
    StartAction,
    // ShowKeyboard,
    AnswerKeyboard,
}
