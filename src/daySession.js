const session = {}

function getUserData({ userId, messageId, chatId }) {
    return {
        userId,
        messageId,
        chatId,
    }
}

function getDayNumber(data) {
    if (session[data.userId]) {
        return session[data.userId]
    }
    return { ...data, day: 0 }
}

function setDayNumber(data) {
    const { userId } = data
    let workDone = []
    if (session[userId]) {
        ;({ workDone } = session[userId])
    }
    session[userId] = { ...data, workDone }
    console.info('session[userId]', session[userId])
}

function setWorkItemDone(data) {
    const { userId, workData } = data

    let checkFlag = false
    if (!session[userId]) {
        setDayNumber(data)
    }
    let { workDone, workDay } = session[userId]
    if (!workDone.includes(workData)) {
        workDone.push(workData)
    }
    checkFlag = workDone.length === 3
    if (checkFlag) {
        workDone = []
        workDay += 1
    }
    session[userId] = { ...session[userId], workDone, workDay }
    console.info('session[userId]', session[userId])
    return checkFlag
}

function clearSession(userId) {
    delete session[userId]
}

module.exports = {
    setDayNumber,
    getDayNumber,
    setWorkItemDone,
    clearSession,
}
