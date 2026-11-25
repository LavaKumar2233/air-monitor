
// =========================================
// AIR MONITOR - MAIN JAVASCRIPT
// WITH FASTAPI BACKEND CONNECTION
// =========================================


// 1. BACKEND CONFIGURATION

const API_URL = "http://127.0.0.1:8000";

const connectionStatus = document.getElementById("connectionStatus");

let backendConnected = false;
let lastLocalInputTime = 0;
let postTimeout = null;


// 2. GET HTML ELEMENTS

const temperatureInput = document.getElementById("temperatureInput");
const gasInput = document.getElementById("gasInput");

const temperatureValue = document.getElementById("temperatureValue");
const gasValue = document.getElementById("gasValue");

const temperatureStatus = document.getElementById("temperatureStatus");
const gasStatus = document.getElementById("gasStatus");

const airValue = document.getElementById("airValue");
const airStatus = document.getElementById("airStatus");

const buzzerValue = document.getElementById("buzzerValue");
const buzzerStatus = document.getElementById("buzzerStatus");

const temperatureInputValue = document.getElementById("temperatureInputValue");
const gasInputValue = document.getElementById("gasInputValue");

const alertContainer = document.getElementById("alertContainer");
const lastUpdated = document.getElementById("lastUpdated");


// 3. INITIAL SENSOR VALUES

let temperature = 28.5;
let gasReading = 512;

let airQuality = "GOOD";


// 4. CONNECTION INDICATOR

function setConnectionStatus(connected) {

    backendConnected = connected;

    if (connected) {
        connectionStatus.textContent = "BACKEND CONNECTED";

        connectionStatus.style.color = "#43d9b5";
        connectionStatus.style.background =
            "rgba(67, 217, 181, 0.12)";

    } else {
        connectionStatus.textContent = "SIMULATION MODE";

        connectionStatus.style.color = "#35b8d4";
        connectionStatus.style.background =
            "rgba(53, 184, 212, 0.12)";
    }

}


// 5. TEMPERATURE CLASSIFICATION

function classifyTemperature(temp) {

    if (temp < 4) return "SEVERE COLD";

    if (temp < 10) return "VERY COLD";

    if (temp < 20) return "CHILLY";

    if (temp < 40) return "NORMAL";

    if (temp < 45) return "HIGH TEMPERATURE";

    return "EXTREME HEAT";

}


// 6. AIR QUALITY CLASSIFICATION

function classifyAirQuality(gas) {

    if (airQuality === "GOOD") {

        if (gas >= 550) {
            airQuality = "MODERATE";
        }

    } else if (airQuality === "MODERATE") {

        if (gas >= 746) {
            airQuality = "POOR";
        } else if (gas <= 535) {
            airQuality = "GOOD";
        }

    } else if (airQuality === "POOR") {

        if (gas <= 726) {
            airQuality = "MODERATE";
        }

    }

    return airQuality;

}


// 7. UPDATE STATUS COLOURS

function setStatus(element, status) {

    element.classList.remove(
        "status-good",
        "status-moderate",
        "status-poor"
    );

    if (status === "GOOD" || status === "NORMAL") {

        element.classList.add("status-good");

    } else if (
        status === "MODERATE" ||
        status === "CHILLY" ||
        status === "VERY COLD" ||
        status === "HIGH TEMPERATURE"
    ) {

        element.classList.add("status-moderate");

    } else {

        element.classList.add("status-poor");

    }

}


// 8. BUZZER SIMULATION

function updateBuzzer() {

    if (airQuality === "GOOD") {

        buzzerValue.textContent = "OFF";
        buzzerStatus.textContent = "INACTIVE";

        setStatus(buzzerStatus, "GOOD");

    } else if (airQuality === "MODERATE") {

        buzzerValue.textContent = "INTERMITTENT";
        buzzerStatus.textContent = "1000 Hz";

        setStatus(buzzerStatus, "MODERATE");

    } else {

        buzzerValue.textContent = "CONTINUOUS";
        buzzerStatus.textContent = "1500 Hz";

        setStatus(buzzerStatus, "POOR");

    }

}


// 9. UPDATE ALERTS

function updateAlerts(tempStatus) {

    let alerts = [];

    if (tempStatus === "SEVERE COLD") {

        alerts.push({
            message: "Severe cold detected!",
            type: "danger"
        });

    } else if (tempStatus === "VERY COLD") {

        alerts.push({
            message: "Very low temperature detected.",
            type: "warning"
        });

    } else if (tempStatus === "CHILLY") {

        alerts.push({
            message: "Temperature is below the normal range.",
            type: "warning"
        });

    } else if (tempStatus === "HIGH TEMPERATURE") {

        alerts.push({
            message: "High temperature detected.",
            type: "warning"
        });

    } else if (tempStatus === "EXTREME HEAT") {

        alerts.push({
            message: "Extreme heat detected!",
            type: "danger"
        });

    }


    if (airQuality === "MODERATE") {

        alerts.push({
            message: "Air quality is moderate. Warning buzzer activated.",
            type: "warning"
        });

    } else if (airQuality === "POOR") {

        alerts.push({
            message: "Poor air quality detected! Continuous buzzer alert.",
            type: "danger"
        });

    }


    if (alerts.length === 0) {

        alertContainer.innerHTML = `
            <div class="alert-panel">
                System operating normally.
            </div>
        `;

        return;

    }


    alertContainer.innerHTML = alerts.map(alert => `
        <div class="alert-panel ${alert.type}">
            ${alert.message}
        </div>
    `).join("");

}


// 10. AIR QUALITY INDICATOR

function getAirIndicator() {

    if (airQuality === "GOOD") return "GREEN";

    if (airQuality === "MODERATE") return "YELLOW";

    return "RED";

}


// 11. UPDATE DASHBOARD

function updateDashboard() {

    temperature = Number(temperatureInput.value);
    gasReading = Number(gasInput.value);

    temperatureValue.textContent =
        temperature.toFixed(1) + "°C";

    gasValue.textContent = gasReading;

    temperatureInputValue.textContent =
        temperature.toFixed(1) + "°C";

    gasInputValue.textContent = gasReading;


    const tempStatus = classifyTemperature(temperature);

    classifyAirQuality(gasReading);


    temperatureStatus.textContent = tempStatus;

    setStatus(temperatureStatus, tempStatus);


    gasStatus.textContent = airQuality;
    airValue.textContent = airQuality;

    setStatus(gasStatus, airQuality);
    setStatus(airStatus, airQuality);

    airStatus.textContent = getAirIndicator();


    updateBuzzer();

    updateAlerts(tempStatus);


    lastUpdated.textContent =
        new Date().toLocaleTimeString();


    updateCharts();

}


// 12. CHART DATA

const maxReadings = 20;

const labels = [];

const temperatureHistory = [];
const gasHistory = [];


// 13. TEMPERATURE CHART

const temperatureChart = new Chart(
    document.getElementById("temperatureChart"),
    {
        type: "line",

        data: {
            labels: labels,

            datasets: [{
                label: "Temperature (°C)",
                data: temperatureHistory,
                borderColor: "#35b8d4",
                backgroundColor: "rgba(53, 184, 212, 0.15)",
                fill: true,
                tension: 0.35,
                spanGaps: true
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: false,
            spanGaps: true,

            plugins: {
                legend: {
                    labels: {
                        color: "#f1f5f9"
                    }
                }
            },

            scales: {
                x: {
                    ticks: {
                        color: "#94a3b8"
                    },
                    grid: {
                        color: "#263746"
                    }
                },

                y: {
                    ticks: {
                        color: "#94a3b8"
                    },
                    grid: {
                        color: "#263746"
                    }
                }
            }
        }
    }
);


// 14. GAS SENSOR CHART

const gasChart = new Chart(
    document.getElementById("gasChart"),
    {
        type: "line",

        data: {
            labels: labels,

            datasets: [{
                label: "Gas Sensor Value",
                data: gasHistory,
                borderColor: "#43d9b5",
                backgroundColor: "rgba(67, 217, 181, 0.15)",
                fill: true,
                tension: 0.35,
                spanGaps: true
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: false,
            spanGaps: true,

            plugins: {
                legend: {
                    labels: {
                        color: "#f1f5f9"
                    }
                }
            },

            scales: {
                x: {
                    ticks: {
                        color: "#94a3b8"
                    },
                    grid: {
                        color: "#263746"
                    }
                },

                y: {
                    min: 0,
                    max: 1023,

                    ticks: {
                        color: "#94a3b8"
                    },

                    grid: {
                        color: "#263746"
                    }
                }
            }
        }
    }
);


// 15. UPDATE CHARTS

function updateCharts() {

    const time = new Date().toLocaleTimeString();

    labels.push(time);

    temperatureHistory.push(temperature);
    gasHistory.push(gasReading);


    if (labels.length > maxReadings) {

        labels.shift();
        temperatureHistory.shift();
        gasHistory.shift();

    }


    temperatureChart.update("none");
    gasChart.update("none");

}


// 16. SEND READINGS TO BACKEND

async function sendReadingsToBackend() {

    try {

        const response = await fetch(
            API_URL + "/readings",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    temperature: temperature,
                    gas: gasReading
                })
            }
        );


        if (!response.ok) {
            throw new Error("Backend rejected the readings");
        }


        const result = await response.json();

        if (result.success) {
            setConnectionStatus(true);
        }

    } catch (error) {

        console.error("POST error:", error);

        setConnectionStatus(false);

    }

}


// 17. RECEIVE READINGS FROM BACKEND

async function receiveReadingsFromBackend() {

    try {

        const response = await fetch(API_URL + "/readings");

        if (!response.ok) {
            throw new Error("Could not retrieve readings");
        }


        const result = await response.json();

        if (result.success && result.data) {

            setConnectionStatus(true);


            // Avoid overwriting the sliders while the user
            // is actively changing them.

            if (Date.now() - lastLocalInputTime > 2000) {

                temperature = Number(result.data.temperature);
                gasReading = Number(result.data.gas);

                temperatureInput.value = temperature;
                gasInput.value = gasReading;

                updateDashboard();

            }

        }

    } catch (error) {

        console.error("GET error:", error);

        setConnectionStatus(false);

    }

}


// 18. SLIDER EVENT LISTENERS

function handleSliderInput() {

    lastLocalInputTime = Date.now();

    updateDashboard();


    // Wait briefly before sending to avoid
    // sending too many requests while dragging.

    clearTimeout(postTimeout);

    postTimeout = setTimeout(() => {

        sendReadingsToBackend();

    }, 300);

}


temperatureInput.addEventListener("input", handleSliderInput);

gasInput.addEventListener("input", handleSliderInput);


// 19. BACKEND POLLING

// Retrieve the latest readings every two seconds.

setInterval(() => {

    receiveReadingsFromBackend();

}, 2000);


// 20. AUTOMATIC DASHBOARD REFRESH

setInterval(() => {

    updateDashboard();

}, 1000);


// 21. INITIAL LOAD

setConnectionStatus(false);

updateDashboard();

receiveReadingsFromBackend();
