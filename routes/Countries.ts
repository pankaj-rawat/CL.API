import {CountryRepository} from "../repositories/CityStateCountryRepository";
import {APIResponse} from "../APIResponse";
import express=require("express");

var countryController = express.Router();

countryController.get('/:id', function (req:express.Request, res:express.Response,next ) {
    let cscrepo = new CountryRepository();
    let clRes: APIResponse; 
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

countryController.get('/', function (req, res,next) {
    let cscrepo = new CountryRepository();
    let clRes: APIResponse;
    cscrepo.getAll()
        .then(function (result) {
            clRes = { data: result, isValid: true };
            res.send(clRes);
        })
        .catch(function (err) {
            next(err);
        });
});

module.exports = countryController;