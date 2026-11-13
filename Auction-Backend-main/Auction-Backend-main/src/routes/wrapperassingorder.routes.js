import express from "express";
import {
  getWrappersForOrder,
  assignWrapperToOrder,
  getWrapperOrders,
  updateWrapperAssignmentStatus,
  getAssignmentByOrderId,
  getAllAssignmentsStatus
} from "../controllers/wrapperassingorder.controller.js";
import { verifyUser,verifyAdmin } from "../middlewares/auth.middleware.js";
const router = express.Router();
router.route("/assignments").get(getAllAssignmentsStatus);

router.route("/order/:orderId/assignment").get(getAssignmentByOrderId);
router.route("/:orderId/wrappers").get(getWrappersForOrder);
router.route("/wrapper-assignments/:wrapperId").get(verifyUser,getWrapperOrders);
router.route("/:orderId/assign-wrapper").post(assignWrapperToOrder);
router.route("/:assignmentId/status").put(verifyUser,updateWrapperAssignmentStatus);

export default router;