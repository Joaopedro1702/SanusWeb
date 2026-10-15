const { db } = require('../config');
const mysql = require('mysql2/promise')

const pool = mysql.createPool(db);

module.exports = pool;