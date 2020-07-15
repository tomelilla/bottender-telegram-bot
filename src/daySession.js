const session = {}

function getUserData(event) {
    const callbackQuery = event.callbackQuery
    const userId = callbackQuery.from.id
    const messageId = callbackQuery.message.messageId
    const chatId = callbackQuery.message.chat.id
    return {
        userId,
        messageId,
        chatId,
    }
}

function getDayNumber(event) {
    const data = getUserData(event)
    if (session[data.userId]) {
        return session[data.userId]
    }
    return { ...data, day: 0 }
}

function setDayNumber(event) {
    const callbackQuery = event.callbackQuery
    const userId = callbackQuery.from.id
    const messageId = callbackQuery.message.messageId
    const chatId = callbackQuery.message.chat.id
    let day = 0
    let data = {
        userId,
        messageId,
        chatId,
    }
    if (session[userId]) {
        ;({ day } = getDayNumber(userId))
    }
    session[userId] = { ...data, day: day + 1 }
    // const key = Math.random().toString(36).substr(2, 10)
    // session[userId] = data
    // return data
}

module.exports = {
    setDayNumber,
    getDayNumber,
}
