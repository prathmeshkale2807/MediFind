import bcrypt from "bcrypt";
import pool from "./db.js";

const password = "Doctor@123";

try {

    const hashedPassword =
        await bcrypt.hash(password, 10);

    const result = await pool.query(
        `
        UPDATE users
        SET password = $1
        WHERE email = $2
        RETURNING user_id, full_name, email, role
        `,
        [
            hashedPassword,
            "rahul.doctor@healthhub.com"
        ]
    );

    console.log(
        "Doctor account updated:",
        result.rows[0]
    );

    console.log(
        "New doctor password:",
        password
    );

} catch (error) {

    console.error(
        "Error:",
        error
    );

} finally {

    await pool.end();

}