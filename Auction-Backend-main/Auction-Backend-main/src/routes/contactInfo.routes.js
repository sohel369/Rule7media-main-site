import express from "express";
import { 
  getContactInfo,
  updateContactInfo,
  sendMessage,
  createContactInfo,
  deleteContactInfo 
} from "../controllers/contactInfo.controller.js";

const router = express.Router();
router.get("/", getContactInfo);
router.post("/", sendMessage);
router.post("/create-contact", createContactInfo);
router.put('/:id', updateContactInfo);
router.delete("/contact-info/:id", deleteContactInfo);
export default router;
