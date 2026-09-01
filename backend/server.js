const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {

    createAccident,

    getCurrentAccident,

    updateAccidentStatus,

    getAllAccidents

} = require("./database");


const app =
    express();


const PORT =
    process.env.PORT || 5000;


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
    cors()
);

app.use(
    express.json()
);


// ============================================================
// HOME
// ============================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            system:
                "Accident Alert System",

            status:
                "online",

            database:
                "connected"

        });

    }
);


// ============================================================
// GET CURRENT ACCIDENT
// ============================================================

app.get(
    "/api/accidents/current",
    (req, res) => {

        try {

            const accident =
                getCurrentAccident();


            res.json({

                success: true,

                accident:
                    accident || null

            });

        }

        catch (error) {

            console.error(
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Could not retrieve accident."

            });

        }

    }
);


// ============================================================
// GET ACCIDENT HISTORY
// ============================================================

app.get(
    "/api/accidents",
    (req, res) => {

        try {

            const accidents =
                getAllAccidents();


            res.json({

                success: true,

                count:
                    accidents.length,

                accidents

            });

        }

        catch (error) {

            console.error(
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Could not retrieve accident history."

            });

        }

    }
);


// ============================================================
// CREATE ACCIDENT
// ============================================================

app.post(
    "/api/accidents",
    (req, res) => {

        try {

            const {

                vehicleId,

                latitude,

                longitude,

                impact,

                speed

            } = req.body;


            // ----------------------------------------------
            // VALIDATION
            // ----------------------------------------------

            if (
                !vehicleId ||
                latitude === undefined ||
                longitude === undefined ||
                !impact
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "vehicleId, latitude, longitude and impact are required."

                });

            }


            const lat =
                Number(latitude);


            const lng =
                Number(longitude);


            if (
                !Number.isFinite(lat) ||
                !Number.isFinite(lng)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid GPS coordinates."

                });

            }


            if (
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "GPS coordinates are outside valid range."

                });

            }


            // ----------------------------------------------
            // CREATE ID
            // ----------------------------------------------

            const accidentId =
                "ACC-" +
                Date.now();


            // ----------------------------------------------
            // SAVE TO DATABASE
            // ----------------------------------------------

            const accident =
                createAccident({

                    accidentId,

                    vehicleId,

                    latitude: lat,

                    longitude: lng,

                    impact,

                    speed:
                        speed !== undefined
                            ? Number(speed)
                            : null

                });


            // ----------------------------------------------
            // CONSOLE
            // ----------------------------------------------

            console.log("");

            console.log(
                "========================================"
            );

            console.log(
                "🚨 NEW ACCIDENT"
            );

            console.log(
                "========================================"
            );

            console.log(
                "Accident ID:",
                accident.accident_id
            );

            console.log(
                "Vehicle:",
                accident.vehicle_id
            );

            console.log(
                "GPS:",
                accident.latitude,
                accident.longitude
            );

            console.log(
                "Impact:",
                accident.impact
            );

            console.log(
                "Status:",
                accident.status
            );

            console.log(
                "========================================"
            );

            console.log("");


            res.status(201).json({

                success: true,

                message:
                    "Accident saved successfully.",

                accident

            });

        }

        catch (error) {

            console.error(
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to save accident."

            });

        }

    }
);


// ============================================================
// UPDATE ACCIDENT STATUS
// ============================================================

app.patch(
    "/api/accidents/current/status",
    (req, res) => {

        try {

            const {
                status
            } = req.body;


            const allowedStatuses = [

                "ACTIVE",

                "ACKNOWLEDGED",

                "DISPATCHED",

                "ON_SCENE",

                "RESOLVED"

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid accident status."

                });

            }


            const accident =
                getCurrentAccident();


            if (!accident) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No active accident found."

                });

            }


            const updated =
                updateAccidentStatus(

                    accident.accident_id,

                    status

                );


            res.json({

                success: true,

                message:
                    "Accident status updated.",

                accident:
                    updated

            });

        }

        catch (error) {

            console.error(
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to update status."

            });

        }

    }
);


// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "========================================"
        );

        console.log(
            "🚨 ACCIDENT ALERT SYSTEM"
        );

        console.log(
            "========================================"
        );

        console.log(
            `Backend: http://localhost:${PORT}`
        );

        console.log(
            "Database: SQLite"
        );

        console.log(
            "Status: ONLINE"
        );

        console.log(
            "========================================"
        );

        console.log("");

    }
);