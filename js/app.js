
function showCorrectScreen() {
    const beforeStartScreen = document.querySelector(".screen-before-start");
    const calendarScreen = document.querySelector(".screen-calendar");

    if (!beforeStartScreen || !calendarScreen) {
        console.error("No se han encontrado las dos pantallas.");
        return;
    }

    const calendarAvailable = isCalendarAvailable();

    beforeStartScreen.hidden = calendarAvailable;
    calendarScreen.hidden = !calendarAvailable;

    if (calendarAvailable) {
        markCurrentCalendarDay();
    }
}

function updateCountdown() {
    const countdown = getCountdownTime();

    if (countdown <= 0) {
        showCorrectScreen();
        return;
    }

    const days = Math.floor(countdown / 86400000);
    const hours = Math.floor((countdown % 86400000) / 3600000);
    const minutes = Math.floor((countdown % 3600000) / 60000);
    const seconds = Math.floor((countdown % 60000) / 1000);

    document.getElementById("countdown-days").textContent =
        String(days).padStart(2, "0");

    document.getElementById("countdown-hours").textContent =
        String(hours).padStart(2, "0");

    document.getElementById("countdown-minutes").textContent =
        String(minutes).padStart(2, "0");

    document.getElementById("countdown-seconds").textContent =
        String(seconds).padStart(2, "0");
}

function markCurrentCalendarDay() {
    const currentDay = getCurrentCalendarDay();

    document.querySelectorAll(".calendar-day").forEach(day => {
        day.classList.remove("is-today");
    });

    const todayElement = document.querySelector(
        `.calendar-day[data-day="${currentDay}"]`
    );

    if (todayElement && currentDay >= 1 && currentDay <= 25) {
        todayElement.classList.add("is-today");
    }
}



function openDay(dayNumber) {
    const calendarScreen = document.querySelector(".screen-calendar");
    const dayScreen = document.querySelector(".screen-day");
    const dayNumberElement = document.getElementById("selected-day-number");

    if (!calendarScreen || !dayScreen || !dayNumberElement) {
        console.error("No se ha encontrado la pantalla del día.");
        return;
    }

    dayNumberElement.textContent = dayNumber;

    // Cargar la imagen correspondiente a cada día
    const clueImage = document.getElementById("clue-image");

    if (dayNumber >= 1 && dayNumber <= 24) {
        const imageNumber = String(dayNumber).padStart(2, "0");

        clueImage.src = `assets/images/clues/pista-${imageNumber}.png`;
        clueImage.alt = `Pista del día ${dayNumber}`;
    }

    calendarScreen.hidden = true;
    dayScreen.hidden = false;

    // Ocultar el resultado de un escaneo anterior
    const qrResult = document.getElementById("qr-result");

    if (qrResult) {
        qrResult.hidden = true;
        qrResult.textContent = "";
    }
}



function returnToCalendar() {
    const calendarScreen = document.querySelector(".screen-calendar");
    const dayScreen = document.querySelector(".screen-day");

    dayScreen.hidden = true;
    calendarScreen.hidden = false;

    markCurrentCalendarDay();
}


function initializeDayNavigation() {
    // Seleccionamos todas las casillas del calendario.
    const calendarDays = document.querySelectorAll(".calendar-day");

    calendarDays.forEach(day => {
        day.addEventListener("click", () => {
            const dayNumber = Number(day.dataset.day);

            if (!dayNumber) return;

            // Por ahora no abrimos los días bloqueados.
            if (
                day.classList.contains("is-locked") &&
                !day.classList.contains("is-today")
            ) {
                return;
            }

            openDay(dayNumber);
        });
    });

    // Conectamos el botón de volver.
    const backButton = document.getElementById("back-to-calendar");

    if (backButton) {
        backButton.addEventListener("click", returnToCalendar);
    }

    const scanButton = document.getElementById("scan-button");
    const closeScannerButton = document.getElementById("close-scanner");

    if (scanButton) {
        scanButton.addEventListener("click", openScanner);
    }

    if (closeScannerButton) {
        closeScannerButton.addEventListener("click", closeScanner);
    }
}



function updateApp() {
    const beforeStartScreen = document.querySelector(".screen-before-start");
    const calendarScreen = document.querySelector(".screen-calendar");
    const dayScreen = document.querySelector(".screen-day");

    if (!isCalendarAvailable()) {
        // Antes del 1 de diciembre siempre mostramos la cuenta atrás.
        beforeStartScreen.hidden = false;
        calendarScreen.hidden = true;
        dayScreen.hidden = true;

        updateCountdown();
        return;
    }

    // Si acaba de comenzar diciembre, pasamos de la cuenta atrás
    // al calendario.
    if (!beforeStartScreen.hidden) {
        beforeStartScreen.hidden = true;
        calendarScreen.hidden = false;
        dayScreen.hidden = true;
    }

    // Si estamos viendo el calendario, actualizamos el día actual.
    // Si estamos dentro de un día, no cambiamos de pantalla.
    if (!calendarScreen.hidden && dayScreen.hidden) {
        markCurrentCalendarDay();
    }
}



function initializeApp() {
    updateApp();

    // Activamos la navegación entre calendario y días.
    initializeDayNavigation();

    // Actualizamos fecha y pantalla cada segundo.
    setInterval(updateApp, 1000);

    console.log("Aplicación iniciada.");
    console.log("Fecha actual:", getCurrentDateParts());
}

document.addEventListener("DOMContentLoaded", initializeApp);

// Abrir la pantalla del escáner
async function openScanner() {
    const dayScreen = document.querySelector(".screen-day");
    const scannerScreen = document.querySelector(".screen-scanner");
    const message = document.getElementById("scanner-message");

    if (!dayScreen || !scannerScreen || !message) {
        console.error("No se han encontrado los elementos del escáner.");
        return;
    }

    dayScreen.hidden = true;
    scannerScreen.hidden = false;

    message.textContent = "Preparando la cámara...";

    try {
        await startQrScanner(handleQrDetected);
    } catch (error) {
        console.error("No se pudo iniciar el escáner:", error);
    }
}


// Cuando se detecta un QR
function handleQrDetected(qrValue) {
    const dayScreen = document.querySelector(".screen-day");
    const scannerScreen = document.querySelector(".screen-scanner");
    const result = document.getElementById("qr-result");

    if (!dayScreen || !scannerScreen || !result) {
        console.error("No se han encontrado los elementos para mostrar el QR.");
        return;
    }

    scannerScreen.hidden = true;
    dayScreen.hidden = false;

    result.textContent = "Código detectado: " + qrValue;
    result.hidden = false;
}


// Cerrar el escáner manualmente
async function closeScanner() {

    await stopQrScanner();

    document.querySelector(".screen-scanner").hidden = true;
    document.querySelector(".screen-day").hidden = false;
}