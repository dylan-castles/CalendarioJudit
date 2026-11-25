let qrScanner = null;
let qrDetected = false;

// Iniciar la cámara y el lector QR
async function startQrScanner(onDetected) {

    qrDetected = false;

    const message = document.getElementById("scanner-message");

    qrScanner = new Html5Qrcode("qr-reader");

    try {
        message.textContent = "Buscando códigos QR...";

        await qrScanner.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.9;
                    return { width: size, height: size };
                },
                aspectRatio: 1
            },
            async (decodedText) => {

                if (qrDetected) return;

                qrDetected = true;

                await stopQrScanner();

                onDetected(decodedText);
            }
        );

    } catch (error) {

        console.error("Error al iniciar la cámara:", error);

        message.textContent =
            "No se pudo acceder a la cámara. Comprueba los permisos de Safari.";

        throw error;
    }
}


// Detener la cámara
async function stopQrScanner() {

    if (qrScanner) {

        try {
            if (qrScanner.isScanning) {
                await qrScanner.stop();
            }

            qrScanner.clear();

        } catch (error) {
            console.error("Error al detener el escáner:", error);
        }

        qrScanner = null;
    }
}