import {CityRepository} from  "../repositories/CityStateCountryRepository";
import APIResponse=require('../APIResponse');
import express=require('express');

var cityController = express.Router();

cityController.get('/:id', function (req:express.Request, res:express.Response,next) {
    let clRes: APIResponse.APIResponse;   
    let cscrepo = new CityRepository();   
    let id = req.params.id;
    cscrepo.find(id)
        .then(function (result) {
            clRes = { data: result, isValid: true };
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
});



cityController.get('/state/:id', function (req:express.Request, res:express.Response,next) {
    let clRes: APIResponse.APIResponse;   
    let cscrepo = new CityRepository();
    let id = req.params.id;
    cscrepo.getCitiesByState(id)
        .then(function (result) {
            clRes = { data: result, isValid: true };
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
   
});

module.exports = cityController;