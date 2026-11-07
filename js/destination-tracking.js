const journeyData = sessionStorage.getItem(
    "ab_test_journey"
);

if (journeyData) {

    const journey = JSON.parse(journeyData);

    // Evitar registrar dos llegadas por recargar la página
    const alreadyRecorded = sessionStorage.getItem(
        "ab_test_arrival_" + journey.journey_id
    );

    if (!alreadyRecorded) {

        const elapsedTime = Date.now() - journey.started_at;

        const event = {
            experiment_id: journey.experiment_id,
            variation: journey.variation,
            visitor_id: journey.visitor_id,
            event_name: "destination_reached",
            elapsed_time_ms: elapsedTime
        };

        console.log("Llegada registrada:", event);

        sessionStorage.setItem(
            "ab_test_arrival_" + journey.journey_id,
            "true"
        );
    }
}