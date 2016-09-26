import {CountryRepository} from "../repositories/CityStateCountryRepository";
import {APIResponse} from "../APIResponse";
import express=require("express");

var countryController = express.Router();

countryController.get('/:id', function (req:express.Request, res:express.Response) {
    let cscrepo = new CountryRepository();
    let clRes: APIResponse; 
    try {
        let id = req.params.id;
        cscrepo.find(id)
            .then(function (result) {
                clRes = { data: result, isValid: true };
                res.send(clRes);
            })
            .catch(function (err) {
                clRes = { message: err.message, isValid: false };
                res.send(clRes);
            });
    }
    catch (Error) {
        clRes = { message: Error.message, isValid: false };
        res.send(clRes);
    }
});

countryController.get('/', function (req, res) {
    let cscrepo = new CountryRepository();
    let clRes: APIResponse;
    try {
        cscrepo.getAll()
            .then(function (result) {
                clRes = { data: result, isValid: true };
                res.send(clRes);
            })
            .catch(function (err) {
                clRes = { message: err.message, isValid: false };
                res.send(clRes);
            });
    }
    catch (Error) {
        clRes = { message: Error.message, isValid: false };
        res.send(clRes);
    }
});

module.exports = countryController;