/**
 * Created by SURAJ on 8/27/2016.
 */
var mysql = require("mysql");
var DBConnection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"afxbsqijmysql",
    database:"pingme"
});

// TEST CODE FOR CONNECTION WITH DATABASE
// DBConnection.connect();
//
// var query = "SHOW TABLES";
//
// DBConnection.query(query,function(err,rows,fields){
//     if(err)
//         throw err;
//     console.log("TEST : SHOWING TABLES IN DATABASE : ",rows);
// });

var Database = module.exports = DBConnection;