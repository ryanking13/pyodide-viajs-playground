importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js");
importScripts("./via/controller/object.js", "./via/controller/property.js", "./via/controller/controller.js");

async function initializePyodide() {
    self.pyodide = await loadPyodide();
}

const pyodideReadyPromise = initializePyodide();

self.onmessage = async (event) => {
    await pyodideReadyPromise;

    Via.postMessage = (data => self.postMessage(data));

    const { action, message } = event.data;
    try {
        switch (action) {
            case 'runPython': {
                const results = await self.pyodide.runPythonAsync(message);
                event.ports[0].postMessage({ results });
                break;
            }
            case 'loadPackage': {
                const results = await self.pyodide.loadPackage(message);
                event.ports[0].postMessage({ results });
                break;                
            }
            case 'setImage': {
                console.log("setImage");

                const blob = new Blob([self.pyodide.FS.readFile(message.path)], { type: message.type });
                const document = via.document;
                const url = URL.createObjectURL(blob);

                const img = document.createElement("img");
                img.src = url;
                document.body.appendChild(img);
                break;
            }
            default:
                event.ports[0].postMessage({ results: null });
        }
    } catch (error) {
        event.ports[0].postMessage({ error: error.message });
    }
};