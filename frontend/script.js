document.addEventListener("DOMContentLoaded", function () {

    // ============================================================
    // BACKEND CONFIGURATION
    // ============================================================

    const BACKEND_URL = "http://localhost:5000";

    const ACCIDENTS_API =
        `${BACKEND_URL}/api/accidents`;

    const CURRENT_ACCIDENT_API =
        `${BACKEND_URL}/api/accidents/current`;


    // ============================================================
    // DOM ELEMENTS
    // ============================================================

    const landingPage =
        document.getElementById("landingPage");

    const dashboardPage =
        document.getElementById("dashboardPage");

    const dashboardMain =
        document.querySelector(".dashboard-main");

    const liveAlertPage =
        document.getElementById("liveAlertPage");

    const loginModal =
        document.getElementById("loginModal");

    const loginForm =
        document.getElementById("loginForm");

    const closeLogin =
        document.getElementById("closeLogin");

    const loginError =
        document.getElementById("loginError");

    const department =
        document.getElementById("department");

    const departmentId =
        document.getElementById("departmentId");

    const password =
        document.getElementById("password");

    const departmentName =
        document.getElementById("departmentName");

    const logoutButton =
        document.getElementById("logoutButton");


    // ============================================================
    // APPLICATION STATE
    // ============================================================

    let loggedIn = false;

    let responseStep = 0;

    let incidentStatus = "ACTIVE";

    let accidentMap = null;

    let accidentMarker = null;

    let accidentMonitor = null;

    let lastAccidentId = null;

    let allAccidents = [];

    let currentAccident = null;

    let backendConnected = false;

    let lastLoadedAccidentCount = 0;


    // ============================================================
    // DEFAULT LOCATION
    // ============================================================

    let accidentLocation = {

        latitude: 17.385000,

        longitude: 78.486700

    };


    // ============================================================
    // RESPONSE STATES
    // ============================================================

    const responseStates = [

        {
            name: "ACKNOWLEDGED",
            button: "🚑 DISPATCH RESPONSE"
        },

        {
            name: "DISPATCHED",
            button: "🚑 MARK ON SCENE"
        },

        {
            name: "ON SCENE",
            button: "✓ RESOLVE INCIDENT"
        },

        {
            name: "RESOLVED",
            button: "✓ INCIDENT RESOLVED"
        }

    ];


    // ============================================================
    // LOGIN CREDENTIALS
    // ============================================================

    const loginCredentials = {

        "Police": {

            id: "POLICE001",

            password: "police123"

        },

        "Hospital": {

            id: "HOSPITAL001",

            password: "hospital123"

        },

        "Fire & Rescue": {

            id: "FIRE001",

            password: "fire123"

        },

        "Ambulance": {

            id: "AMB001",

            password: "ambulance123"

        },

        "Emergency Services": {

            id: "POLICE001",

            password: "police123"

        }

    };


    // ============================================================
    // HELPER
    // ============================================================

    function safeText(value, fallback = "—") {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return fallback;

        }

        return String(value);

    }


    // ============================================================
    // FORMAT DATE
    // ============================================================

    function formatTime(dateValue) {

        if (!dateValue) {

            return "—";

        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";

        }

        return date.toLocaleTimeString(

            "en-IN",

            {

                hour: "2-digit",

                minute: "2-digit",

                second: "2-digit",

                hour12: true

            }

        );

    }


    // ============================================================
    // FORMAT DATE
    // ============================================================

    function formatDate(dateValue) {

        if (!dateValue) {

            return "—";

        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";

        }

        return date.toLocaleDateString(

            "en-IN",

            {

                day: "2-digit",

                month: "short",

                year: "numeric"

            }

        );

    }


    // ============================================================
    // LOGIN MODAL
    // ============================================================

    function openLoginModal() {

        if (!loginModal) {

            return;

        }

        loginModal.classList.add(
            "active"
        );

        loginModal.style.display =
            "flex";

        if (loginError) {

            loginError.textContent =
                "";

        }

    }


    function closeLoginModal() {

        if (!loginModal) {

            return;

        }

        loginModal.classList.remove(
            "active"
        );

        loginModal.style.display =
            "none";

    }


    // ============================================================
    // LOGIN BUTTONS
    // ============================================================

    const loginButtons =
        document.querySelectorAll(
            ".login-btn, .primary-btn"
        );


    loginButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    openLoginModal();

                }
            );

        }
    );


    // ============================================================
    // CLOSE LOGIN
    // ============================================================

    closeLogin?.addEventListener(

        "click",

        function () {

            closeLoginModal();

        }

    );


    // ============================================================
    // LOGIN FORM
    // ============================================================

    loginForm?.addEventListener(

        "submit",

        function (event) {

            event.preventDefault();


            const selectedDepartment =
                department?.value;

            const enteredId =
                departmentId?.value.trim();

            const enteredPassword =
                password?.value;


            if (
                !selectedDepartment ||
                !enteredId ||
                !enteredPassword
            ) {

                if (loginError) {

                    loginError.textContent =
                        "Please fill all fields.";

                }

                return;

            }


            const credentials =
                loginCredentials[
                    selectedDepartment
                ];


            if (
                credentials &&
                credentials.id === enteredId &&
                credentials.password === enteredPassword
            ) {

                loggedIn = true;


                if (departmentName) {

                    departmentName.textContent =
                        selectedDepartment;

                }


                closeLoginModal();

                showDashboard();

            }

            else {

                if (loginError) {

                    loginError.textContent =
                        "Invalid department ID or password.";

                }

            }

        }

    );


    // ============================================================
    // SHOW DASHBOARD
    // ============================================================

    function showDashboard() {

        if (landingPage) {

            landingPage.style.display =
                "none";

        }

        if (dashboardPage) {

            dashboardPage.style.display =
                "block";

        }

        if (liveAlertPage) {

            liveAlertPage.style.display =
                "none";

        }

        resetIncident();

        loadAccidentHistory();

        startAccidentMonitoring();

    }


    // ============================================================
    // SHOW LIVE ALERTS
    // ============================================================

    function showLiveAlerts() {

        if (!loggedIn) {

            openLoginModal();

            return;

        }


        if (dashboardMain) {

            dashboardMain.style.display =
                "none";

        }

        if (liveAlertPage) {

            liveAlertPage.style.display =
                "block";

        }


        initializeAccidentMap();

        loadAccidentHistory();

        loadCurrentAccident();

    }


    // ============================================================
    // SHOW DASHBOARD MAIN
    // ============================================================

    function showDashboardMain() {

        if (dashboardMain) {

            dashboardMain.style.display =
                "block";

        }

        if (liveAlertPage) {

            liveAlertPage.style.display =
                "none";

        }

    }


    // ============================================================
    // SIDEBAR NAVIGATION
    // ============================================================

    const navigationItems =
        document.querySelectorAll(
            ".dashboard-nav a"
        );


    navigationItems.forEach(

        item => {

            item.addEventListener(

                "click",

                function (event) {

                    event.preventDefault();


                    const page =
                        item.dataset.page;


                    navigationItems.forEach(

                        nav => {

                            nav.classList.remove(
                                "active"
                            );

                        }

                    );


                    item.classList.add(
                        "active"
                    );


                    if (
                        page ===
                        "live-alerts"
                    ) {

                        showLiveAlerts();

                    }

                    else if (
                        page ===
                        "dashboard"
                    ) {

                        showDashboardMain();

                    }

                    else if (
                        page ===
                        "map"
                    ) {

                        showLiveAlerts();

                        setTimeout(

                            function () {

                                centerAccidentLocation();

                            },

                            500

                        );

                    }

                    else {

                        showDashboardMain();

                    }

                }

            );

        }

    );


    // ============================================================
    // LOGOUT
    // ============================================================

    logoutButton?.addEventListener(

        "click",

        function () {

            loggedIn = false;

            stopAccidentMonitoring();

            lastAccidentId = null;

            currentAccident = null;

            allAccidents = [];

            showDashboardMain();

            if (dashboardPage) {

                dashboardPage.style.display =
                    "none";

            }

            if (landingPage) {

                landingPage.style.display =
                    "block";

            }

        }

    );


    // ============================================================
    // SIDEBAR ACTIVE ITEM
    // ============================================================

    function activateSidebarItem(
        pageName
    ) {

        navigationItems.forEach(

            item => {

                item.classList.remove(
                    "active"
                );


                if (
                    item.dataset.page ===
                    pageName
                ) {

                    item.classList.add(
                        "active"
                    );

                }

            }

        );

    }


    // ============================================================
    // DASHBOARD INCIDENT UPDATE
    // ============================================================

    function updateDashboardIncident(
        status
    ) {

        const badge =
            document.querySelector(
                ".critical-badge"
            );


        if (!badge) {

            return;

        }


        const normalized =
            String(
                status || "ACTIVE"
            ).toUpperCase();


        if (
            normalized ===
            "RESOLVED"
        ) {

            badge.textContent =
                "✓ RESOLVED";

        }

        else {

            badge.textContent =
                "● CRITICAL";

        }

    }


    // ============================================================
    // INCIDENT BADGE
    // ============================================================

    function updateIncidentBadge(
        status
    ) {

        const liveBadge =
            document.querySelector(
                ".critical-live"
            );


        if (!liveBadge) {

            return;

        }


        if (
            String(status)
                .toUpperCase() ===
            "RESOLVED"
        ) {

            liveBadge.innerHTML =
                "<span></span> INCIDENT RESOLVED";

        }

        else {

            liveBadge.innerHTML =
                "<span></span> LIVE INCIDENT";

        }

    }


    // ============================================================
    // EMERGENCY ALERT
    // ============================================================

    function triggerEmergencyAlert() {

        if (liveAlertPage) {

            liveAlertPage.classList.add(
                "new-alert"
            );


            setTimeout(

                function () {

                    liveAlertPage.classList.remove(
                        "new-alert"
                    );

                },

                1500

            );

        }

    }


    // ============================================================
    // RESPONSE TIMELINE
    // ============================================================

    function updateResponseTimeline(
        completedStep
    ) {

        const timelineItems =
            document.querySelectorAll(
                ".timeline-item"
            );


        timelineItems.forEach(

            function (
                item,
                index
            ) {

                const dot =
                    item.querySelector(
                        ".timeline-dot"
                    );


                const time =
                    item.querySelector(
                        "span"
                    );


                if (
                    index <
                    completedStep
                ) {

                    item.classList.add(
                        "active"
                    );


                    if (dot) {

                        dot.textContent =
                            "✓";

                    }

                }

                else {

                    item.classList.remove(
                        "active"
                    );


                    if (dot) {

                        dot.textContent =
                            index + 1;

                    }

                }


                if (
                    index ===
                    completedStep
                ) {

                    item.classList.add(
                        "active"
                    );

                }


                if (
                    time &&
                    index === 0 &&
                    currentAccident
                ) {

                    time.textContent =
                        formatTime(
                            currentAccident.detected_at
                        );

                }

            }

        );

    }


    // ============================================================
    // RESPONSE BUTTON
    // ============================================================

    function updateResponseButton(
        state
    ) {

        const button =
            document.getElementById(
                "liveRespondButton"
            );


        if (!button) {

            return;

        }


        if (
            state.name ===
            "RESOLVED"
        ) {

            button.textContent =
                "✓ INCIDENT RESOLVED";

            button.disabled =
                true;

            button.style.opacity =
                "0.6";

            button.style.cursor =
                "default";

            return;

        }


        button.textContent =
            state.button;

    }


    // ============================================================
    // PROCESS RESPONSE
    // ============================================================

    function processResponse() {

        if (!currentAccident) {

            showMessage(
                "No active accident available."
            );

            return;

        }


        if (
            responseStep >=
            responseStates.length
        ) {

            return;

        }


        const state =
            responseStates[
                responseStep
            ];


        const nextStep =
            responseStep + 1;


        updateResponseTimeline(
            nextStep
        );


        updateResponseButton(
            state
        );


        responseStep =
            nextStep;


        incidentStatus =
            state.name;


        updateDashboardIncident(
            incidentStatus
        );


        updateIncidentBadge(
            incidentStatus
        );


        updateBackendAccidentStatus(
            state.name
        );

    }


    // ============================================================
    // RESPONSE BUTTON EVENT
    // ============================================================

    const liveRespondButton =
        document.getElementById(
            "liveRespondButton"
        );


    liveRespondButton?.addEventListener(

        "click",

        function () {

            processResponse();

        }

    );


    // ============================================================
    // BACKEND STATUS UPDATE
    // ============================================================

    async function updateBackendAccidentStatus(
        status
    ) {

        try {

            const response =
                await fetch(

                    `${BACKEND_URL}/api/accidents/current/status`,

                    {

                        method: "PATCH",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                status:
                                    status

                            })

                    }

                );


            if (!response.ok) {

                throw new Error(
                    `Backend returned ${response.status}`
                );

            }


            const data =
                await response.json();


            console.log(
                "Backend status updated:",
                data
            );


            loadAccidentHistory();

        }

        catch (error) {

            console.error(
                "Status update failed:",
                error
            );

        }

    }


    // ============================================================
    // RESET INCIDENT
    // ============================================================

    function resetIncident() {

        responseStep = 0;

        incidentStatus =
            "ACTIVE";


        if (liveRespondButton) {

            liveRespondButton.disabled =
                false;

            liveRespondButton.style.opacity =
                "1";

            liveRespondButton.style.cursor =
                "pointer";

            liveRespondButton.textContent =
                "✓ ACKNOWLEDGE INCIDENT";

        }


        const timelineItems =
            document.querySelectorAll(
                ".timeline-item"
            );


        timelineItems.forEach(

            function (
                item,
                index
            ) {

                if (index === 0) {

                    item.classList.add(
                        "active"
                    );

                }

                else {

                    item.classList.remove(
                        "active"
                    );

                }


                const dot =
                    item.querySelector(
                        ".timeline-dot"
                    );


                if (dot) {

                    dot.textContent =
                        index === 0
                            ? "✓"
                            : index + 1;

                }

            }

        );


        updateIncidentBadge(
            "ACTIVE"
        );


        updateDashboardIncident(
            "ACTIVE"
        );


        updateCoordinateDisplay();

    }


    // ============================================================
    // DASHBOARD STATISTICS
    // ============================================================

    function updateDashboardStatistics(
        accidents = []
    ) {

        const activeCount =
            accidents.filter(

                accident =>
                    String(
                        accident.status ||
                        ""
                    ).toUpperCase() ===
                    "ACTIVE"

            ).length;


        const resolvedCount =
            accidents.filter(

                accident =>
                    String(
                        accident.status ||
                        ""
                    ).toUpperCase() ===
                    "RESOLVED"

            ).length;


        const activeElement =
            document.querySelector(
                ".dash-stat .red-text"
            );


        if (activeElement) {

            activeElement.textContent =
                String(
                    activeCount
                ).padStart(
                    2,
                    "0"
                );

        }


        const stats =
            document.querySelectorAll(
                ".dash-stat"
            );


        stats.forEach(

            function (stat) {

                const label =
                    stat.querySelector(
                        "span"
                    );


                const value =
                    stat.querySelector(
                        "strong"
                    );


                if (!label || !value) {

                    return;

                }


                const text =
                    label.textContent
                        .trim()
                        .toUpperCase();


                if (
                    text ===
                    "ALERTS TODAY"
                ) {

                    value.textContent =
                        String(
                            accidents.length
                        ).padStart(
                            2,
                            "0"
                        );

                }


                if (
                    text ===
                    "RESOLVED"
                ) {

                    value.textContent =
                        String(
                            resolvedCount
                        ).padStart(
                            2,
                            "0"
                        );

                }

            }

        );

    }


    // ============================================================
    // LOAD ACCIDENT HISTORY
    // ============================================================

    async function loadAccidentHistory() {

        try {

            const response =
                await fetch(

                    ACCIDENTS_API,

                    {

                        cache:
                            "no-store"

                    }

                );


            if (!response.ok) {

                throw new Error(
                    `Backend returned ${response.status}`
                );

            }


            const data =
                await response.json();


            if (
                !data.success ||
                !Array.isArray(
                    data.accidents
                )
            ) {

                return;

            }


            backendConnected =
                true;


            allAccidents =
                data.accidents;


            lastLoadedAccidentCount =
                allAccidents.length;


            updateDashboardStatistics(
                allAccidents
            );


            renderRecentAccidents(
                allAccidents
            );


            console.log(
                "Accident history loaded:",
                allAccidents
            );

        }

        catch (error) {

            backendConnected =
                false;


            console.error(
                "Failed to load accident history:",
                error
            );

        }

    }


    // ============================================================
    // RENDER RECENT ACCIDENTS
    // ============================================================

    function renderRecentAccidents(
        accidents
    ) {

        const table =
            document.querySelector(
                ".recent-table"
            );


        if (!table) {

            return;

        }


        const oldRows =
            table.querySelectorAll(
                ".table-row:not(.table-head)"
            );


        oldRows.forEach(

            row => row.remove()

        );


        const recent =
            accidents.slice(
                0,
                5
            );


        recent.forEach(

            function (accident) {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "table-row";


                const vehicle =
                    safeText(
                        accident.vehicle_id,
                        "Unknown"
                    );


                const impact =
                    safeText(
                        accident.impact,
                        "Unknown"
                    );


                const status =
                    safeText(
                        accident.status,
                        "UNKNOWN"
                    ).toUpperCase();


                const time =
                    formatTime(
                        accident.detected_at
                    );


                row.innerHTML = `

                    <strong>
                        ${escapeHtml(vehicle)}
                    </strong>

                    <span>
                        High impact accident
                    </span>

                    <span>
                        ${escapeHtml(time)}
                    </span>

                    <b class="critical">
                        ${escapeHtml(impact)}
                    </b>

                    <b class="pending">
                        ${escapeHtml(status)}
                    </b>

                `;


                row.addEventListener(

                    "click",

                    function () {

                        selectAccident(
                            accident
                        );

                    }

                );


                table.appendChild(
                    row
                );

            }

        );

    }


    // ============================================================
    // SELECT ACCIDENT
    // ============================================================

    function selectAccident(
        accident
    ) {

        if (!accident) {

            return;

        }


        currentAccident =
            accident;


        const accidentId =
            accident.accident_id ||
            accident.accidentId;


        lastAccidentId =
            accidentId;


        updateLiveAlertBanner(
            accident
        );


        updateAccidentVehicle(
            accident
        );


        updateAccidentImpact(
            accident.impact
        );


        updateAccidentSpeed(
            accident.speed
        );


        updateAccidentLocation(
            accident.latitude,
            accident.longitude
        );


        updateAccidentStatusFromBackend(
            accident.status
        );


        console.log(
            "Selected accident:",
            accident
        );

    }
    // ============================================================
// PART 2/5 — LIVE ACCIDENT DATA + DYNAMIC LIVE ALERTS
// ============================================================

function updateLiveAlertBanner(accident) {
    if (!accident) {
        return;
    }

    const severity = String(
        accident.severity ||
        accident.impact ||
        "UNKNOWN"
    ).toUpperCase();

    const vehicleId =
        accident.vehicle_id ||
        accident.vehicleId ||
        "UNKNOWN";

    const accidentId =
        accident.accident_id ||
        accident.accidentId ||
        "UNKNOWN";

    const latitude = Number(
        accident.latitude !== undefined
            ? accident.latitude
            : 0
    );

    const longitude = Number(
        accident.longitude !== undefined
            ? accident.longitude
            : 0
    );

    const speed = Number(
        accident.speed !== undefined
            ? accident.speed
            : 0
    );

    const impact = Number(
        accident.impact !== undefined
            ? accident.impact
            : 0
    );

    const status = String(
        accident.status || "ACTIVE"
    ).toUpperCase();

    const detectedAt =
        accident.detected_at ||
        accident.detectedAt ||
        new Date().toISOString();

    const gpsValid =
        accident.gpsValid === true ||
        accident.gps_valid === true ||
        (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude) &&
            latitude !== 0 &&
            longitude !== 0
        );

    // --------------------------------------------------------
    // SEVERITY
    // --------------------------------------------------------

    const liveSeverityLabel =
        document.getElementById("liveSeverityLabel");

    if (liveSeverityLabel) {
        liveSeverityLabel.textContent =
            severity === "HIGH"
                ? "CRITICAL EMERGENCY"
                : severity + " EMERGENCY";
    }

    const liveAlertTitle =
        document.getElementById("liveAlertTitle");

    if (liveAlertTitle) {
        liveAlertTitle.textContent =
            severity === "HIGH"
                ? "High Impact Accident Detected"
                : "Accident Detected";
    }

    // --------------------------------------------------------
    // DETECTED TIME
    // --------------------------------------------------------

    const liveDetectedTime =
        document.getElementById("liveDetectedTime");

    if (liveDetectedTime) {
        liveDetectedTime.textContent =
            formatTime(detectedAt);
    }

    const liveDetectedDate =
        document.getElementById("liveDetectedDate");

    if (liveDetectedDate) {
        liveDetectedDate.textContent =
            formatDate(detectedAt);
    }

    const liveTimelineDetected =
        document.getElementById("liveTimelineDetected");

    if (liveTimelineDetected) {
        liveTimelineDetected.textContent =
            formatTime(detectedAt);
    }

    // --------------------------------------------------------
    // VEHICLE INFORMATION
    // --------------------------------------------------------

    const liveVehicleHeading =
        document.getElementById("liveVehicleHeading");

    if (liveVehicleHeading) {
        liveVehicleHeading.textContent =
            "Vehicle " + vehicleId;
    }

    const liveVehicleId =
        document.getElementById("liveVehicleId");

    if (liveVehicleId) {
        liveVehicleId.textContent =
            vehicleId;
    }

    const liveAccidentId =
        document.getElementById("liveAccidentId");

    if (liveAccidentId) {
        liveAccidentId.textContent =
            accidentId;
    }

    // --------------------------------------------------------
    // IMPACT
    // --------------------------------------------------------

    const liveImpact =
        document.getElementById("liveImpact");

    if (liveImpact) {
        if (Number.isFinite(impact) && impact > 0) {
            liveImpact.textContent =
                impact.toFixed(0);
        } else {
            liveImpact.textContent =
                severity;
        }
    }

    // --------------------------------------------------------
    // SPEED
    // --------------------------------------------------------

    const liveSpeed =
        document.getElementById("liveSpeed");

    if (liveSpeed) {
        if (Number.isFinite(speed)) {
            liveSpeed.textContent =
                speed.toFixed(1) + " km/h";
        } else {
            liveSpeed.textContent =
                "0.0 km/h";
        }
    }

    // --------------------------------------------------------
    // GPS STATUS
    // --------------------------------------------------------

    const liveGpsStatus =
        document.getElementById("liveGpsStatus");

    if (liveGpsStatus) {
        liveGpsStatus.textContent =
            gpsValid
                ? "GPS RECEIVED"
                : "GPS NOT AVAILABLE";
    }

    const liveGpsModule =
        document.getElementById("liveGpsModule");

    if (liveGpsModule) {
        liveGpsModule.textContent =
            gpsValid
                ? "LOCATION RECEIVED"
                : "LOCATION NOT AVAILABLE";
    }

    const liveGpsModuleStatus =
        document.getElementById("liveGpsModuleStatus");

    if (liveGpsModuleStatus) {
        liveGpsModuleStatus.textContent =
            gpsValid
                ? "OK"
                : "WAITING";
    }

    // --------------------------------------------------------
    // GPS ACCURACY
    // --------------------------------------------------------

    const liveGpsAccuracy =
        document.getElementById("liveGpsAccuracy");

    if (liveGpsAccuracy) {
        if (gpsValid) {
            liveGpsAccuracy.textContent =
                "LOCATION RECEIVED";
        } else {
            liveGpsAccuracy.textContent =
                "GPS SIGNAL NOT AVAILABLE";
        }
    }

    // --------------------------------------------------------
    // SENSOR STATUS
    // --------------------------------------------------------

    const liveAccelerometer =
        document.getElementById("liveAccelerometer");

    const liveAccelerometerStatus =
        document.getElementById("liveAccelerometerStatus");

    if (liveAccelerometer) {
        liveAccelerometer.textContent =
            severity === "HIGH"
                ? "HIGH IMPACT"
                : "IMPACT DETECTED";
    }

    if (liveAccelerometerStatus) {
        liveAccelerometerStatus.textContent =
            "ALERT";
    }

    const liveGyroscope =
        document.getElementById("liveGyroscope");

    const liveGyroscopeStatus =
        document.getElementById("liveGyroscopeStatus");

    if (liveGyroscope) {
        liveGyroscope.textContent =
            "ABNORMAL";
    }

    if (liveGyroscopeStatus) {
        liveGyroscopeStatus.textContent =
            "ALERT";
    }

    const liveCommunication =
        document.getElementById("liveCommunication");

    const liveCommunicationStatus =
        document.getElementById("liveCommunicationStatus");

    if (liveCommunication) {
        liveCommunication.textContent =
            backendConnected
                ? "CONNECTED"
                : "DISCONNECTED";
    }

    if (liveCommunicationStatus) {
        liveCommunicationStatus.textContent =
            backendConnected
                ? "OK"
                : "ERROR";
    }

    // --------------------------------------------------------
    // MAP LOCATION
    // --------------------------------------------------------

    updateAccidentLocation(
        latitude,
        longitude,
        gpsValid
    );

    // --------------------------------------------------------
    // DASHBOARD
    // --------------------------------------------------------

    updateDashboardIncident(accident);

    updateIncidentBadge(status);

    updateDashboardStatistics();
}


// ============================================================
// UPDATE ACCIDENT LOCATION
// ============================================================

function updateAccidentLocation(
    latitude,
    longitude,
    gpsValid = false
) {
    const latValue =
        document.getElementById("latitudeValue");

    const lngValue =
        document.getElementById("longitudeValue");

    if (latValue) {
        if (
            gpsValid &&
            Number.isFinite(Number(latitude))
        ) {
            latValue.textContent =
                Number(latitude).toFixed(6);
        } else {
            latValue.textContent =
                "N/A";
        }
    }

    if (lngValue) {
        if (
            gpsValid &&
            Number.isFinite(Number(longitude))
        ) {
            lngValue.textContent =
                Number(longitude).toFixed(6);
        } else {
            lngValue.textContent =
                "N/A";
        }
    }

    // --------------------------------------------------------
    // UPDATE MAP IF MAP FUNCTION EXISTS
    // --------------------------------------------------------

    if (
        gpsValid &&
        Number.isFinite(Number(latitude)) &&
        Number.isFinite(Number(longitude))
    ) {
        const lat = Number(latitude);
        const lng = Number(longitude);

        if (
            typeof accidentMap !== "undefined" &&
            accidentMap
        ) {
            try {
                accidentMap.setView(
                    [lat, lng],
                    15
                );

                if (
                    typeof accidentMarker !== "undefined" &&
                    accidentMarker
                ) {
                    accidentMarker.setLatLng(
                        [lat, lng]
                    );
                }
            } catch (error) {
                console.log(
                    "Map update skipped:",
                    error
                );
            }
        }
    }
}


// ============================================================
// UPDATE VEHICLE
// ============================================================

function updateAccidentVehicle(accident) {
    if (!accident) {
        return;
    }

    const vehicleId =
        accident.vehicle_id ||
        accident.vehicleId ||
        "UNKNOWN";

    const accidentId =
        accident.accident_id ||
        accident.accidentId ||
        "UNKNOWN";

    // Live vehicle card
    const liveVehicleHeading =
        document.getElementById("liveVehicleHeading");

    if (liveVehicleHeading) {
        liveVehicleHeading.textContent =
            "Vehicle " + vehicleId;
    }

    const liveVehicleId =
        document.getElementById("liveVehicleId");

    if (liveVehicleId) {
        liveVehicleId.textContent =
            vehicleId;
    }

    const liveAccidentId =
        document.getElementById("liveAccidentId");

    if (liveAccidentId) {
        liveAccidentId.textContent =
            accidentId;
    }

    // Landing dashboard vehicle
    const dashboardLandingVehicleId =
        document.getElementById(
            "dashboardLandingVehicleId"
        );

    if (dashboardLandingVehicleId) {
        dashboardLandingVehicleId.textContent =
            vehicleId;
    }

    // Dashboard incident vehicle
    const dashboardIncidentVehicleId =
        document.getElementById(
            "dashboardIncidentVehicleId"
        );

    if (dashboardIncidentVehicleId) {
        dashboardIncidentVehicleId.textContent =
            vehicleId;
    }
}


// ============================================================
// UPDATE IMPACT
// ============================================================

function updateAccidentImpact(accident) {
    if (!accident) {
        return;
    }

    const impact =
        accident.impact;

    const severity =
        accident.severity ||
        accident.impact ||
        "UNKNOWN";

    const liveImpact =
        document.getElementById("liveImpact");

    if (liveImpact) {
        if (
            impact !== undefined &&
            impact !== null &&
            !isNaN(Number(impact))
        ) {
            liveImpact.textContent =
                Number(impact).toFixed(0);
        } else {
            liveImpact.textContent =
                String(severity).toUpperCase();
        }
    }

    const dashboardImpact =
        document.querySelector(
            ".incident-info .danger-text"
        );

    if (dashboardImpact) {
        dashboardImpact.textContent =
            String(severity).toUpperCase();
    }
}


// ============================================================
// UPDATE SPEED
// ============================================================

function updateAccidentSpeed(accident) {
    if (!accident) {
        return;
    }

    const speed =
        Number(accident.speed || 0);

    const liveSpeed =
        document.getElementById("liveSpeed");

    if (liveSpeed) {
        liveSpeed.textContent =
            speed.toFixed(1) + " km/h";
    }
}


// ============================================================
// LOAD CURRENT ACCIDENT
// ============================================================

async function loadCurrentAccident() {
    try {
        const response =
            await fetch(
                CURRENT_ACCIDENT_API,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                "HTTP " + response.status
            );
        }

        const data =
            await response.json();

        backendConnected = true;

        // ----------------------------------------------------
        // NO CURRENT ACCIDENT
        // ----------------------------------------------------

        if (
            !data ||
            data.success === false ||
            !data.accident
        ) {
            currentAccident = null;

            updateDashboardStatistics();

            return;
        }

        const accident =
            data.accident;

        // ----------------------------------------------------
        // DETECT NEW ACCIDENT
        // ----------------------------------------------------

        const accidentId =
            accident.id ||
            accident.accident_id;

        const previousId =
            currentAccident
                ? (
                    currentAccident.id ||
                    currentAccident.accident_id
                )
                : null;

        const isNewAccident =
            accidentId !== previousId;

        currentAccident =
            accident;

        // ----------------------------------------------------
        // UPDATE ALL LIVE INFORMATION
        // ----------------------------------------------------

        updateLiveAlertBanner(
            accident
        );

        updateAccidentVehicle(
            accident
        );

        updateAccidentImpact(
            accident
        );

        updateAccidentSpeed(
            accident
        );

        // ----------------------------------------------------
        // NEW ACCIDENT
        // ----------------------------------------------------

        if (isNewAccident) {
            responseStep = 0;
            incidentStatus = "ACTIVE";

            updateResponseTimeline(
                0
            );

            updateResponseButton();

            // Only trigger visual alert
            // after the first real accident.
            if (
                previousId !== null
            ) {
                triggerEmergencyAlert(
                    accident
                );
            }
        }

        updateIncidentBadge(
            accident.status ||
            "ACTIVE"
        );

    } catch (error) {

        backendConnected = false;

        console.error(
            "Current accident load failed:",
            error
        );
    }
}


// ============================================================
// UPDATE DASHBOARD INCIDENT
// ============================================================

function updateDashboardIncident(accident) {
    if (!accident) {
        return;
    }

    const vehicleId =
        accident.vehicle_id ||
        accident.vehicleId ||
        "UNKNOWN";

    const severity =
        accident.severity ||
        accident.impact ||
        "UNKNOWN";

    const detectedAt =
        accident.detected_at ||
        accident.detectedAt ||
        new Date().toISOString();

    const dashboardVehicle =
        document.getElementById(
            "dashboardIncidentVehicleId"
        );

    if (dashboardVehicle) {
        dashboardVehicle.textContent =
            vehicleId;
    }

    const dashboardLandingVehicle =
        document.getElementById(
            "dashboardLandingVehicleId"
        );

    if (dashboardLandingVehicle) {
        dashboardLandingVehicle.textContent =
            vehicleId;
    }

    // Update visible incident time
    const incidentTimeElements =
        document.querySelectorAll(
            ".incident-info strong"
        );

    incidentTimeElements.forEach(
        function (element) {

            const text =
                element.textContent
                    .trim();

            if (
                text === "10:42 PM" ||
                text === "10:42:16 PM"
            ) {
                element.textContent =
                    formatTime(detectedAt);
            }
        }
    );

    // Update danger text
    const dangerElements =
        document.querySelectorAll(
            ".danger-text"
        );

    dangerElements.forEach(
        function (element) {
            element.textContent =
                String(
                    severity
                ).toUpperCase();
        }
    );
}


// ============================================================
// UPDATE DASHBOARD STATISTICS
// ============================================================

function updateDashboardStatistics() {

    const total =
        allAccidents.length;

    const active =
        allAccidents.filter(
            function (accident) {
                return String(
                    accident.status || ""
                ).toUpperCase() === "ACTIVE";
            }
        ).length;

    const acknowledged =
        allAccidents.filter(
            function (accident) {
                return String(
                    accident.status || ""
                ).toUpperCase() === "ACKNOWLEDGED";
            }
        ).length;

    const resolved =
        allAccidents.filter(
            function (accident) {
                return String(
                    accident.status || ""
                ).toUpperCase() === "RESOLVED";
            }
        ).length;

    // --------------------------------------------------------
    // FIND NUMBER-ONLY STATISTIC ELEMENTS
    // --------------------------------------------------------

    const statisticNumbers =
        document.querySelectorAll(
            ".stat-number, .stat-value, .dashboard-stat"
        );

    // Keep this conservative.
    // Existing HTML may have different statistics.
    if (statisticNumbers.length >= 4) {

        if (statisticNumbers[0]) {
            statisticNumbers[0].textContent =
                String(total);
        }

        if (statisticNumbers[1]) {
            statisticNumbers[1].textContent =
                String(active);
        }

        if (statisticNumbers[2]) {
            statisticNumbers[2].textContent =
                String(acknowledged);
        }

        if (statisticNumbers[3]) {
            statisticNumbers[3].textContent =
                String(resolved);
        }
    }

    // --------------------------------------------------------
    // UPDATE COMMON ID-BASED COUNTERS IF PRESENT
    // --------------------------------------------------------

    const totalElement =
        document.getElementById(
            "totalAccidents"
        );

    if (totalElement) {
        totalElement.textContent =
            String(total);
    }

    const activeElement =
        document.getElementById(
            "activeAccidents"
        );

    if (activeElement) {
        activeElement.textContent =
            String(active);
    }

    const resolvedElement =
        document.getElementById(
            "resolvedAccidents"
        );

    if (resolvedElement) {
        resolvedElement.textContent =
            String(resolved);
    }
}


// ============================================================
// REFRESH EVERYTHING
// ============================================================

async function refreshAccidentData() {

    await loadAccidentHistory();

    await loadCurrentAccident();

    updateDashboardStatistics();

    if (currentAccident) {
        updateLiveAlertBanner(
            currentAccident
        );
    }
}


// ============================================================
// START ACCIDENT MONITORING
// ============================================================

function startAccidentMonitoring() {

    console.log(
        "Starting accident monitoring..."
    );

    // First load
    refreshAccidentData();

    // Poll backend every 3 seconds
    setInterval(
        function () {
            refreshAccidentData();
        },
        3000
    );
}


// ============================================================
// BACKEND CONNECTION TEST
// ============================================================

async function testBackendConnection() {

    try {

        const response =
            await fetch(
                ACCIDENTS_API,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                "HTTP " +
                response.status
            );
        }

        backendConnected = true;

        console.log(
            "✓ Backend connected"
        );

        return true;

    } catch (error) {

        backendConnected = false;

        console.error(
            "✗ Backend connection failed:",
            error
        );

        return false;
    }
}


// ============================================================
// AUTO START
// ============================================================

testBackendConnection();

startAccidentMonitoring();


// ============================================================
// END OF PART 2
// ============================================================
// ============================================================
// PART 3/5 — MAP + RECENT ALERTS + ACCIDENT SELECTION
// ============================================================


// ============================================================
// MAP VARIABLES
// ============================================================




// ============================================================
// INITIALIZE MAP
// ============================================================

function initializeAccidentMap() {

    // If Leaflet is not loaded, skip map initialization.
    if (
        typeof L === "undefined"
    ) {
        console.log(
            "Leaflet is not available."
        );

        return;
    }

    // Find map container.
    const mapContainer =
        document.getElementById(
            "accidentMap"
        );

    if (!mapContainer) {
        console.log(
            "Map container not found."
        );

        return;
    }

    // Prevent duplicate initialization.
    if (accidentMap) {
        return;
    }

    try {

        // Default location.
        const defaultLatitude =
            17.3850;

        const defaultLongitude =
            78.4867;

        accidentMap =
            L.map(
                "accidentMap"
            ).setView(
                [
                    defaultLatitude,
                    defaultLongitude
                ],
                13
            );

        // OpenStreetMap tiles.
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,
                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        ).addTo(
            accidentMap
        );

        console.log(
            "✓ Accident map initialized"
        );

        // If accident data already exists,
        // display it immediately.
        if (currentAccident) {

            const latitude =
                Number(
                    currentAccident.latitude
                );

            const longitude =
                Number(
                    currentAccident.longitude
                );

            if (
                Number.isFinite(latitude) &&
                Number.isFinite(longitude) &&
                latitude !== 0 &&
                longitude !== 0
            ) {

                updateMapMarker(
                    latitude,
                    longitude
                );
            }
        }

    } catch (error) {

        console.error(
            "Map initialization failed:",
            error
        );
    }
}


// ============================================================
// UPDATE MAP MARKER
// ============================================================

function updateMapMarker(
    latitude,
    longitude
) {

    if (!accidentMap) {
        return;
    }

    if (
        !Number.isFinite(
            Number(latitude)
        ) ||
        !Number.isFinite(
            Number(longitude)
        )
    ) {
        return;
    }

    const lat =
        Number(latitude);

    const lng =
        Number(longitude);

    // Ignore invalid GPS coordinates.
    if (
        lat === 0 &&
        lng === 0
    ) {
        return;
    }

    try {

        accidentMap.setView(
            [lat, lng],
            16
        );

        if (accidentMarker) {

            accidentMarker.setLatLng(
                [lat, lng]
            );

        } else {

            accidentMarker =
                L.marker(
                    [lat, lng]
                ).addTo(
                    accidentMap
                );

            accidentMarker.bindPopup(
                "<b>Accident Location</b><br>" +
                "Vehicle: " +
                safeText(
                    currentAccident
                        ? (
                            currentAccident.vehicle_id ||
                            currentAccident.vehicleId ||
                            "UNKNOWN"
                        )
                        : "UNKNOWN"
                )
            );
        }

        console.log(
            "Map updated:",
            lat,
            lng
        );

    } catch (error) {

        console.error(
            "Map marker update failed:",
            error
        );
    }
}


// ============================================================
// PATCH LOCATION FUNCTION
// ============================================================

function updateAccidentLocation(
    latitude,
    longitude,
    gpsValid = false
) {

    const latValue =
        document.getElementById(
            "latitudeValue"
        );

    const lngValue =
        document.getElementById(
            "longitudeValue"
        );

    if (latValue) {

        if (
            gpsValid &&
            Number.isFinite(
                Number(latitude)
            )
        ) {

            latValue.textContent =
                Number(latitude)
                    .toFixed(6);

        } else {

            latValue.textContent =
                "N/A";
        }
    }

    if (lngValue) {

        if (
            gpsValid &&
            Number.isFinite(
                Number(longitude)
            )
        ) {

            lngValue.textContent =
                Number(longitude)
                    .toFixed(6);

        } else {

            lngValue.textContent =
                "N/A";
        }
    }

    if (
        gpsValid &&
        Number.isFinite(
            Number(latitude)
        ) &&
        Number.isFinite(
            Number(longitude)
        )
    ) {

        updateMapMarker(
            Number(latitude),
            Number(longitude)
        );
    }
}


// ============================================================
// CREATE RECENT ALERT ROW
// ============================================================

function createRecentAlertRow(
    accident
) {

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "recent-alert-row";

    row.style.cursor =
        "pointer";

    const vehicleId =
        accident.vehicle_id ||
        accident.vehicleId ||
        "UNKNOWN";

    const accidentId =
        accident.accident_id ||
        accident.accidentId ||
        "UNKNOWN";

    const severity =
        accident.severity ||
        (
            typeof accident.impact === "string"
                ? accident.impact
                : "UNKNOWN"
        );

    const status =
        accident.status ||
        "ACTIVE";

    const detectedAt =
        accident.detected_at ||
        accident.detectedAt ||
        new Date().toISOString();

    const speed =
        Number(
            accident.speed || 0
        );

    row.innerHTML = `
        <div>
            <strong>${safeText(vehicleId)}</strong>
            <small>${safeText(accidentId)}</small>
        </div>

        <div>
            <span class="alert-severity">
                ${safeText(
                    String(severity).toUpperCase()
                )}
            </span>
        </div>

        <div>
            ${speed.toFixed(1)} km/h
        </div>

        <div>
            ${safeText(
                formatTime(detectedAt)
            )}
        </div>

        <div>
            <span class="alert-status">
                ${safeText(
                    String(status).toUpperCase()
                )}
            </span>
        </div>
    `;

    // Select this accident when clicked.
    row.addEventListener(
        "click",
        function () {

            selectAccident(
                accident
            );
        }
    );

    return row;
}


// ============================================================
// RENDER RECENT ACCIDENTS
// ============================================================

function renderRecentAccidents(
    accidents
) {

    if (
        !Array.isArray(
            accidents
        )
    ) {
        return;
    }

    // Find possible recent alert containers.
    const containers =
        document.querySelectorAll(
            ".recent-alerts-list, " +
            ".recent-alerts, " +
            "#recentAlerts, " +
            "#recentAccidents"
        );

    if (
        containers.length === 0
    ) {

        console.log(
            "Recent alerts container not found."
        );

        return;
    }

    const latestAccidents =
        accidents.slice(
            0,
            5
        );

    containers.forEach(
        function (container) {

            // Do not destroy a container
            // that is clearly not a list.
            if (
                !container ||
                container.tagName === "TABLE"
            ) {
                return;
            }

            container.innerHTML = "";

            if (
                latestAccidents.length === 0
            ) {

                const emptyMessage =
                    document.createElement(
                        "div"
                    );

                emptyMessage.textContent =
                    "No accident alerts available.";

                container.appendChild(
                    emptyMessage
                );

                return;
            }

            latestAccidents.forEach(
                function (accident) {

                    const row =
                        createRecentAlertRow(
                            accident
                        );

                    container.appendChild(
                        row
                    );
                }
            );
        }
    );
}


// ============================================================
// UPDATE EXISTING TABLE ROWS
// ============================================================

function renderAccidentTable(
    accidents
) {

    if (
        !Array.isArray(
            accidents
        )
    ) {
        return;
    }

    const tables =
        document.querySelectorAll(
            "table"
        );

    if (
        tables.length === 0
    ) {
        return;
    }

    // Find the table that looks like
    // an accident/recent-alert table.
    let targetTable = null;

    tables.forEach(
        function (table) {

            if (targetTable) {
                return;
            }

            const text =
                table.textContent
                    .toLowerCase();

            if (
                text.includes("vehicle") ||
                text.includes("accident") ||
                text.includes("severity") ||
                text.includes("status")
            ) {
                targetTable =
                    table;
            }
        }
    );

    if (!targetTable) {
        return;
    }

    const tbody =
        targetTable.querySelector(
            "tbody"
        );

    if (!tbody) {
        return;
    }

    const latestAccidents =
        accidents.slice(
            0,
            5
        );

    tbody.innerHTML = "";

    latestAccidents.forEach(
        function (accident) {

            const row =
                document.createElement(
                    "tr"
                );

            const vehicleId =
                accident.vehicle_id ||
                accident.vehicleId ||
                "UNKNOWN";

            const accidentId =
                accident.accident_id ||
                accident.accidentId ||
                "UNKNOWN";

            const severity =
                accident.severity ||
                (
                    typeof accident.impact === "string"
                        ? accident.impact
                        : "UNKNOWN"
                );

            const status =
                accident.status ||
                "ACTIVE";

            const detectedAt =
                accident.detected_at ||
                accident.detectedAt ||
                new Date().toISOString();

            const speed =
                Number(
                    accident.speed || 0
                );

            row.innerHTML = `
                <td>${safeText(vehicleId)}</td>
                <td>${safeText(accidentId)}</td>
                <td>
                    ${safeText(
                        String(severity).toUpperCase()
                    )}
                </td>
                <td>
                    ${speed.toFixed(1)} km/h
                </td>
                <td>
                    ${safeText(
                        formatTime(detectedAt)
                    )}
                </td>
                <td>
                    ${safeText(
                        String(status).toUpperCase()
                    )}
                </td>
            `;

            row.style.cursor =
                "pointer";

            row.addEventListener(
                "click",
                function () {

                    selectAccident(
                        accident
                    );
                }
            );

            tbody.appendChild(
                row
            );
        }
    );
}


// ============================================================
// SELECT ACCIDENT
// ============================================================

function selectAccident(
    accident
) {

    if (!accident) {
        return;
    }

    currentAccident =
        accident;

    console.log(
        "Selected accident:",
        accident
    );

    // Update live dashboard.
    updateLiveAlertBanner(
        accident
    );

    updateAccidentVehicle(
        accident
    );

    updateAccidentImpact(
        accident
    );

    updateAccidentSpeed(
        accident
    );

    // Update map.
    const latitude =
        Number(
            accident.latitude
        );

    const longitude =
        Number(
            accident.longitude
        );

    if (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude !== 0 &&
        longitude !== 0
    ) {

        updateMapMarker(
            latitude,
            longitude
        );
    }

    // Open Live Alerts page.
    showLiveAlerts();

    // Scroll to top.
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ============================================================
// OPEN GOOGLE MAPS LOCATION
// ============================================================

function openAccidentLocation() {

    if (!currentAccident) {

        showMessage(
            "No accident location available.",
            "warning"
        );

        return;
    }

    const latitude =
        Number(
            currentAccident.latitude
        );

    const longitude =
        Number(
            currentAccident.longitude
        );

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude === 0 ||
        longitude === 0
    ) {

        showMessage(
            "GPS location is not available.",
            "warning"
        );

        return;
    }

    const mapUrl =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
            latitude + "," + longitude
        );

    window.open(
        mapUrl,
        "_blank"
    );
}


// ============================================================
// ATTACH MAP BUTTON
// ============================================================

function attachMapButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-action='open-map'], " +
            "#openMapButton, " +
            ".open-map-button"
        );

    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    openAccidentLocation();
                }
            );
        }
    );
}


// ============================================================
// UPDATE GPS LINK
// ============================================================

function updateGpsLink(
    latitude,
    longitude
) {

    const links =
        document.querySelectorAll(
            "a[data-gps-link], " +
            "#gpsLocationLink"
        );

    links.forEach(
        function (link) {

            if (
                Number.isFinite(
                    Number(latitude)
                ) &&
                Number.isFinite(
                    Number(longitude)
                ) &&
                Number(latitude) !== 0 &&
                Number(longitude) !== 0
            ) {

                const url =
                    "https://www.google.com/maps/search/?api=1&query=" +
                    Number(latitude) +
                    "," +
                    Number(longitude);

                link.href =
                    url;

                link.target =
                    "_blank";

                link.textContent =
                    "View Location";

            } else {

                link.removeAttribute(
                    "href"
                );

                link.textContent =
                    "GPS Not Available";
            }
        }
    );
}


// ============================================================
// PATCH LOCATION UPDATE
// ============================================================

const originalUpdateAccidentLocation =
    updateAccidentLocation;

updateAccidentLocation =
    function (
        latitude,
        longitude,
        gpsValid = false
    ) {

        originalUpdateAccidentLocation(
            latitude,
            longitude,
            gpsValid
        );

        updateGpsLink(
            latitude,
            longitude
        );
    };


// ============================================================
// INITIALIZE MAP AFTER PAGE LOAD
// ============================================================

setTimeout(
    function () {

        initializeAccidentMap();

        attachMapButtons();

    },
    500
);


// ============================================================
// END OF PART 3
// ============================================================
// ============================================================
// PART 4/5 — UI HELPERS + NOTIFICATIONS + LOGIN POLISH
// ============================================================


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(
    message,
    type = "info"
) {

    // Remove old message if present.
    const oldMessage =
        document.querySelector(
            ".system-message"
        );

    if (oldMessage) {
        oldMessage.remove();
    }

    const messageBox =
        document.createElement(
            "div"
        );

    messageBox.className =
        "system-message";

    messageBox.textContent =
        message;

    // Basic positioning.
    messageBox.style.position =
        "fixed";

    messageBox.style.top =
        "20px";

    messageBox.style.right =
        "20px";

    messageBox.style.zIndex =
        "99999";

    messageBox.style.padding =
        "14px 20px";

    messageBox.style.borderRadius =
        "10px";

    messageBox.style.fontSize =
        "14px";

    messageBox.style.fontWeight =
        "600";

    messageBox.style.maxWidth =
        "360px";

    messageBox.style.boxShadow =
        "0 8px 25px rgba(0,0,0,0.25)";

    if (type === "success") {

        messageBox.style.background =
            "#16a34a";

        messageBox.style.color =
            "#ffffff";

    } else if (type === "error") {

        messageBox.style.background =
            "#dc2626";

        messageBox.style.color =
            "#ffffff";

    } else if (type === "warning") {

        messageBox.style.background =
            "#f59e0b";

        messageBox.style.color =
            "#ffffff";

    } else {

        messageBox.style.background =
            "#2563eb";

        messageBox.style.color =
            "#ffffff";
    }

    document.body.appendChild(
        messageBox
    );

    setTimeout(
        function () {

            if (messageBox) {
                messageBox.remove();
            }

        },
        4000
    );
}


// ============================================================
// UPDATE BACKEND CONNECTION INDICATOR
// ============================================================

function updateConnectionIndicator() {

    const indicators =
        document.querySelectorAll(
            "#backendStatus, " +
            ".backend-status, " +
            "[data-backend-status]"
        );

    indicators.forEach(
        function (element) {

            if (backendConnected) {

                element.textContent =
                    "BACKEND CONNECTED";

                element.classList.remove(
                    "offline",
                    "disconnected",
                    "error"
                );

                element.classList.add(
                    "online",
                    "connected"
                );

            } else {

                element.textContent =
                    "BACKEND DISCONNECTED";

                element.classList.remove(
                    "online",
                    "connected"
                );

                element.classList.add(
                    "offline",
                    "disconnected"
                );
            }
        }
    );
}


// ============================================================
// CONNECTION STATUS CHECK
// ============================================================

setInterval(
    function () {

        updateConnectionIndicator();

    },
    2000
);


// ============================================================
// LIVE ALERT REFRESH BUTTON
// ============================================================

function attachRefreshButtons() {

    const buttons =
        document.querySelectorAll(
            "#refreshAlertsButton, " +
            ".refresh-alerts, " +
            "[data-action='refresh']"
        );

    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function (event) {

                    event.preventDefault();

                    button.disabled =
                        true;

                    const oldText =
                        button.textContent;

                    button.textContent =
                        "Refreshing...";

                    try {

                        await refreshAccidentData();

                        showMessage(
                            "Accident data refreshed.",
                            "success"
                        );

                    } catch (error) {

                        console.error(
                            error
                        );

                        showMessage(
                            "Unable to refresh accident data.",
                            "error"
                        );

                    } finally {

                        button.disabled =
                            false;

                        button.textContent =
                            oldText;
                    }
                }
            );
        }
    );
}


// ============================================================
// LIVE ALERT SOUND
// ============================================================

let alertAudioContext = null;


// ============================================================
// PLAY ALERT SOUND
// ============================================================

function playAlertSound() {

    try {

        if (
            !window.AudioContext &&
            !window.webkitAudioContext
        ) {
            return;
        }

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!alertAudioContext) {

            alertAudioContext =
                new AudioContextClass();
        }

        const oscillator =
            alertAudioContext
                .createOscillator();

        const gainNode =
            alertAudioContext
                .createGain();

        oscillator.type =
            "sine";

        oscillator.frequency.value =
            880;

        gainNode.gain.value =
            0.08;

        oscillator.connect(
            gainNode
        );

        gainNode.connect(
            alertAudioContext.destination
        );

        oscillator.start();

        setTimeout(
            function () {

                oscillator.stop();

            },
            250
        );

    } catch (error) {

        console.log(
            "Alert sound unavailable:",
            error
        );
    }
}


// ============================================================
// ENHANCED EMERGENCY ALERT
// ============================================================

const originalTriggerEmergencyAlert =
    triggerEmergencyAlert;

triggerEmergencyAlert =
    function (
        accident
    ) {

        try {

            playAlertSound();

        } catch (error) {

            console.log(
                "Sound error:",
                error
            );
        }

        originalTriggerEmergencyAlert(
            accident
        );
    };


// ============================================================
// ALERT STATUS TEXT
// ============================================================

function updateAlertStatusText(
    status
) {

    const normalizedStatus =
        String(
            status || "ACTIVE"
        ).toUpperCase();

    const elements =
        document.querySelectorAll(
            "#liveAlertStatus, " +
            ".live-alert-status, " +
            "[data-alert-status]"
        );

    elements.forEach(
        function (element) {

            element.textContent =
                normalizedStatus;

            element.classList.remove(
                "active",
                "acknowledged",
                "resolved"
            );

            if (
                normalizedStatus ===
                "ACTIVE"
            ) {

                element.classList.add(
                    "active"
                );

            } else if (
                normalizedStatus ===
                "ACKNOWLEDGED"
            ) {

                element.classList.add(
                    "acknowledged"
                );

            } else if (
                normalizedStatus ===
                "RESOLVED"
            ) {

                element.classList.add(
                    "resolved"
                );
            }
        }
    );
}


// ============================================================
// UPDATE INCIDENT BADGE PATCH
// ============================================================

const originalUpdateIncidentBadge =
    updateIncidentBadge;

updateIncidentBadge =
    function (
        status
    ) {

        originalUpdateIncidentBadge(
            status
        );

        updateAlertStatusText(
            status
        );
    };


// ============================================================
// RESPONSE BUTTON VISUAL UPDATE
// ============================================================

const originalUpdateResponseButton =
    updateResponseButton;

updateResponseButton =
    function () {

        originalUpdateResponseButton();

        const button =
            document.getElementById(
                "liveRespondButton"
            );

        if (!button) {
            return;
        }

        if (
            responseStep >=
            responseStates.length
        ) {

            button.textContent =
                "Response Complete";

            button.disabled =
                true;

            return;
        }

        if (
            incidentStatus ===
            "RESOLVED"
        ) {

            button.textContent =
                "Incident Resolved";

            button.disabled =
                true;

            return;
        }

        button.disabled =
            false;
    };


// ============================================================
// RESPONSE BUTTON CLICK PATCH
// ============================================================




// ============================================================
// LOGOUT CONFIRMATION
// ============================================================

const originalLogout =
    logout;

logout =
    function () {

        const confirmed =
            window.confirm(
                "Are you sure you want to logout?"
            );

        if (!confirmed) {
            return;
        }

        originalLogout();

    };


// ============================================================
// LOGIN VALIDATION
// ============================================================

function validateLoginFields() {

    const usernameInput =
        document.getElementById(
            "username"
        );

    const passwordInput =
        document.getElementById(
            "password"
        );

    if (
        !usernameInput ||
        !passwordInput
    ) {
        return false;
    }

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;

    if (!username) {

        showMessage(
            "Please enter your department ID.",
            "warning"
        );

        usernameInput.focus();

        return false;
    }

    if (!password) {

        showMessage(
            "Please enter your password.",
            "warning"
        );

        passwordInput.focus();

        return false;
    }

    return true;
}


// ============================================================
// LOGIN FORM PATCH
// ============================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            if (
                !validateLoginFields()
            ) {
                return;
            }

            const usernameInput =
                document.getElementById(
                    "username"
                );

            const passwordInput =
                document.getElementById(
                    "password"
                );

            const username =
                usernameInput.value
                    .trim()
                    .toUpperCase();

            const password =
                passwordInput.value;

            const account =
                credentials[username];

            if (
                !account ||
                account.password !==
                password
            ) {

                showMessage(
                    "Invalid department ID or password.",
                    "error"
                );

                passwordInput.value =
                    "";

                passwordInput.focus();

                return;
            }

            currentUser =
                account;

            localStorage.setItem(
                "accidentAlertUser",
                JSON.stringify(
                    {
                        username:
                            username,
                        department:
                            account.department
                    }
                )
            );

            if (
                loginModal
            ) {

                loginModal.style.display =
                    "none";
            }

            showDashboard();

            showMessage(
                "Welcome, " +
                account.department +
                ".",
                "success"
            );

            // Start backend monitoring
            // after successful login.
            refreshAccidentData();
        }
    );
}


// ============================================================
// RESTORE LOGIN SESSION
// ============================================================

function restoreLoginSession() {

    try {

        const savedUser =
            localStorage.getItem(
                "accidentAlertUser"
            );

        if (!savedUser) {
            return;
        }

        const parsed =
            JSON.parse(
                savedUser
            );

        if (
            parsed &&
            parsed.username &&
            credentials[
                parsed.username
            ]
        ) {

            currentUser =
                credentials[
                    parsed.username
                ];

            if (loginModal) {
                loginModal.style.display =
                    "none";
            }

            showDashboard();

            console.log(
                "Previous login session restored."
            );
        }

    } catch (error) {

        console.error(
            "Session restore failed:",
            error
        );

        localStorage.removeItem(
            "accidentAlertUser"
        );
    }
}


// ============================================================
// PAGE VISIBILITY REFRESH
// ============================================================

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            refreshAccidentData();
        }
    }
);


// ============================================================
// ONLINE / OFFLINE EVENTS
// ============================================================

window.addEventListener(
    "online",
    function () {

        console.log(
            "Browser network connection restored."
        );

        showMessage(
            "Network connection restored.",
            "success"
        );

        testBackendConnection();

        refreshAccidentData();
    }
);


window.addEventListener(
    "offline",
    function () {

        console.log(
            "Browser network connection lost."
        );

        showMessage(
            "Browser network connection lost.",
            "warning"
        );

    }
);


// ============================================================
// INITIALIZE EXTRA UI
// ============================================================

setTimeout(
    function () {

        attachRefreshButtons();

        restoreLoginSession();

        updateConnectionIndicator();

    },
    800
);


// ============================================================
// PERIODIC BACKEND CONNECTION STATUS
// ============================================================

setInterval(
    async function () {

        await testBackendConnection();

        updateConnectionIndicator();

    },
    10000
);


// ============================================================
// END OF PART 4
// ============================================================
// ============================================================
// PART 5/5 — FINAL INITIALIZATION + SAFETY CHECKS
// ============================================================


// ============================================================
// UPDATE PAGE TITLE / DEPARTMENT
// ============================================================

function updateDepartmentUI() {

    if (!currentUser) {
        return;
    }

    const department =
        currentUser.department ||
        "Emergency Department";

    const departmentElements =
        document.querySelectorAll(
            "#departmentName, " +
            ".department-name, " +
            "[data-department]"
        );

    departmentElements.forEach(
        function (element) {

            element.textContent =
                department;
        }
    );
}


// ============================================================
// UPDATE USER INFORMATION
// ============================================================

function updateUserUI() {

    if (!currentUser) {
        return;
    }

    const username =
        currentUser.username ||
        "";

    const department =
        currentUser.department ||
        "";

    const userElements =
        document.querySelectorAll(
            "#loggedInUser, " +
            ".logged-in-user, " +
            "[data-user]"
        );

    userElements.forEach(
        function (element) {

            element.textContent =
                username;
        }
    );

    const departmentElements =
        document.querySelectorAll(
            "#loggedInDepartment, " +
            ".logged-in-department, " +
            "[data-user-department]"
        );

    departmentElements.forEach(
        function (element) {

            element.textContent =
                department;
        }
    );
}


// ============================================================
// PATCH SHOW DASHBOARD
// ============================================================

const originalShowDashboard =
    showDashboard;

showDashboard =
    function () {

        originalShowDashboard();

        updateDepartmentUI();

        updateUserUI();

        // Refresh backend data when
        // dashboard becomes visible.
        refreshAccidentData();
    };


// ============================================================
// PATCH SHOW LIVE ALERTS
// ============================================================

const originalShowLiveAlerts =
    showLiveAlerts;

showLiveAlerts =
    function () {

        originalShowLiveAlerts();

        if (currentAccident) {

            updateLiveAlertBanner(
                currentAccident
            );

            updateAccidentVehicle(
                currentAccident
            );

            updateAccidentImpact(
                currentAccident
            );

            updateAccidentSpeed(
                currentAccident
            );
        }

        // Give Leaflet time to calculate
        // the visible map size.
        setTimeout(
            function () {

                if (
                    accidentMap &&
                    typeof accidentMap.invalidateSize ===
                    "function"
                ) {

                    accidentMap.invalidateSize();
                }

            },
            300
        );
    };


// ============================================================
// PATCH SHOW DASHBOARD MAIN
// ============================================================

const originalShowDashboardMain =
    showDashboardMain;

showDashboardMain =
    function () {

        originalShowDashboardMain();

        updateDepartmentUI();

        updateUserUI();

        refreshAccidentData();
    };


// ============================================================
// HANDLE ESCAPE KEY
// ============================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }

        // Close login modal.
        if (
            loginModal &&
            loginModal.style.display !==
            "none"
        ) {

            loginModal.style.display =
                "none";
        }

        // Close emergency modal if
        // the original page has one.
        const modals =
            document.querySelectorAll(
                ".modal, .popup, .dialog"
            );

        modals.forEach(
            function (modal) {

                if (
                    modal.classList.contains(
                        "close-on-escape"
                    )
                ) {

                    modal.style.display =
                        "none";
                }
            }
        );
    }
);


// ============================================================
// HANDLE BACKEND DATA CHANGES
// ============================================================

let previousBackendAccidentId =
    null;

function detectBackendAccidentChange() {

    if (!currentAccident) {
        return;
    }

    const currentId =
        currentAccident.id ||
        currentAccident.accident_id ||
        currentAccident.accidentId;

    if (
        previousBackendAccidentId ===
        null
    ) {

        previousBackendAccidentId =
            currentId;

        return;
    }

    if (
        currentId !==
        previousBackendAccidentId
    ) {

        console.log(
            "New accident detected:",
            currentId
        );

        previousBackendAccidentId =
            currentId;
    }
}


// ============================================================
// CHECK DATA CHANGES EVERY 3 SECONDS
// ============================================================

setInterval(
    function () {

        detectBackendAccidentChange();

    },
    3000
);


// ============================================================
// GPS DATA MONITOR
// ============================================================

function monitorGpsData() {

    if (!currentAccident) {
        return;
    }

    const latitude =
        Number(
            currentAccident.latitude
        );

    const longitude =
        Number(
            currentAccident.longitude
        );

    const gpsValid =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude !== 0 &&
        longitude !== 0;

    const gpsStatus =
        document.getElementById(
            "liveGpsStatus"
        );

    if (gpsStatus) {

        gpsStatus.textContent =
            gpsValid
                ? "GPS RECEIVED"
                : "GPS NOT AVAILABLE";
    }
}


// ============================================================
// GPS CHECK EVERY 5 SECONDS
// ============================================================

setInterval(
    function () {

        monitorGpsData();

    },
    5000
);


// ============================================================
// PREVENT INVALID ACCIDENT DATA
// ============================================================

function sanitizeAccidentData(
    accident
) {

    if (!accident) {
        return null;
    }

    const sanitized =
        Object.assign(
            {},
            accident
        );

    sanitized.vehicle_id =
        String(
            sanitized.vehicle_id ||
            sanitized.vehicleId ||
            "UNKNOWN"
        );

    sanitized.accident_id =
        String(
            sanitized.accident_id ||
            sanitized.accidentId ||
            "UNKNOWN"
        );

    sanitized.latitude =
        Number(
            sanitized.latitude || 0
        );

    sanitized.longitude =
        Number(
            sanitized.longitude || 0
        );

    sanitized.speed =
        Number(
            sanitized.speed || 0
        );

    sanitized.impact =
        sanitized.impact !== undefined
            ? sanitized.impact
            : "UNKNOWN";

    sanitized.status =
        String(
            sanitized.status ||
            "ACTIVE"
        ).toUpperCase();

    return sanitized;
}


// ============================================================
// PATCH CURRENT ACCIDENT LOADER
// ============================================================

const originalLoadCurrentAccident =
    loadCurrentAccident;

loadCurrentAccident =
    async function () {

        await originalLoadCurrentAccident();

        if (currentAccident) {

            currentAccident =
                sanitizeAccidentData(
                    currentAccident
                );

            updateLiveAlertBanner(
                currentAccident
            );

            updateAccidentVehicle(
                currentAccident
            );

            updateAccidentImpact(
                currentAccident
            );

            updateAccidentSpeed(
                currentAccident
            );
        }
    };


// ============================================================
// PATCH ACCIDENT HISTORY LOADER
// ============================================================

const originalLoadAccidentHistory =
    loadAccidentHistory;

loadAccidentHistory =
    async function () {

        await originalLoadAccidentHistory();

        if (
            Array.isArray(
                allAccidents
            )
        ) {

            allAccidents =
                allAccidents.map(
                    function (accident) {

                        return sanitizeAccidentData(
                            accident
                        );
                    }
                );

            updateDashboardStatistics();

            renderRecentAccidents(
                allAccidents
            );

            renderAccidentTable(
                allAccidents
            );
        }
    };


// ============================================================
// FINAL PAGE INITIALIZATION
// ============================================================

function finalPageInitialization() {

    console.log(
        "========================================"
    );

    console.log(
        "🚨 ACCIDENT ALERT SYSTEM"
    );

    console.log(
        "Frontend initialized."
    );

    console.log(
        "Backend:",
        BACKEND_URL
    );

    console.log(
        "========================================"
    );

    // Initialize map.
    initializeAccidentMap();

    // Attach buttons.
    attachMapButtons();

    attachRefreshButtons();

    // Update current UI.
    updateConnectionIndicator();

    updateDashboardStatistics();

    if (currentAccident) {

        updateLiveAlertBanner(
            currentAccident
        );
    }

    // Test backend once.
    testBackendConnection();

    // Load data once.
    refreshAccidentData();
}


// ============================================================
// START FINAL INITIALIZATION
// ============================================================

setTimeout(
    function () {

        finalPageInitialization();

    },
    1000
);


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "Frontend error:",
            event.error ||
            event.message
        );
    }
);


// ============================================================
// GLOBAL PROMISE ERROR HANDLER
// ============================================================

window.addEventListener(
    "unhandledrejection",
    function (event) {

        console.error(
            "Unhandled promise rejection:",
            event.reason
        );
    }
);


// ============================================================
// FINAL LOG
// ============================================================

console.log(
    "✓ Accident Alert System JavaScript loaded successfully."
);


// ============================================================
// CLOSE DOMContentLoaded
// ============================================================

});
