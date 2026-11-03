import { GrowthBook } from "https://esm.sh/@growthbook/growthbook";
import { autoAttributesPlugin } from "https://esm.sh/@growthbook/growthbook/plugins";

const content = document.querySelector("#experiment-content");
const variantA = document.querySelector("#variant-a");
const variantB = document.querySelector("#variant-b");
const fallbackVariant = "a";

const renderVariant = (variant) => {
    if (!content || !variantA || !variantB) {
        console.error("No se encontraron las plantillas de la prueba A/B.");
        return;
    }

    const selectedTemplate = variant === "b" ? variantB : variantA;
    content.replaceChildren(selectedTemplate.content.cloneNode(true));
    document.body.dataset.abVariant = variant === "b" ? "b" : "a";
};

const growthbook = new GrowthBook({
    apiHost: "https://cdn.growthbook.io",
    clientKey: "sdk-myGTLTcFwAeuUer",
    enableDevMode: true,
    trackingCallback: (experiment, result) => {
        console.info("Viewed Experiment", {
            experimentId: experiment.key,
            variationId: result.key
        });
    },
    plugins: [autoAttributesPlugin()]
});

renderVariant(fallbackVariant);

try {
    await growthbook.init({ streaming: true });
    renderVariant(growthbook.getFeatureValue("homepage-variant", fallbackVariant));
} catch (error) {
    console.error("No se pudo cargar la configuración de GrowthBook.", error);
    renderVariant(fallbackVariant);
}