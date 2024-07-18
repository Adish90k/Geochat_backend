const express = require("express");
const {protect} = require("../middleware/authMiddleware");
const {accessChat} = require("../controllers/chatControllers");
const {fetchAllchats} = require("../controllers/chatControllers");


const router = express.Router();

router.post("/accesschat",protect,accessChat);
router.get("/fetchallchats",protect,fetchAllchats);

module.exports = router;