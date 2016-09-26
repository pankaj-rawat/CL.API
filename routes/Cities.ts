import {CityRepository} from  "../repositories/CityStateCountryRepository";
import APIResponse=require('../APIResponse');
import express=require('express');

var cityController = express.Router();

cityController.get('/:id', function (req:express.Request, res:express.Response) {
    let clRes: APIResponse.APIResponse;   
    let cscrepo = new CityRepository();   
    try {
        let id = req.params.id;
        cscrepo.find(id)
            .then(function (result) {
                clRes = { data: result, isValid: true };
                res.send(clRes);
            })
            .catch(function (err) {
                clRes = { message: err, isValid: false }
                res.send(clRes);
            });
    }
    catch (Error) {
        clRes = { message: Error, isValid: false }
        res.send(clRes);
    }   
});



cityController.get('/', function (req:express.Request, res:express.Response) {
    let clRes: APIResponse.APIResponse;   
    let cscrepo = new CityRepository();
    try {

        cscrepo.getAll()
            .then(function (result) {
                clRes = { data: result, isValid: true };
                res.send(clRes);
            })
            .catch(function (err) {
                clRes = { message: err, isValid: false }
                res.send(clRes);
            });
    }
    catch (Error) {
        clRes = { message: Error, isValid: false }
        res.send(clRes);
    }
   
});

module.exports = cityController;