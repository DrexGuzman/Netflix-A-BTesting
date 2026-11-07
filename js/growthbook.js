import { GrowthBook } from "https://esm.sh/@growthbook/growthbook@2.0.0";
import {
    autoAttributesPlugin,
    growthbookTrackingPlugin
} from "https://esm.sh/@growthbook/growthbook@2.0.0/plugins";

const CLIENT_KEY = "sdk-myGTLTcFwAeuUer";
const API_HOST = "https://cdn.growthbook.io";
const INGESTOR_HOST = "https://us-east-1.gb-ingest.com";
const EXPERIMENT_KEY = "homepage-variant";
const FALLBACK_VARIANT = "a";
const VALID_VARIANTS = new Set(["a", "b"]);
const INIT_TIMEOUT_MS = 2500;

const isDevMode =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname.endsWith(".local") ||
    location.hostname.includes("--");

const page = document.body.dataset.gbPage || "unknown";

const gb = new GrowthBook({
    apiHost: API_HOST,
    clientKey: CLIENT_KEY,
    enableDevMode: isDevMode,
    plugins: [
        autoAttributesPlugin(),
        growthbookTrackingPlugin({
            ingestorHost: INGESTOR_HOST,
            enableFeatureUsageEvents: false
        })
    ]
});

const pageViewEvents = {
    landing: "landing_view",
    email: "email_confirmation_view",
    complete: "subscription_landing_view",
    plan: "plan_step_view",
    choose: "plans_view",
    login: "login_view",
    success: "subscription_complete"
};

const ready = gb
    .init({ timeout: INIT_TIMEOUT_MS })
    .then((result) => {
        if (!result.success) {
            console.warn("GrowthBook init:", result.source, result.error);
        }

        if (page !== "landing") {
            return FALLBACK_VARIANT;
        }

        const value = gb.getFeatureValue(EXPERIMENT_KEY, FALLBACK_VARIANT);
        return VALID_VARIANTS.has(value) ? value : FALLBACK_VARIANT;
    })
    .catch((error) => {
        console.error("GrowthBook init failed:", error);
        return FALLBACK_VARIANT;
    });

function track(eventName, properties = {}) {
    const cleanProperties = Object.fromEntries(
        Object.entries(properties).filter(
            ([, value]) => value !== undefined && value !== null && value !== ""
        )
    );

    gb.logEvent(eventName, cleanProperties);
}

function renderVariant(variant) {
    const content = document.querySelector("#experiment-content");
    const template = document.querySelector(
        variant === "b" ? "#variant-b" : "#variant-a"
    );

    if (!content || !template) {
        return;
    }

    content.replaceChildren(template.content.cloneNode(true));
    document.body.dataset.abVariant = variant;
}

function attachTracking() {
    document.addEventListener(
        "submit",
        (event) => {
            const form = event.target.closest("form[data-gb-event]");
            if (!form) {
                return;
            }

            const properties = {
                page,
                location: form.dataset.gbLocation
            };

            if (form.dataset.gbEvent === "plan_select") {
                properties.plan =
                    new FormData(form).get("plan") || "premium";
            }

            track(form.dataset.gbEvent, properties);
        },
        true
    );

    document.addEventListener(
        "click",
        (event) => {
            const target = event.target.closest("[data-gb-event]");
            if (!target || target.tagName === "FORM") {
                return;
            }

            track(target.dataset.gbEvent, {
                page,
                location: target.dataset.gbLocation,
                plan: target.dataset.gbPlan
            });
        },
        true
    );
}

async function main() {
    let variant = FALLBACK_VARIANT;

    try {
        variant = await ready;
    } finally {
        if (page === "landing") {
            renderVariant(variant);
        }

        document.documentElement.setAttribute("data-gb-ready", "");
    }

    const pageViewEvent = pageViewEvents[page];
    if (pageViewEvent) {
        track(pageViewEvent, { page });
    }

    attachTracking();
}

main();
