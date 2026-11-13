const PLANS = {
    basic: { name: "Básico", price: "9,99" },
    standard: { name: "Estándar", price: "14,99" },
    premium: { name: "Premium", price: "17,99" }
};

const DEFAULT_PLAN = "premium";

function getRequestedPlanKey() {
    const requestedPlan = new URLSearchParams(window.location.search).get("plan");
    const planKey = (requestedPlan || "").toLowerCase();

    return Object.prototype.hasOwnProperty.call(PLANS, planKey)
        ? planKey
        : null;
}

const requestedPlanKey = getRequestedPlanKey();
const planKey = requestedPlanKey || DEFAULT_PLAN;
const plan = PLANS[planKey];
const planUrl = `./eligePlan.html?plan=${encodeURIComponent(planKey)}`;

document.querySelectorAll("[data-login-plan]").forEach((input) => {
    if (requestedPlanKey) {
        input.value = requestedPlanKey;
    } else {
        input.disabled = true;
    }
});

document.querySelectorAll("[data-complete-link]").forEach((link) => {
    link.href = requestedPlanKey
        ? `./completarSus.html?plan=${encodeURIComponent(requestedPlanKey)}`
        : "./completarSus.html";
});

document.querySelectorAll("[data-plan-name]").forEach((element) => {
    element.textContent = plan.name;
});

document.querySelectorAll("[data-plan-price]").forEach((element) => {
    element.textContent = plan.price;
});

document.querySelectorAll("[data-plan-link]").forEach((element) => {
    element.href = planUrl;
});

document.querySelectorAll('input[type="hidden"][name="plan"]:not([data-login-plan])').forEach((input) => {
    input.value = planKey;
});

document.querySelectorAll('input[type="radio"][name="plan"]').forEach((input) => {
    input.checked = input.value === planKey;
});

const paymentForm = document.querySelector("#payment-form");

if (paymentForm) {
    paymentForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!paymentForm.checkValidity()) {
            paymentForm.reportValidity();
            return;
        }

        const submitButton = paymentForm.querySelector(".payment-submit");
        const status = paymentForm.querySelector(".payment-status");

        submitButton.disabled = true;
        submitButton.textContent = "Procesando...";
        paymentForm.setAttribute("aria-busy", "true");

        if (status) {
            status.textContent = "Procesando tu suscripción...";
        }

        window.setTimeout(() => {
            window.location.href = `./confirmacion.html?plan=${encodeURIComponent(planKey)}`;
        }, 1800);
    });
}
