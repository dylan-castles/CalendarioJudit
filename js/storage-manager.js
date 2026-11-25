
const STORAGE_KEY = "estadoDia";

// Obtener el estado guardado. Si no existe, empezamos en "0".
function getEstadoDia() {
    return localStorage.getItem(STORAGE_KEY) || "0";
}

// Guardar un nuevo estado.
function setEstadoDia(estado) {
    localStorage.setItem(STORAGE_KEY, estado);
}

// Obtener el último día que se ha empezado.
function getDiaActual() {
    const estado = getEstadoDia();

    if (estado === "0") return 1;

    return parseInt(estado, 10);
}

// Saber si el día está escaneado.
function isDiaEscaneado(dia) {
    return getEstadoDia() === `${dia}E`;
}

// Saber si el día está completado.
function isDiaCompletado(dia) {
    const estado = getEstadoDia();

    if (estado === "0") return false;

    const numeroDia = parseInt(estado, 10);
    const tipoEstado = estado.slice(-1);

    return dia < numeroDia ||
        (dia === numeroDia && tipoEstado === "C");
}

// Comprobar si se puede abrir un día.
function canOpenDay(dia) {
    const estado = getEstadoDia();

    if (dia === 25) {
        return estado === "24C" &&
            (getCurrentCalendarDay() || 0) >= 25;
    }

    if (dia < 1 || dia > 24) return false;

    if (estado === "0") {
        return dia === 1;
    }

    const numeroDia = parseInt(estado, 10);
    const tipoEstado = estado.slice(-1);

    if (dia <= numeroDia) return true;

    return dia === numeroDia + 1 && tipoEstado === "C";
}

// Registrar que un QR se ha escaneado correctamente.
function registrarDiaEscaneado(dia) {
    if (canOpenDay(dia) && !isDiaCompletado(dia)) {
        setEstadoDia(`${dia}E`);
        return true;
    }

    return false;
}

// Completar un día después de responder correctamente.
function completarDia(dia) {
    if (getEstadoDia() === `${dia}E`) {
        setEstadoDia(`${dia}C`);
        return true;
    }

    return false;
}
