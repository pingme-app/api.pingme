/**
 * Created by SURAJ on 8/27/2016.
 */
//REQUIRED MODULES
var express = require("express");
var DBConnection = require("./Database");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var jwt = require("jsonwebtoken");
var uuid = require("uuid");
var passHasher = require("password-hash-and-salt");

//INITIALIZATION
var app = express();
var apiRouter = express.Router();
app.set("json spaces", 2);
app.set("secret-key", "ver5t2b4tsdf6534rb");

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(morgan('dev'));
DBConnection.connect(function (err) {
    if (err)
        throw err;
    console.log("Connected to Database")
});
var port = process.env.port || 3000;

//BASE ROUTING
app.get("/", function (req, res) {
    res.send("API for pingme is avaliable at http://localhost:3000/api");
});
app.get("/dbtest", function (req, res) {
    var data = {
        username: "Alex",
        password: "password",
        admin: false
    };
    var query = "insert into tokentest set ?";
    DBConnection.query(query, data, function (err, results) {
        if (err)
            throw err;
        console.log("User Saved Successfully");
        res.json({success: true});
    });
});

//ROUTING FOR API STARTS HERE
apiRouter.get("/", function (req, res) {
    res.json({message: "pingme api home page"});
});
apiRouter.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, app.get("secret-key"), function (err, decoded) {
            if (err) {
                res.json({
                    success: false,
                    message: "Failed to Authenticate Token"
                });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        res.status(403).send({
            success: false,
            message: "No Token Provided"
        });
    }
});
apiRouter.post("/authenticate", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    DBConnection.query("SELECT * FROM users where username = ?", username, function (err, results) {
        if (err)
            throw err;
        if (results.length == 0) {
            res.json({
                success: false,
                message: "Cannot Authenticate. User not found."
            });
        } else {
            passHasher(password).verifyAgainst(results[0].password, function (error, verified) {
                if (error)
                    throw new Error('Something went wrong!');
                if (!verified) {
                    res.json({
                        success: false,
                        message: "Cannot Authenticate. Invalid Credentials."
                    });
                } else {
                    var data = {
                        uid: results[0].uid
                    };
                    var token = jwt.sign(data, app.get("secret-key"));
                    console.log(results[0]);
                    res.json({
                        success: true,
                        token: token
                    });
                }
            });
        }
    });
});
apiRouter.post("/signup", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var uid = uuid.v1();
    var last_login = new Date();
    passHasher('pass123').hash(function (err, hash) {
        if (err)
            throw err;
        password = hash;
        var data = {
            username: username,
            password: password,
            email: email,
            uid: uid,
            last_login: last_login
        };
        var query = "insert into users set ?";
        DBConnection.query(query, data, function (err, result) {
            if (err)
                throw err;
            if (result.affectedRows == 1) {
                res.json({
                    success: true,
                    message: "User Signed up Successfully"
                });
            }
        });
    });
});
apiRouter.get("/users", function (req, res) {
    DBConnection.query("SELECT * FROM tokentest", function (err, results) {
        if (err)
            throw err;
        res.json({users: results});
    });
});
app.use('/api', apiRouter);


//START SERVER
app.listen(port, function () {
    console.log("API Server Running");
});