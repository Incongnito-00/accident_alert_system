// ============================================================
// ACCIDENT ALERT SYSTEM
// FINAL script.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // ========================================================
    // ELEMENTS
    // ========================================================

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


    // ========================================================
    // BACKEND
    // ========================================================

    const BACKEND_URL =
        "http://localhost:5000";


    // ========================================================
    // APPLICATION STATE
    // ========================================================

    let loggedIn = false;

    let responseStep = 0;

    let incidentStatus = "ACTIVE";

    let accidentMap = null;

    let accidentMarker = null;

    let accidentMonitor = null;

    let lastAccidentId = null;


    // ========================================================
    // ACCIDENT LOCATION
    // ========================================================

    let accidentLocation = {

        latitude: 17.385000,

        longitude: 78.486700

    };


    // ========================================================
    // RESPONSE STATES
    // ========================================================

    const responseStates = [

        {
            name: "ACKNOWLEDGED",
            button: "🚨 DISPATCH RESPONSE"
        },

        {
            name: "DISPATCHED",
            button: "📍 TEAM ON SCENE"
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


    // ========================================================
    // INITIAL PAGE STATE
    // ========================================================

    if (dashboardPage) {

        dashboardPage.style.display =
            "none";

    }


    if (liveAlertPage) {

        liveAlertPage.style.display =
            "none";

    }


    // ========================================================
    // LOGIN BUTTONS
    // ========================================================

    const loginButtons =
        document.querySelectorAll(
            ".login-btn, .primary-btn"
        );


    loginButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openLoginModal();

            }
        );

    });


    // ========================================================
    // OPEN LOGIN MODAL
    // ========================================================

    function openLoginModal() {

        if (!loginModal) {
            return;
        }


        loginModal.classList.add("show");

        document.body.style.overflow =
            "hidden";


        setTimeout(() => {

            department?.focus();

        }, 100);

    }


    // ========================================================
    // CLOSE LOGIN MODAL
    // ========================================================

    closeLogin?.addEventListener(
        "click",
        closeLoginModal
    );


    loginModal?.addEventListener(
        "click",
        event => {

            if (
                event.target === loginModal
            ) {

                closeLoginModal();

            }

        }
    );


    function closeLoginModal() {

        loginModal?.classList.remove(
            "show"
        );

        document.body.style.overflow =
            "";

        hideLoginError();

    }


    // ========================================================
    // ESCAPE KEY
    // ========================================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                loginModal?.classList.contains("show")
            ) {

                closeLoginModal();

            }

        }
    );


    // ========================================================
    // LOGIN
    // ========================================================

    loginForm?.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const selectedDepartment =
                department?.value.trim();


            const enteredId =
                departmentId?.value.trim();


            const enteredPassword =
                password?.value.trim();


            if (!selectedDepartment) {

                showLoginError(
                    "Please select your department."
                );

                return;

            }


            if (!enteredId) {

                showLoginError(
                    "Please enter your department ID."
                );

                return;

            }


            if (!enteredPassword) {

                showLoginError(
                    "Please enter your password."
                );

                return;

            }


            // ------------------------------------------------
            // DEMO LOGIN
            // Real authentication will be added later.
            // ------------------------------------------------

            loggedIn = true;


            if (departmentName) {

                departmentName.textContent =
                    selectedDepartment;

            }


            closeLoginModal();


            showDashboard();


            resetIncident();


            showMessage(
                `${selectedDepartment} portal accessed successfully.`
            );

        }
    );


    // ========================================================
    // LOGIN ERROR
    // ========================================================

    function showLoginError(message) {

        if (!loginError) {
            return;
        }


        loginError.textContent =
            message;


        loginError.style.display =
            "block";

    }


    function hideLoginError() {

        if (!loginError) {
            return;
        }


        loginError.textContent =
            "";


        loginError.style.display =
            "none";

    }


    // ========================================================
    // LOGOUT
    // ========================================================

    logoutButton?.addEventListener(
        "click",
        () => {

            loggedIn = false;


            stopAccidentMonitoring();


            dashboardPage.style.display =
                "none";


            landingPage.style.display =
                "block";


            if (dashboardMain) {

                dashboardMain.style.display =
                    "block";

            }


            if (liveAlertPage) {

                liveAlertPage.style.display =
                    "none";

            }


            if (department) {

                department.value = "";

            }


            if (departmentId) {

                departmentId.value = "";

            }


            if (password) {

                password.value = "";

            }


            resetIncident();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


            showMessage(
                "You have been logged out."
            );

        }
    );


    // ========================================================
    // SHOW DASHBOARD
    // ========================================================

    function showDashboard() {

        if (!loggedIn) {
            return;
        }


        landingPage.style.display =
            "none";


        dashboardPage.style.display =
            "flex";


        if (dashboardMain) {

            dashboardMain.style.display =
                "block";

        }


        if (liveAlertPage) {

            liveAlertPage.style.display =
                "none";

        }


        activateSidebarItem(
            "dashboard"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    // ========================================================
    // SIDEBAR
    // ========================================================

    const sidebarLinks =
        document.querySelectorAll(
            ".dashboard-nav a"
        );


    sidebarLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                event.preventDefault();


                const page =
                    link.dataset.page;


                activateSidebarItem(
                    page
                );


                handleSidebarPage(
                    page
                );

            }
        );

    });


    // ========================================================
    // ACTIVE SIDEBAR
    // ========================================================

    function activateSidebarItem(page) {

        sidebarLinks.forEach(link => {

            link.classList.remove(
                "active"
            );


            if (
                link.dataset.page === page
            ) {

                link.classList.add(
                    "active"
                );

            }

        });

    }


    // ========================================================
    // SIDEBAR PAGE HANDLER
    // ========================================================

    function handleSidebarPage(page) {

        switch (page) {

            case "dashboard":

                stopAccidentMonitoring();

                showDashboard();

                break;


            case "live-alerts":

                showLiveAlerts();

                break;


            case "map":

                showLiveAlerts();

                setTimeout(() => {

                    centerAccidentLocation();

                }, 300);

                break;


            case "history":

                stopAccidentMonitoring();

                showDashboard();

                showMessage(
                    "Accident History will be connected to the database."
                );

                break;


            case "contacts":

                stopAccidentMonitoring();

                showDashboard();

                showMessage(
                    "Emergency Contacts will be connected to the backend."
                );

                break;


            case "reports":

                stopAccidentMonitoring();

                showDashboard();

                showMessage(
                    "Reports will be connected to the database."
                );

                break;

        }

    }


    // ========================================================
    // SHOW LIVE ALERT PAGE
    // ========================================================

    function showLiveAlerts() {

        if (!loggedIn) {
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


        setTimeout(() => {

            initializeAccidentMap();

            startAccidentMonitoring();

        }, 150);


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    // ========================================================
    // DASHBOARD ACTIVE ALERT BUTTON
    // ========================================================

    const alertButton =
        document.querySelector(
            ".alert-btn"
        );


    alertButton?.addEventListener(
        "click",
        () => {

            activateSidebarItem(
                "live-alerts"
            );


            showLiveAlerts();

        }
    );


    // ========================================================
    // DASHBOARD RESPONSE BUTTON
    // ========================================================

    const dashboardRespondButton =
        document.querySelector(
            ".respond-btn"
        );


    dashboardRespondButton?.addEventListener(
        "click",
        () => {

            activateSidebarItem(
                "live-alerts"
            );


            showLiveAlerts();

        }
    );


    // ========================================================
    // DASHBOARD MAP BUTTON
    // ========================================================

    const dashboardMapButton =
        document.querySelector(
            ".map-btn"
        );


    dashboardMapButton?.addEventListener(
        "click",
        () => {

            activateSidebarItem(
                "map"
            );


            showLiveAlerts();


            setTimeout(() => {

                centerAccidentLocation();

            }, 400);

        }
    );


    // ========================================================
    // LEAFLET MAP
    // ========================================================

    function initializeAccidentMap() {

        const mapElement =
            document.getElementById(
                "accidentMap"
            );


        if (!mapElement) {

            console.warn(
                "Accident map element not found."
            );

            return;

        }


        if (
            typeof L === "undefined"
        ) {

            console.error(
                "Leaflet has not loaded."
            );

            showMessage(
                "Map library could not be loaded."
            );

            return;

        }


        // Already initialized

        if (accidentMap !== null) {

            setTimeout(() => {

                accidentMap.invalidateSize();

            }, 200);

            return;

        }


        // ----------------------------------------------------
        // CREATE MAP
        // ----------------------------------------------------

        accidentMap =
            L.map(
                "accidentMap",
                {
                    zoomControl: true,
                    attributionControl: true
                }
            )
            .setView(
                [
                    accidentLocation.latitude,
                    accidentLocation.longitude
                ],
                16
            );


        // ----------------------------------------------------
        // OPENSTREETMAP
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // ACCIDENT ICON
        // ----------------------------------------------------

        const accidentIcon =
            L.divIcon({

                className:
                    "custom-accident-marker",

                html: `
                    <div class="accident-marker">
                        !
                    </div>
                `,

                iconSize: [
                    42,
                    42
                ],

                iconAnchor: [
                    21,
                    21
                ],

                popupAnchor: [
                    0,
                    -22
                ]

            });


        // ----------------------------------------------------
        // MARKER
        // ----------------------------------------------------

        accidentMarker =
            L.marker(
                [
                    accidentLocation.latitude,
                    accidentLocation.longitude
                ],
                {
                    icon: accidentIcon
                }
            )
            .addTo(
                accidentMap
            );


        // ----------------------------------------------------
        // POPUP
        // ----------------------------------------------------

        accidentMarker.bindPopup(
            createAccidentPopup()
        );


        accidentMarker.openPopup();


        // ----------------------------------------------------
        // MAP SIZE FIX
        // ----------------------------------------------------

        setTimeout(() => {

            accidentMap.invalidateSize();

        }, 300);

    }


    // ========================================================
    // MAP POPUP
    // ========================================================

    function createAccidentPopup() {

        return `

            <div class="accident-popup">

                <strong>
                    🚨 ACCIDENT DETECTED
                </strong>

                <span>
                    Vehicle:
                    <b>
                        V-001
                    </b>
                </span>

                <span>
                    Accident:
                    <b>
                        ACTIVE
                    </b>
                </span>

                <span>
                    Severity:
                    <b>
                        HIGH
                    </b>
                </span>

                <span>
                    Latitude:
                    <b>
                        ${accidentLocation.latitude.toFixed(6)}
                    </b>
                </span>

                <span>
                    Longitude:
                    <b>
                        ${accidentLocation.longitude.toFixed(6)}
                    </b>
                </span>

            </div>

        `;

    }


    // ========================================================
    // CENTER ACCIDENT
    // ========================================================

    window.centerAccidentLocation =
        function () {

            if (!accidentMap) {

                initializeAccidentMap();


                setTimeout(() => {

                    centerAccidentLocation();

                }, 300);


                return;

            }


            const position = [

                accidentLocation.latitude,

                accidentLocation.longitude

            ];


            accidentMap.setView(
                position,
                17,
                {
                    animate: true
                }
            );


            accidentMarker?.openPopup();

        };


    // ========================================================
    // UPDATE ACCIDENT GPS
    // ========================================================

    window.updateAccidentLocation =
        function (
            latitude,
            longitude
        ) {

            const lat =
                Number(latitude);


            const lng =
                Number(longitude);


            if (
                !Number.isFinite(lat) ||
                !Number.isFinite(lng)
            ) {

                console.error(
                    "Invalid GPS coordinates."
                );

                return;

            }


            if (
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
            ) {

                console.error(
                    "GPS coordinates outside valid range."
                );

                return;

            }


            accidentLocation.latitude =
                lat;


            accidentLocation.longitude =
                lng;


            updateCoordinateDisplay();


            if (!accidentMap) {

                initializeAccidentMap();

                return;

            }


            const newPosition = [

                lat,
                lng

            ];


            if (accidentMarker) {

                accidentMarker.setLatLng(
                    newPosition
                );


                accidentMarker.setPopupContent(
                    createAccidentPopup()
                );

            }


            accidentMap.setView(
                newPosition,
                17,
                {
                    animate: true
                }
            );

        };


    // ========================================================
    // UPDATE COORDINATES
    // ========================================================

    function updateCoordinateDisplay() {

        const latitudeElement =
            document.getElementById(
                "latitudeValue"
            );


        const longitudeElement =
            document.getElementById(
                "longitudeValue"
            );


        if (latitudeElement) {

            latitudeElement.textContent =
                accidentLocation.latitude.toFixed(6) +
                "°";

        }


        if (longitudeElement) {

            longitudeElement.textContent =
                accidentLocation.longitude.toFixed(6) +
                "°";

        }

    }


    // ========================================================
    // GOOGLE MAPS DIRECTIONS
    // ========================================================

    window.openGoogleMaps =
        function () {

            const latitude =
                accidentLocation.latitude;


            const longitude =
                accidentLocation.longitude;


            const url =
                "https://www.google.com/maps/dir/?api=1" +
                `&destination=${latitude},${longitude}`;


            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );

        };


    // ========================================================
    // OPEN MAP BUTTON
    // ========================================================

    const openMapButton =
        document.querySelector(
            ".open-map-button"
        );


    openMapButton?.addEventListener(
        "click",
        () => {

            centerAccidentLocation();

        }
    );


    // ========================================================
    // LIVE RESPONSE BUTTON
    // ========================================================

    const liveRespondButton =
        document.getElementById(
            "liveRespondButton"
        );


    liveRespondButton?.addEventListener(
        "click",
        () => {

            processResponse();

        }
    );


    // ========================================================
    // PROCESS RESPONSE
    // ========================================================

    async function processResponse() {

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

                        body: JSON.stringify({

                            status:
                                state.name

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to update incident."
                );

            }


            incidentStatus =
                state.name;


            responseStep++;


            updateResponseTimeline(
                responseStep
            );


            updateResponseButton(
                state
            );


            updateDashboardIncident(
                state.name
            );


            if (
                state.name ===
                "RESOLVED"
            ) {

                updateIncidentBadge(
                    "RESOLVED"
                );


                updateDashboardStatistics();

            }


            showMessage(
                `Incident status updated to ${state.name}.`
            );

        }

        catch (error) {

            console.error(
                "Status update failed:",
                error
            );


            showMessage(
                "Unable to update incident status."
            );

        }

    }


    // ========================================================
    // UPDATE RESPONSE BUTTON
    // ========================================================

    function updateResponseButton(
        state
    ) {

        if (!liveRespondButton) {
            return;
        }


        liveRespondButton.textContent =
            state.button;


        if (
            state.name ===
            "RESOLVED"
        ) {

            liveRespondButton.disabled =
                true;


            liveRespondButton.style.opacity =
                "0.55";


            liveRespondButton.style.cursor =
                "default";

        }

    }


    // ========================================================
    // RESPONSE TIMELINE
    // ========================================================

    function updateResponseTimeline(
        completedStep
    ) {

        const timelineItems =
            document.querySelectorAll(
                ".timeline-item"
            );


        timelineItems.forEach(
            (item, index) => {

                if (
                    index <=
                    completedStep
                ) {

                    item.classList.add(
                        "active"
                    );


                    const dot =
                        item.querySelector(
                            ".timeline-dot"
                        );


                    if (dot) {

                        dot.textContent =
                            "✓";

                    }


                    const status =
                        item.querySelector(
                            "span"
                        );


                    if (status) {

                        switch (index) {

                            case 0:

                                status.textContent =
                                    "10:42:16 PM";

                                break;


                            case 1:

                                status.textContent =
                                    "Department acknowledged";

                                break;


                            case 2:

                                status.textContent =
                                    "Response dispatched";

                                break;


                            case 3:

                                status.textContent =
                                    "Team arrived at location";

                                break;


                            case 4:

                                status.textContent =
                                    "Incident resolved";

                                break;

                        }

                    }

                }

            }
        );

    }


    // ========================================================
    // INCIDENT BADGE
    // ========================================================

    function updateIncidentBadge(
        status
    ) {

        const badge =
            document.querySelector(
                ".critical-live"
            );


        if (!badge) {
            return;
        }


        if (
            status ===
            "RESOLVED"
        ) {

            badge.innerHTML =
                "<span></span> INCIDENT RESOLVED";


            badge.style.color =
                "#2ed573";


            badge.style.background =
                "rgba(46,213,115,.08)";


            badge.style.borderColor =
                "rgba(46,213,115,.2)";

        }

    }


    // ========================================================
    // DASHBOARD INCIDENT STATUS
    // ========================================================

    function updateDashboardIncident(
        status
    ) {

        const badge =
            document.querySelector(
                ".critical-badge"
            );


        const button =
            document.querySelector(
                ".respond-btn"
            );


        if (!badge) {
            return;
        }


        switch (status) {

            case "ACKNOWLEDGED":

                badge.textContent =
                    "● ACKNOWLEDGED";

                if (button) {

                    button.textContent =
                        "🚨 RESPONSE ACKNOWLEDGED";

                }

                break;


            case "DISPATCHED":

                badge.textContent =
                    "● DISPATCHED";

                if (button) {

                    button.textContent =
                        "🚑 RESPONSE DISPATCHED";

                }

                break;


            case "ON_SCENE":

                badge.textContent =
                    "● ON SCENE";

                if (button) {

                    button.textContent =
                        "📍 TEAM ON SCENE";

                }

                break;


            case "RESOLVED":

                badge.textContent =
                    "● RESOLVED";


                if (button) {

                    button.textContent =
                        "✓ INCIDENT RESOLVED";


                    button.disabled =
                        true;


                    button.style.opacity =
                        "0.55";

                }

                break;

        }

    }


    // ========================================================
    // RESET INCIDENT
    // ========================================================

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
            (item, index) => {

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


                const status =
                    item.querySelector(
                        "span"
                    );


                if (status) {

                    status.textContent =
                        index === 0
                            ? "10:42:16 PM"
                            : "Waiting";

                }

            }
        );


        const liveBadge =
            document.querySelector(
                ".critical-live"
            );


        if (liveBadge) {

            liveBadge.innerHTML =
                "<span></span> LIVE INCIDENT";

        }


        const dashboardBadge =
            document.querySelector(
                ".critical-badge"
            );


        if (dashboardBadge) {

            dashboardBadge.textContent =
                "● CRITICAL";

        }


        const dashboardButton =
            document.querySelector(
                ".respond-btn"
            );


        if (dashboardButton) {

            dashboardButton.disabled =
                false;


            dashboardButton.style.opacity =
                "1";


            dashboardButton.textContent =
                "🚑 RESPOND TO INCIDENT";

        }


        updateCoordinateDisplay();

    }


    // ========================================================
    // UPDATE DASHBOARD STATISTICS
    // ========================================================

    function updateDashboardStatistics() {

        const activeAccidents =
            document.querySelector(
                ".dash-stat .red-text"
            );


        if (activeAccidents) {

            activeAccidents.textContent =
                "00";

        }

    }


    // ========================================================
    // LOAD CURRENT ACCIDENT
    // ========================================================

    async function loadCurrentAccident() {

        try {

            const response =
                await fetch(
                    `${BACKEND_URL}/api/accidents/current`,
                    {

                        cache: "no-store"

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
                !data.accident
            ) {

                return;

            }


            const accident =
                data.accident;


            const accidentId =
                accident.accident_id ||
                accident.accidentId;


            // ------------------------------------------------
            // NEW ACCIDENT DETECTION
            // ------------------------------------------------

            if (
                accidentId &&
                accidentId !== lastAccidentId
            ) {

                lastAccidentId =
                    accidentId;


                showMessage(
                    `🚨 New accident detected — ${
                        accident.vehicle_id ||
                        accident.vehicleId ||
                        "Unknown Vehicle"
                    }`
                );


                triggerEmergencyAlert();

            }


            // ------------------------------------------------
            // GPS
            // ------------------------------------------------

            updateAccidentLocation(
                accident.latitude,
                accident.longitude
            );


            // ------------------------------------------------
            // VEHICLE
            // ------------------------------------------------

            updateAccidentVehicle(
                accident
            );


            // ------------------------------------------------
            // IMPACT
            // ------------------------------------------------

            updateAccidentImpact(
                accident.impact
            );


            // ------------------------------------------------
            // SPEED
            // ------------------------------------------------

            updateAccidentSpeed(
                accident.speed
            );


            // ------------------------------------------------
            // STATUS
            // ------------------------------------------------

            updateAccidentStatusFromBackend(
                accident.status
            );


        }

        catch (error) {

            console.error(
                "Backend connection failed:",
                error
            );

        }

    }


    // ========================================================
    // UPDATE VEHICLE
    // ========================================================

    function updateAccidentVehicle(
        accident
    ) {

        const vehicleId =
            accident.vehicle_id ||
            accident.vehicleId;


        if (!vehicleId) {
            return;
        }


        const vehicleDetails =
            document.querySelectorAll(
                ".vehicle-details strong"
            );


        if (
            vehicleDetails.length > 0
        ) {

            vehicleDetails[0].textContent =
                vehicleId;

        }


        const incidentInfo =
            document.querySelectorAll(
                ".incident-info strong"
            );


        if (
            incidentInfo.length > 0
        ) {

            incidentInfo[0].textContent =
                vehicleId;

        }

    }


    // ========================================================
    // UPDATE IMPACT
    // ========================================================

    function updateAccidentImpact(
        impact
    ) {

        if (!impact) {
            return;
        }


        const impactText =
            String(impact)
                .toUpperCase();


        const vehicleImpact =
            document.querySelector(
                ".vehicle-details .danger-text"
            );


        if (vehicleImpact) {

            vehicleImpact.textContent =
                impactText;

        }


        const incidentInfo =
            document.querySelectorAll(
                ".incident-info strong"
            );


        incidentInfo.forEach(
            element => {

                const text =
                    element.textContent
                        .trim()
                        .toUpperCase();


                if (
                    text === "HIGH" ||
                    text === "MEDIUM" ||
                    text === "LOW"
                ) {

                    element.textContent =
                        impactText;

                }

            }
        );

    }


    // ========================================================
    // UPDATE SPEED
    // ========================================================

    function updateAccidentSpeed(
        speed
    ) {

        if (
            speed === null ||
            speed === undefined
        ) {

            return;

        }


        console.log(
            "Accident speed:",
            speed,
            "km/h"
        );

    }


    // ========================================================
    // UPDATE BACKEND STATUS
    // ========================================================

    function updateAccidentStatusFromBackend(
        status
    ) {

        if (!status) {
            return;
        }


        const normalized =
            String(status)
                .toUpperCase();


        incidentStatus =
            normalized;


        if (
            normalized ===
            "ACTIVE"
        ) {

            return;

        }


        const stateIndex =
            responseStates.findIndex(
                state =>
                    state.name === normalized
            );


        if (
            stateIndex >= 0
        ) {

            responseStep =
                stateIndex + 1;


            updateResponseTimeline(
                responseStep
            );


            updateResponseButton(
                responseStates[stateIndex]
            );

        }


        updateDashboardIncident(
            normalized
        );


        if (
            normalized ===
            "RESOLVED"
        ) {

            updateIncidentBadge(
                "RESOLVED"
            );

        }

    }


    // ========================================================
    // START REAL-TIME MONITOR
    // ========================================================

    function startAccidentMonitoring() {

        stopAccidentMonitoring();


        // First check immediately

        loadCurrentAccident();


        // Check every 3 seconds

        accidentMonitor =
            setInterval(
                () => {

                    if (loggedIn) {

                        loadCurrentAccident();

                    }

                },
                3000
            );

    }


    // ========================================================
    // STOP REAL-TIME MONITOR
    // ========================================================

    function stopAccidentMonitoring() {

        if (accidentMonitor) {

            clearInterval(
                accidentMonitor
            );


            accidentMonitor =
                null;

        }

    }


    // ========================================================
    // EMERGENCY VISUAL ALERT
    // ========================================================

    function triggerEmergencyAlert() {

        document.body.classList.add(
            "emergency-flash"
        );


        setTimeout(
            () => {

                document.body.classList.remove(
                    "emergency-flash"
                );

            },
            1200
        );

    }


    // ========================================================
    // VIEW ALL
    // ========================================================

    const viewAllButton =
        document.querySelector(
            ".view-all"
        );


    viewAllButton?.addEventListener(
        "click",
        () => {

            showMessage(
                "Full accident history will be connected to the database."
            );

        }
    );


    // ========================================================
    // EXPLORE SYSTEM
    // ========================================================

    const exploreButton =
        document.querySelector(
            ".secondary-btn"
        );


    exploreButton?.addEventListener(
        "click",
        () => {

            const section =
                document.getElementById(
                    "how-it-works"
                );


            section?.scrollIntoView({
                behavior: "smooth"
            });

        }
    );


    // ========================================================
    // REGISTER
    // ========================================================

    const registerButton =
        document.querySelector(
            ".register-btn"
        );


    registerButton?.addEventListener(
        "click",
        () => {

            showMessage(
                "Department registration will be connected to the secure backend."
            );

        }
    );


    // ========================================================
    // RECENT ALERT ROWS
    // ========================================================

    const alertRows =
        document.querySelectorAll(
            ".recent-table .table-row:not(.table-head)"
        );


    alertRows.forEach(row => {

        row.style.cursor =
            "pointer";


        row.addEventListener(
            "click",
            () => {

                const vehicle =
                    row.children[0]
                        ?.textContent
                        .trim();


                const incident =
                    row.children[1]
                        ?.textContent
                        .trim();


                showMessage(
                    `${vehicle}: ${incident}`
                );

            }
        );

    });


    // ========================================================
    // TOAST MESSAGE
    // ========================================================

    function showMessage(message) {

        const old =
            document.querySelector(
                ".app-notification"
            );


        old?.remove();


        const notification =
            document.createElement(
                "div"
            );


        notification.className =
            "app-notification";


        notification.innerHTML = `

            <div class="notification-check">
                ✓
            </div>

            <div>

                <strong>
                    Accident Alert System
                </strong>

                <p>
                    ${escapeHtml(message)}
                </p>

            </div>

            <button
                type="button"
                aria-label="Close notification">

                ×

            </button>

        `;


        document.body.appendChild(
            notification
        );


        notification
            .querySelector("button")
            ?.addEventListener(
                "click",
                () => {

                    notification.remove();

                }
            );


        setTimeout(
            () => {

                if (
                    notification.isConnected
                ) {

                    notification.remove();

                }

            },
            4500
        );

    }


    // ========================================================
    // HTML ESCAPE
    // ========================================================

    function escapeHtml(text) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            String(text);


        return div.innerHTML;

    }


    // ========================================================
    // KEYBOARD SHORTCUT
    // ========================================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.ctrlKey &&
                event.shiftKey &&
                event.key.toLowerCase() === "a"
            ) {

                if (loggedIn) {

                    activateSidebarItem(
                        "live-alerts"
                    );


                    showLiveAlerts();

                }

            }

        }
    );


    // ========================================================
    // INITIALIZE
    // ========================================================

    updateCoordinateDisplay();


    console.log(
        "🚨 Accident Alert System initialized."
    );

});