(() => {
    const content = document.querySelector("#experiment-content");
    const variantA = document.querySelector("#variant-a");
    const variantB = document.querySelector("#variant-b");
    const fallbackVariant = "a";

    if (!content || !variantA || !variantB) {
        console.error("No se encontraron las plantillas de la prueba A/B.");
        return;
    }

    const renderVariant = (variant) => {
        const selectedTemplate = variant === "b" ? variantB : variantA;
        content.replaceChildren(selectedTemplate.content.cloneNode(true));
        document.body.dataset.abVariant = variant === "b" ? "b" : "a";
    };

    const startExperiment = async () => {
        if (typeof GrowthBook !== "function") {
            console.warn("GrowthBook no está disponible; se muestra la variante A.");
            renderVariant(fallbackVariant);
            return;
        }

        const visitorId = localStorage.getItem("netflix-ab-visitor-id")
            || (crypto.randomUUID ? crypto.randomUUID() : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        localStorage.setItem("netflix-ab-visitor-id", visitorId);

        const growthBook = new GrowthBook({
            apiHost: "https://cdn.growthbook.io",
            clientKey: "sdk-myGTLTcFwAeuUer",
            attributes: { id: visitorId },
            trackingCallback: (experiment, result) => {
                console.info("Exposición registrada", {
                    experiment: experiment.key,
                    variation: result.key
                });
            }
        });

        try {
            await growthBook.init({ timeout: 1500 });
            renderVariant(growthBook.getFeatureValue("homepage-variant", fallbackVariant));
        } catch (error) {
            console.error("No se pudo cargar la configuración de GrowthBook.", error);
            renderVariant(fallbackVariant);
        }
    };

    startExperiment();
})();