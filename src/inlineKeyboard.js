const ruleText = require('../assets/note')
const dayNoteLists = require('../assets/daylist')
const { clearSession, setDayNumber, getDayNumber, setWorkItemDone } = require('./daySession')
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

function generateInlineMenu(data) {
    const result = {
        text: data.text,
        options: {
            parseMode: 'markdown',
        },
    }
    if (data.replyMarkup && data.replyMarkup[0].length !== 0) {
        result.options.replyMarkup = generateInlineKeyboard(data.replyMarkup)
    }
    return result
}

function getContextInfo(context) {
    const {
        callbackQuery: {
            from: { id: userId },
            data,
            message: {
                chat: { id: chatId },
                messageId,
                text: messageText,
                replyMarkup: { inlineKeyboard = [] },
            },
        },
    } = context.event

    let replyList = []
    if (inlineKeyboard.length > 0) {
        replyList = inlineKeyboard.map((item) => item.map((child) => ({ text: child.text, data: child.callbackData })))
    }

    const [workData, workDay = 1] = data.split('#', 2)
    const noteKey = workData.replace('Work', '').replace('Done', '')
    return {
        userId,
        chatId,
        work: data,
        workData,
        workDay,
        noteKey,
        messageId,
        messageText,
        replyMarkup: replyList,
    }
}

function getDayStartWork(context) {
    const dataInfo = getContextInfo(context)
    const { workDay } = dataInfo

    const replyMarkup = [
        [
            { text: '1) 冥想', data: `audioWork#${workDay}` },
            { text: '2) 金句', data: `todayWork#${workDay}` },
            { text: '3) 任務', data: `taskWork#${workDay}` },
        ],
    ]
    const note = dayNoteLists[workDay]
    const text = `⭐ Day {N} ${note.text}`.replace(/{N}/gi, workDay)
    return { text, replyMarkup, note, newPost: true }
}

// 開始當日單項任務
async function startDayItemWork(context) {
    let text, options
    const { note } = getDayStartWork(context)
    const contextData = getContextInfo(context)
    const {
        messageId,
        workDay,
        work,
        noteKey,
        replyMarkup: [list],
    } = contextData

    // 發一則新的內容是當前選擇的work
    ;({ text, options } = generateInlineMenu({
        text: note[noteKey],
        replyMarkup: [[{ text: '完成', data: `${noteKey}Done#${workDay}` }]],
    }))
    await context.sendText(text, options)

    // 將worklist 刪除當前選擇的work 更新內容
    let lastList = list.filter((item) => !item.data.includes(work))
    ;({ text, options } = generateInlineMenu({ text: note.text, replyMarkup: [lastList] }))
    await context.editMessageText(messageId, text, options)

    // update session
    setDayNumber(contextData)
}

async function doneDayWork(context, day) {
    const nextDay = Number(day) + 1
    let replyMarkup = [],
        options,
        text = `💯 恭喜你~ 完成了21天的豐盛冥想練習 💯`
    if (day > 21) {
        replyMarkup = [[{ text: `📝 進行 Day ${nextDay}`, data: `startWork#${nextDay}` }]]
        text = `⭐ ⭐ ⭐ 恭喜你~ 完成了第${day}天的練習 ⭐ ⭐ ⭐`
    }
    ;({ text, options } = generateInlineMenu({
        text,
        replyMarkup,
    }))
    await context.sendText(text, options)
}

// 完成當日單項任務
async function doneDayItemWork(context) {
    const contextData = getContextInfo(context)
    const { workData, workDay } = contextData

    // 將當前完成的work 移除button
    const doneListEmojio = {
        audioDone: '🔊 聽音檔、唸梵咒 -> done',
        todayDone: '🌟 寫下今日金句，並不斷提醒自己 -> done',
        taskDone: '📝 完成今天的任務 -> done',
    }
    const showNextDay = setWorkItemDone(contextData)
    if (showNextDay) {
        console.info('showNextDay', showNextDay)
        await doneDayWork(context, workDay)
    }
    // 發文恭喜完成workitem
    return doneListEmojio[workData]
    // 所有的item完成則完成當日work
}

async function StartAction(context) {
    clearSession(context.event.message.from.id)
    const { text, options } = generateInlineMenu(ruleText)
    console.info('text', text)
    await context.sendText(text, options)
}

async function AnswerKeyboard(context) {
    const { messageId, workData, messageText, work: data } = getContextInfo(context)

    let text, options
    let replyMarkup = null
    let newPost = false

    // 開始練習
    if (data.includes('startWork')) {
        // await context.editMessageText(messageId, messageText, {})
        ;({ text, replyMarkup, newPost } = getDayStartWork(context))
    } else if (data.includes('Work#')) {
        // 開始當日任務
        if (data.includes('doneWork')) {
            ;({ text } = doneDayWork(context.event))
        } else if (['audioWork', 'todayWork', 'taskWork'].includes(workData)) {
            // 開始當日單項任務
            startDayItemWork(context, messageId, data)
        }
    } else if (['audioDone', 'todayDone', 'taskDone'].includes(workData)) {
        // 完成當日單項任務
        text = await doneDayItemWork(context)
        console.info('1text', text)
    }

    if (replyMarkup) {
        ;({ text, options } = generateInlineMenu({ text, replyMarkup }))
        if (newPost) {
            await context.sendText(text, options)
        } else {
            await context.editMessageText(messageId, text, options)
        }
    } else if (text) {
        console.info('text', text)
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
