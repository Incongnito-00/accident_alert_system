const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {

    testDatabaseConnection,

    createAccident,

    getCurrentAccident,

    getAccidentById,

    getAllAccidents,

    updateAccidentStatus,

    deleteAccident,

    getDepartments,

    loginDepartment,

    createResponseLog,

    getResponseLogs

} = require("./database");


const app = express();

const PORT =
    Number(process.env.PORT) || 5000;


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());


// ============================================================
// HOME
// ============================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        system:
            "Accident Alert System",

        status:
            "online",

        database:
            "PostgreSQL"

    });

});


// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", async (req, res) => {

    try {

        const databaseConnected =
            await testDatabaseConnection();

        if (!databaseConnected) {

            return res.status(500).json({

                success: false,

                status:
                    "DATABASE_ERROR"

            });

        }

        res.json({

            success: true,

            status:
                "ONLINE",

            database:
                "PostgreSQL"

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            status:
                "OFFLINE",

            message:
                error.message

        });

    }

});


// ============================================================
// GET CURRENT ACCIDENT
// ============================================================

app.get(
    "/api/accidents/current",
    async (req, res) => {

        try {

            const accident =
                await getCurrentAccident();

            res.json({

                success: true,

                accident:
                    accident || null

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Could not retrieve current accident."

            });

        }

    }
);


// ============================================================
// GET ALL ACCIDENTS
// ============================================================

app.get(
    "/api/accidents",
    async (req, res) => {

        try {

            const accidents =
                await getAllAccidents();

            res.json({

                success: true,

                count:
                    accidents.length,

                accidents

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Could not retrieve accident history."

            });

        }

    }
);


// ============================================================
// GET ACCIDENT BY ID
// ============================================================

app.get(
    "/api/accidents/:id",
    async (req, res) => {

        try {

            const accident =
                await getAccidentById(
                    req.params.id
                );

            if (!accident) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Accident not found."

                });

            }

            res.json({

                success: true,

                accident

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Could not retrieve accident."

            });

        }

    }
);


// ============================================================
// CREATE ACCIDENT
// ============================================================

app.post(
    "/api/accidents",
    async (req, res) => {

        try {

            const {

                vehicleId,

                latitude,

                longitude,

                impact,

                speed,

                severity

            } = req.body;


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (

                !vehicleId ||

                latitude === undefined ||

                longitude === undefined ||

                impact === undefined

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

            const impactValue =
                Number(impact);


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
                !Number.isFinite(impactValue)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid impact value."

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


            let speedValue =
                null;


            if (
                speed !== undefined &&
                speed !== null
            ) {

                speedValue =
                    Number(speed);


                if (
                    !Number.isFinite(speedValue)
                ) {

                    speedValue =
                        null;

                }

            }


            // ------------------------------------------------
            // ACCIDENT ID
            // ------------------------------------------------

            const accidentId =
                "ACC-" +
                Date.now();


            // ------------------------------------------------
            // SAVE ACCIDENT
            // ------------------------------------------------

            const accident =
                await createAccident({

                    accidentId,

                    vehicleId,

                    latitude: lat,

                    longitude: lng,

                    impact: impactValue,

                    severity:
                        severity || "HIGH",

                    speed:
                        speedValue

                });


            // ------------------------------------------------
            // LOG
            // ------------------------------------------------

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
                "Severity:",
                accident.severity
            );

            console.log(
                "Speed:",
                accident.speed
            );

            console.log(
                "Status:",
                accident.status
            );

            console.log(
                "Database: PostgreSQL"
            );

            console.log(
                "========================================"
            );

            console.log("");


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            res.status(201).json({

                success: true,

                message:
                    "Accident saved successfully.",

                accident

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to save accident.",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// LOGIN
// ============================================================

app.post(
    "/api/login",
    async (req, res) => {

        try {

            const {

                departmentId,

                password

            } = req.body;


            if (
                !departmentId ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Department ID and password are required."

                });

            }


            const department =
                await loginDepartment(

                    departmentId,

                    password

                );


            if (!department) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid department ID or password."

                });

            }


            res.json({

                success: true,

                message:
                    "Login successful.",

                department

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Login failed."

            });

        }

    }
);


// ============================================================
// GET DEPARTMENTS
// ============================================================

app.get(
    "/api/departments",
    async (req, res) => {

        try {

            const departments =
                await getDepartments();

            res.json({

                success: true,

                departments

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Could not retrieve departments."

            });

        }

    }
);


// ============================================================
// UPDATE CURRENT ACCIDENT STATUS
// ============================================================

app.patch(
    "/api/accidents/current/status",
    async (req, res) => {

        try {

            const {

                status,

                departmentId

            } = req.body;


            const allowedStatuses = [

                "ACTIVE",

                "ACKNOWLEDGED",

                "DISPATCHED",

                "ON_SCENE",

                "RESOLVED"

            ];


            if (
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid accident status."

                });

            }


            const accident =
                await getCurrentAccident();


            if (!accident) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No active accident found."

                });

            }


            const updated =
                await updateAccidentStatus(

                    accident.accident_id,

                    status

                );


            if (
                departmentId
            ) {

                try {

                    await createResponseLog({

                        accidentId:
                            accident.accident_id,

                        departmentId,

                        action:
                            status

                    });

                }

                catch (logError) {

                    console.error(
                        "Response log error:",
                        logError.message
                    );

                }

            }


            res.json({

                success: true,

                message:
                    "Accident status updated.",

                accident:
                    updated

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to update status."

            });

        }

    }
);


// ============================================================
// UPDATE ACCIDENT BY ID
// ============================================================

app.patch(
    "/api/accidents/:id/status",
    async (req, res) => {

        try {

            const {

                status,

                departmentId

            } = req.body;


            const allowedStatuses = [

                "ACTIVE",

                "ACKNOWLEDGED",

                "DISPATCHED",

                "ON_SCENE",

                "RESOLVED"

            ];


            if (
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid accident status."

                });

            }


            const accident =
                await getAccidentById(
                    req.params.id
                );


            if (!accident) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Accident not found."

                });

            }


            const updated =
                await updateAccidentStatus(

                    accident.accident_id,

                    status

                );


            if (
                departmentId
            ) {

                try {

                    await createResponseLog({

                        accidentId:
                            accident.accident_id,

                        departmentId,

                        action:
                            status

                    });

                }

                catch (logError) {

                    console.error(
                        "Response log error:",
                        logError.message
                    );

                }

            }


            res.json({

                success: true,

                message:
                    "Accident status updated.",

                accident:
                    updated

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to update accident status."

            });

        }

    }
);


// ============================================================
// GET RESPONSE LOGS
// ============================================================

app.get(
    "/api/accidents/:id/responses",
    async (req, res) => {

        try {

            const accident =
                await getAccidentById(
                    req.params.id
                );


            if (!accident) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Accident not found."

                });

            }


            const logs =
                await getResponseLogs(

                    accident.accident_id

                );


            res.json({

                success: true,

                accidentId:
                    accident.accident_id,

                logs

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Could not retrieve response logs."

            });

        }

    }
);


// ============================================================
// DELETE ACCIDENT
// ============================================================

app.delete(
    "/api/accidents/:id",
    async (req, res) => {

        try {

            const deleted =
                await deleteAccident(
                    req.params.id
                );


            if (!deleted) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Accident not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Accident deleted successfully.",

                accident:
                    deleted

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to delete accident."

            });

        }

    }
);


// ============================================================
// START SERVER
// ============================================================

async function startServer() {

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
        "Starting PostgreSQL connection..."
    );


    const connected =
        await testDatabaseConnection();


    if (!connected) {

        console.error("");

        console.error(
            "❌ PostgreSQL connection failed."
        );

        console.error(
            "Check your .env file."
        );

        console.error("");

        process.exit(1);

    }


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
                `Health: http://localhost:${PORT}/api/health`
            );

            console.log(
                "Database: PostgreSQL"
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

}


startServer();