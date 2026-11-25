let selectedDayNumber = null;

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
    const calendarDays = document.querySelectorAll(".calendar-day");
    const today = getCurrentCalendarDay() || 0;

    calendarDays.forEach((dayElement) => {
        const dayNumber = Number(dayElement.dataset.day);

        dayElement.classList.remove(
            "is-available",
            "is-locked",
            "is-today",
            "is-scanned",
            "is-completed"
        );

        if (dayNumber === today) {
            dayElement.classList.add("is-today");
        }

        // Día 25: regalo especial, disponible tras completar el 24.
        if (dayNumber === 25) {
            if (getEstadoDia() === "24C" && today >= 25) {
                dayElement.classList.add("is-available");
            } else {
                dayElement.classList.add("is-locked");
            }
            return;
        }

        if (isDiaCompletado(dayNumber)) {
            dayElement.classList.add("is-completed");
        } else if (isDiaEscaneado(dayNumber)) {
            dayElement.classList.add("is-scanned");
        } else if (canOpenDay(dayNumber) && today >= dayNumber) {
            dayElement.classList.add("is-available");
        } else {
            dayElement.classList.add("is-locked");
        }
    });
}




function openDay(dayNumber) {
    const calendarScreen = document.querySelector(".screen-calendar");
    const dayScreen = document.querySelector(".screen-day");
    const dayNumberElement = document.getElementById("selected-day-number");

    if (!calendarScreen || !dayScreen || !dayNumberElement) {
        console.error("No se ha encontrado la pantalla del día.");
        return;
    }

    if (!canOpenDay(dayNumber)) return;

    const today = getCurrentCalendarDay() || 0;

    if (today < dayNumber) return;

    selectedDayNumber = dayNumber;

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

    updateDayStatusUI(dayNumber);
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
    const scannerScreen = document.querySelector(".screen-scanner");
    const dayScreen = document.querySelector(".screen-day");
    const result = document.getElementById("qr-result");

    if (!scannerScreen || !dayScreen || !result) return;

    scannerScreen.hidden = true;
    dayScreen.hidden = false;

    const expectedCode = `codigo_pista_dia_${selectedDayNumber}`;

    // El código no coincide.
    if (qrValue !== expectedCode) {
        result.textContent =
            "Este código QR no corresponde a este día. ¡Inténtalo de nuevo!";
        result.hidden = false;
        return;
    }

    // Registrar el escaneo correcto.
    const registered = registrarDiaEscaneado(selectedDayNumber);

    if (!registered) {
        result.textContent = "No se ha podido validar este código.";
        result.hidden = false;
        return;
    }

    // Actualizar la pantalla y el calendario.
    updateDayStatusUI(selectedDayNumber);
    markCurrentCalendarDay();

    console.log("Estado actualizado:", getEstadoDia());
}



// Cerrar el escáner manualmente
async function closeScanner() {
    await stopQrScanner();

    const scannerScreen = document.querySelector(".screen-scanner");
    const dayScreen = document.querySelector(".screen-day");

    if (scannerScreen) scannerScreen.hidden = true;
    if (dayScreen) dayScreen.hidden = false;
}


function updateDayStatusUI(dayNumber) {
    const scanButton = document.getElementById("scan-button");
    const qrResult = document.getElementById("qr-result");
    const clueContainer = document.querySelector(".clue-image");
    const clueTitle = document.querySelector(".clue-title");

    if (!scanButton || !qrResult) return;

    qrResult.hidden = false;

    // Día 25: regalo especial.
    if (dayNumber === 25) {
        scanButton.hidden = true;
        if (clueContainer) clueContainer.hidden = true;
        if (clueTitle) clueTitle.hidden = true;

        qrResult.textContent =
            "Para conseguir tu regalo, me tienes que ver ❤️";
        return;
    }

    if (clueContainer) clueContainer.hidden = false;
    if (clueTitle) clueTitle.hidden = false;

    // Día completado.
    if (isDiaCompletado(dayNumber)) {
        scanButton.hidden = true;
        qrResult.textContent = "¡Este día ya está completado! ❤️";
        return;
    }

    // QR escaneado, pendiente de la pregunta.
    if (isDiaEscaneado(dayNumber)) {
        scanButton.hidden = true;
        qrResult.textContent = "¡Ya has escaneado tu caja! ✓";
        return;
    }

    // Todavía no ha escaneado.
    scanButton.hidden = false;
    qrResult.hidden = true;
    qrResult.textContent = "";
}
