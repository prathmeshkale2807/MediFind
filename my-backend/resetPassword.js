import bcrypt from "bcrypt";
import pool from "./db.js";

const email = "rahul.doctor@healthhub.com";
const newPassword = "Doctor@123";

try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
        `
        UPDATE users
        SET password = $1
        WHERE email = $2
        RETURNING user_id, email, role
        `,
        [hashedPassword, email]
    );

    if (result.rows.length === 0) {
        console.log("❌ User not found.");
    } else {
        console.log("✅ Password reset successfully!");
        console.log(result.rows[0]);
        console.log("🔑 New password:", newPassword);
    }

} catch (error) {

    console.error(
        "❌ Password reset error:",
        error
    );

} finally {

    await pool.end();

}