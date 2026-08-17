import pool from "../db.js";

// =========================================================
// GET MY NOTIFICATIONS
// =========================================================

export const getMyNotifications = async (req, res) => {

    try {

        const userId = req.user.user_id;

        const result = await pool.query(
            `
            SELECT
                notification_id,
                user_id,
                appointment_id,
                type,
                title,
                message,
                is_read,
                created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );

        return res.status(200).json({
            notifications: result.rows
        });

    } catch (err) {

        console.error(
            "Get notifications error:",
            err
        );

        return res.status(500).json({
            message: "Error fetching notifications.",
            error: err.message
        });

    }
};


// =========================================================
// GET UNREAD NOTIFICATION COUNT
// =========================================================

export const getUnreadNotificationCount = async (
    req,
    res
) => {

    try {

        const userId = req.user.user_id;

        const result = await pool.query(
            `
            SELECT COUNT(*) AS count
            FROM notifications
            WHERE user_id = $1
            AND is_read = FALSE
            `,
            [userId]
        );

        return res.status(200).json({

            count:
                Number(result.rows[0].count)

        });

    } catch (err) {

        console.error(
            "Unread notification count error:",
            err
        );

        return res.status(500).json({
            message:
                "Error fetching notification count.",
            error:
                err.message
        });

    }
};


// =========================================================
// MARK ONE NOTIFICATION AS READ
// =========================================================

export const markNotificationAsRead = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;

        const userId =
            req.user.user_id;


        const result =
            await pool.query(
                `
                UPDATE notifications

                SET is_read = TRUE

                WHERE notification_id = $1
                AND user_id = $2

                RETURNING *
                `,
                [
                    id,
                    userId
                ]
            );


        if (!result.rows.length) {

            return res.status(404).json({
                message:
                    "Notification not found."
            });

        }


        return res.status(200).json({

            message:
                "Notification marked as read.",

            notification:
                result.rows[0]

        });

    } catch (err) {

        console.error(
            "Mark notification read error:",
            err
        );

        return res.status(500).json({

            message:
                "Error marking notification as read.",

            error:
                err.message

        });

    }
};


// =========================================================
// MARK ALL NOTIFICATIONS AS READ
// =========================================================

export const markAllNotificationsAsRead = async (
    req,
    res
) => {

    try {

        const userId =
            req.user.user_id;


        await pool.query(
            `
            UPDATE notifications

            SET is_read = TRUE

            WHERE user_id = $1
            AND is_read = FALSE
            `,
            [userId]
        );


        return res.status(200).json({

            message:
                "All notifications marked as read."

        });

    } catch (err) {

        console.error(
            "Mark all notifications read error:",
            err
        );

        return res.status(500).json({

            message:
                "Error updating notifications.",

            error:
                err.message

        });

    }
};