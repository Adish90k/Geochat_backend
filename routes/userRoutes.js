const express = require("express");
const {registerUser} = require("../controllers/userControllers");
const {authUser} = require("../controllers/userControllers");
const {getAllusers} = require("../controllers/userControllers");
const {protect} = require("../middleware/authMiddleware");
const router = express.Router();

router.get('/getallusers',protect,getAllusers);
router.post('/register',registerUser);
router.post('/login',authUser);


module.exports = router;