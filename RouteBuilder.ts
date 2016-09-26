import express = require('express');
import ld = require('lodash');
import fs = require('fs');
import {Logger}  from "./Logger";

export class RouteBuilder {
    build(app: express.Express) {
        let notrequired: string[] = [];//files which we might need to exclude
        //let publicRoutes: string[] = ['auth.js'];//public route
        let routeDir = __dirname + '/routes';
        Logger.log.info('routes folder:' + routeDir);
        // create route for authentication, 

        fs.readdirSync(routeDir).forEach(function (file:string) {
            //exclude .ts and .map in dev env.
            if (!fs.lstatSync(routeDir + '/' + file).isDirectory()
                && getFileExtension(file) === 'js'
                && !ld.includes(notrequired, file)) {
                let basename = getBaseFileName(file);
                let route = '/api/';

                if (basename != 'Auth') {
                    route = '/api/' + basename; // for Auth(login), route will be without base name i.e. api/login.
                }               
                let routeController = './routes/' + basename;
                app.use(route, require(routeController));
                Logger.log.info('route added: route:' + route + ' || router:' + routeController);
            }
        });


        function getBaseFileName(file:string): string {
            let basename = file.split('.')[0];
            return basename;
        }
        function getFileExtension(file:string): string {
            let temp = file.split('.');
            return temp[temp.length - 1];
        }
    };
}