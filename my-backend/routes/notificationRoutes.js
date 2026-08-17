import express from "express";

import {
    getMyNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../controllers/notificationController.js";

import {
    authenticateToken
} from "../middleware/authMiddleware.js";


const router = express.Router();


// =========================================================
// GET ALL MY NOTIFICATIONS
// =========================================================

router.get(
    "/my",
    authenticateToken,
    getMyNotifications
);


// =========================================================
// GET UNREAD COUNT
// =========================================================

router.get(
    "/unread-count",
    authenticateToken,
    getUnreadNotificationCount
);


// =========================================================
// MARK ONE AS READ
// =========================================================

router.put(
    "/:id/read",
    authenticateToken,
    markNotificationAsRead
);


// =========================================================
// MARK ALL AS READ
// =========================================================

router.put(
    "/read-all",
    authenticateToken,
    markAllNotificationsAsRead
);


export default router;