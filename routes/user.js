const { userSignUp, resetPasswordUser, loginUser, editUserInfo } = require("../controllers/user");

const app = express.Router();
app.post("/signup", userSignUp);
app.post("/reset-password", resetPasswordUser);

app.post("/login", loginUser);
app.put("/edit/:id", editUserInfo);


module.exports = app;
