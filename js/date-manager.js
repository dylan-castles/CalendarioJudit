
function parseSpanishDate(dateString) {
    const [day, month, year] = dateString.split("/").map(Number);
    return { day, month, year };
}

function parseTestTime(timeString) {
    const [hour, minute, second = 0] = timeString.split(":").map(Number);
    return { hour, minute, second };
}

function getMadridDateParts() {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: APP_CONFIG.TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    }).formatToParts(new Date());

    const get = type => Number(
        parts.find(part => part.type === type).value
    );

    return {
        day: get("day"),
        month: get("month"),
        year: get("year"),
        hour: get("hour"),
        minute: get("minute"),
        second: get("second")
    };
}

let simulatedStartTime = null;

function getCurrentDateParts() {
    const realDate = getMadridDateParts();

    // Sin fecha de prueba, usamos la fecha real.
    if (APP_CONFIG.TEST_DATE === null) {
        return realDate;
    }

    const testDate = parseSpanishDate(APP_CONFIG.TEST_DATE);

    // Si no hay hora de prueba, usamos la hora real.
    if (APP_CONFIG.TEST_TIME === null) {
        return { ...testDate, ...realDate };
    }

    // Guardamos el instante en el que empieza la simulación.
    if (simulatedStartTime === null) {
        simulatedStartTime = Date.now();
    }

    const initialTime = parseTestTime(APP_CONFIG.TEST_TIME);

    // Sumamos el tiempo transcurrido desde que cargamos la web.
    const elapsedSeconds = Math.floor(
        (Date.now() - simulatedStartTime) / 1000
    );

    const simulatedDate = new Date(Date.UTC(
        testDate.year,
        testDate.month - 1,
        testDate.day,
        initialTime.hour,
        initialTime.minute,
        initialTime.second + elapsedSeconds
    ));

    return {
        day: simulatedDate.getUTCDate(),
        month: simulatedDate.getUTCMonth() + 1,
        year: simulatedDate.getUTCFullYear(),
        hour: simulatedDate.getUTCHours(),
        minute: simulatedDate.getUTCMinutes(),
        second: simulatedDate.getUTCSeconds()
    };
}

function getDateKey(date) {
    return date.year * 10000 + date.month * 100 + date.day;
}

function getCurrentDateKey() {
    return getDateKey(getCurrentDateParts());
}

function getStartDateParts() {
    return parseSpanishDate(APP_CONFIG.START_DATE);
}

function isCalendarAvailable() {
    return getCurrentDateKey() >= getDateKey(getStartDateParts());
}

function getCurrentCalendarDay() {
    const today = getCurrentDateParts();
    const start = getStartDateParts();

    const todayTimestamp = Date.UTC(
        today.year, today.month - 1, today.day
    );

    const startTimestamp = Date.UTC(
        start.year, start.month - 1, start.day
    );

    return Math.floor(
        (todayTimestamp - startTimestamp) / 86400000
    ) + 1;
}

function getCountdownTime() {
    const today = getCurrentDateParts();
    const start = getStartDateParts();

    const currentTimestamp = Date.UTC(
        today.year,
        today.month - 1,
        today.day,
        today.hour,
        today.minute,
        today.second
    );

    const startTimestamp = Date.UTC(
        start.year,
        start.month - 1,
        start.day
    );

    return Math.max(0, startTimestamp - currentTimestamp);
}
