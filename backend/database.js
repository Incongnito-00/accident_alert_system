// ============================================================
// ACCIDENT ALERT SYSTEM
// PostgreSQL Database Connection
// Works with LOCAL PostgreSQL + RENDER PostgreSQL
// ============================================================

const { Pool } = require("pg");
require("dotenv").config();


// ============================================================
// DATABASE CONNECTION
// ============================================================

let pool;

if (process.env.DATABASE_URL) {

    // --------------------------------------------------------
    // RENDER POSTGRESQL
    // --------------------------------------------------------

    pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    console.log("Database mode: RENDER PostgreSQL");

} else {

    // --------------------------------------------------------
    // LOCAL POSTGRESQL
    // --------------------------------------------------------

    pool = new Pool({
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE || "accident_alert_system",
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD
    });

    console.log("Database mode: LOCAL PostgreSQL");
}


// ============================================================
// TEST DATABASE CONNECTION
// ============================================================

async function testDatabaseConnection() {

    const client = await pool.connect();

    try {

        const result = await client.query(`
            SELECT
                current_database() AS current_database,
                current_schema() AS current_schema,
                current_user AS current_user
        `);

        console.log("PostgreSQL connection successful:");
        console.log(result.rows[0]);

        return result.rows[0];

    } finally {

        client.release();

    }
}


// ============================================================
// CREATE ACCIDENT
// ============================================================

async function createAccident(data) {

    const {
        vehicleId,
        latitude,
        longitude,
        impact,
        severity,
        speed
    } = data;

    const accidentId =
        `ACC-${Date.now()}`;

    const query = `
        INSERT INTO accidents (
            accident_id,
            vehicle_id,
            latitude,
            longitude,
            impact,
            severity,
            speed,
            status,
            detected_at,
            updated_at
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            'ACTIVE',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        RETURNING *
    `;

    const values = [
        accidentId,
        vehicleId,
        latitude ?? null,
        longitude ?? null,
        impact,
        severity || "HIGH",
        speed ?? null
    ];

    const result =
        await pool.query(query, values);

    return result.rows[0];
}


// ============================================================
// GET CURRENT ACCIDENT
// ============================================================

async function getCurrentAccident() {

    const query = `
        SELECT *
        FROM accidents
        WHERE status != 'RESOLVED'
        ORDER BY detected_at DESC
        LIMIT 1
    `;

    const result =
        await pool.query(query);

    return result.rows[0] || null;
}


// ============================================================
// GET ACCIDENT BY ID
// ============================================================

async function getAccidentById(id) {

    const query = `
        SELECT *
        FROM accidents
        WHERE accident_id = $1
    `;

    const result =
        await pool.query(query, [id]);

    return result.rows[0] || null;
}


// ============================================================
// GET ALL ACCIDENTS
// ============================================================

async function getAllAccidents() {

    const query = `
        SELECT *
        FROM accidents
        ORDER BY detected_at DESC
    `;

    const result =
        await pool.query(query);

    return result.rows;
}


// ============================================================
// UPDATE ACCIDENT STATUS
// ============================================================

async function updateAccidentStatus(
    accidentId,
    status
) {

    const query = `
        UPDATE accidents
        SET
            status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE accident_id = $2
        RETURNING *
    `;

    const result =
        await pool.query(
            query,
            [status, accidentId]
        );

    return result.rows[0] || null;
}


// ============================================================
// DELETE ACCIDENT
// ============================================================

async function deleteAccident(
    accidentId
) {

    const query = `
        DELETE FROM accidents
        WHERE accident_id = $1
        RETURNING *
    `;

    const result =
        await pool.query(
            query,
            [accidentId]
        );

    return result.rows[0] || null;
}


// ============================================================
// GET DEPARTMENTS
// ============================================================

async function getDepartments() {

    const query = `
        SELECT
            id,
            department_name,
            department_id
        FROM departments
        ORDER BY id
    `;

    const result =
        await pool.query(query);

    return result.rows;
}


// ============================================================
// LOGIN DEPARTMENT
// ============================================================

async function loginDepartment(
    departmentId,
    password
) {

    const query = `
        SELECT
            id,
            department_name,
            department_id
        FROM departments
        WHERE department_id = $1
        AND password = $2
        LIMIT 1
    `;

    const result =
        await pool.query(
            query,
            [departmentId, password]
        );

    return result.rows[0] || null;
}


// ============================================================
// CREATE RESPONSE LOG
// ============================================================

async function createResponseLog(
    accidentId,
    departmentId,
    action
) {

    const query = `
        INSERT INTO response_logs (
            accident_id,
            department_id,
            action,
            created_at
        )
        VALUES (
            $1,
            $2,
            $3,
            CURRENT_TIMESTAMP
        )
        RETURNING *
    `;

    const result =
        await pool.query(
            query,
            [
                accidentId,
                departmentId,
                action
            ]
        );

    return result.rows[0];
}


// ============================================================
// GET RESPONSE LOGS
// ============================================================

async function getResponseLogs(
    accidentId
) {

    const query = `
        SELECT
            rl.id,
            rl.accident_id,
            rl.department_id,
            d.department_name,
            rl.action,
            rl.created_at
        FROM response_logs rl
        LEFT JOIN departments d
            ON rl.department_id = d.department_id
        WHERE rl.accident_id = $1
        ORDER BY rl.created_at ASC
    `;

    const result =
        await pool.query(
            query,
            [accidentId]
        );

    return result.rows;
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

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

};