import mysql = require('mysql');
import config = require('config');
import async = require('async');

var state = {
    pool: null,
    mode: null,
}

export var connect = function (mode, done) {
    let poolConfig: mysql.IPoolConfig = {
        host: process.env.DBHOST || config.get<string>('dbConfig.host'),
        user: process.env.DBUSER || config.get<string>('dbConfig.user'),
        password: process.env.DBPWD || config.get<string>('dbConfig.password'),
        database: process.env.DB || config.get<string>('dbConfig.database')
    };

    if (config.has('dbConfig.port')) {
        if (config.get<number>('dbConfig.port') > 0) {
            poolConfig.port = process.env.HOSTPORT || config.get<number>('dbConfig.port');
        }
    }
    state.pool = mysql.createPool(poolConfig);
    state.mode = mode;
    done()
}

export var get = function () {
    return state.pool
}

//exports.fixtures = function (data) {
//    var pool = state.pool
//    if (!pool) return done(new Error('Missing database connection.'))

//    var names = Object.keys(data.tables)
//    async.each(names, function (name, cb) {
//        async.each(data.tables[name], function (row, cb) {
//            var keys = Object.keys(row)
//                , values = keys.map(function (key) { return "'" + row[key] + "'" })

//            pool.query('INSERT INTO ' + name + ' (' + keys.join(',') + ') VALUES (' + values.join(',') + ')', cb)
//        }, cb)
//    }, done)
//}

//exports.drop = function (tables, done) {
//    var pool = state.pool
//    if (!pool) return done(new Error('Missing database connection.'))

//    async.each(tables, function (name, cb) {
//        pool.query('DELETE * FROM ' + name, cb)
//    }, done)
//}