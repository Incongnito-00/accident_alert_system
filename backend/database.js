const Database = require("better-sqlite3");
const path = require("path");

// ============================================================
// DATABASE FILE
// ============================================================

const dbPath = path.join(
    __dirname,
    "accident.db"
);

const db = new Database(dbPath);


// ============================================================
// ENABLE WAL MODE
// ============================================================

db.pragma("journal_mode = WAL");


// ============================================================
// CREATE ACCIDENTS TABLE
// ============================================================

db.exec(`
    CREATE TABLE IF NOT EXISTS accidents (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        accident_id TEXT UNIQUE NOT NULL,

        vehicle_id TEXT NOT NULL,

        latitude REAL NOT NULL,

        longitude REAL NOT NULL,

        impact TEXT NOT NULL,

        speed REAL,

        status TEXT NOT NULL DEFAULT 'ACTIVE',

        detected_at TEXT NOT NULL,

        updated_at TEXT NOT NULL

    );
`);


// ============================================================
// INSERT ACCIDENT
// ============================================================

function createAccident({

    accidentId,
    vehicleId,
    latitude,
    longitude,
    impact,
    speed

}) {

    const now =
        new Date().toISOString();


    const statement = db.prepare(`

        INSERT INTO accidents (

            accident_id,
            vehicle_id,
            latitude,
            longitude,
            impact,
            speed,
            status,
            detected_at,
            updated_at

        )

        VALUES (

            @accidentId,
            @vehicleId,
            @latitude,
            @longitude,
            @impact,
            @speed,
            'ACTIVE',
            @detectedAt,
            @updatedAt

        );

    `);


    statement.run({

        accidentId,

        vehicleId,

        latitude,

        longitude,

        impact,

        speed: speed ?? null,

        detectedAt: now,

        updatedAt: now

    });


    return getAccidentById(
        accidentId
    );

}


// ============================================================
// GET CURRENT ACTIVE ACCIDENT
// ============================================================

function getCurrentAccident() {

    return db.prepare(`

        SELECT *

        FROM accidents

        WHERE status != 'RESOLVED'

        ORDER BY id DESC

        LIMIT 1

    `).get();

}


// ============================================================
// GET ACCIDENT BY ID
// ============================================================

function getAccidentById(
    accidentId
) {

    return db.prepare(`

        SELECT *

        FROM accidents

        WHERE accident_id = ?

    `).get(
        accidentId
    );

}


// ============================================================
// UPDATE ACCIDENT STATUS
// ============================================================

function updateAccidentStatus(
    accidentId,
    status
) {

    const now =
        new Date().toISOString();


    const result =
        db.prepare(`

            UPDATE accidents

            SET

                status = ?,

                updated_at = ?

            WHERE accident_id = ?

        `).run(

            status,

            now,

            accidentId

        );


    if (
        result.changes === 0
    ) {

        return null;

    }


    return getAccidentById(
        accidentId
    );

}


// ============================================================
// GET ALL ACCIDENTS
// ============================================================

function getAllAccidents() {

    return db.prepare(`

        SELECT *

        FROM accidents

        ORDER BY id DESC

    `).all();

}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    db,

    createAccident,

    getCurrentAccident,

    getAccidentById,

    updateAccidentStatus,

    getAllAccidents

};