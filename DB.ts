import mysql = require('mysql');
import config = require('config');

interface State {
    pool: mysql.IPool,
    mode: string
}
let dbstate: State;
export var connect = function (mode: string, done: (err: string) => void) {
    let errMessage: string;
   
    try {
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
        dbstate = {
            pool: mysql.createPool(poolConfig),
            mode: mode
        }
    }
    catch (ex) {
        errMessage = ex.message;
    }
    done(errMessage);
}

export var get = function () {
    return dbstate.pool;
}
export var getC = function () {
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
    return mysql.createPool(poolConfig);
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