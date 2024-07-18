const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
const {sendMessages} = require("../controllers/messageControllers")
const {getMessages} = require("../controllers/messageControllers")

router.post("/",protect,sendMessages);
router.get("/:chatId",protect,getMessages);

module.exports = router

