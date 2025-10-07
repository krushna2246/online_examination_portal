var mysql = require("mysql2");
var util = require("util");
require("dotenv").config(); // Load env variables
var url = require('url');

var conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

var exe = util.promisify(conn.query).bind(conn);   // SQL queries

module.exports = exe;
