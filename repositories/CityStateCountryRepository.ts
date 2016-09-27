﻿import * as irepo from "../interfaces/ICityStateCountryRepository";
import * as model from "../models/CityStateCountryModel";
import * as DB from "../DB";
import {Logger}  from "../Logger";

class CityRepository implements irepo.ICityRepository {
    find(id: number): Promise<model.CityModel> {
        let city: model.CityModel;
        return new Promise(function (resolve, reject): void {
            DB.get().getConnection(function (err, connection) {
                let query = connection.query('SELECT * FROM city WHERE id = ?', id);
                query.on('error', function (err) {
                    Logger.log.error('Error occured in CityRepository - find - id:' + id + '  Error:' + err);
                    reject(err);
                });
                query.on('result', function (row, result) {
                    try {
                        city =
                            {
                                id: row.id,
                                name: row.name,
                                idState: row.idState
                            };
                    }
                    catch (err) {
                        Logger.log.error('Error occured in CityRepository - find - id:' + id + '  Error:' + err);
                        reject(err);
                    }
                });

                query.on('end', function (result) {
                    connection.release();
                    //populate state for the city
                    try {
                        if (city != null) {
                            let stateRepo = new StateRepository();
                            stateRepo.find(city.id)
                                .then(function (result: model.StateModel) {
                                    city.state = result;
                                    resolve(city);
                                })
                                .catch(function (err) {
                                    reject(err);
                                });
                        }
                        connection.release();
                    }
                    catch (err) {
                        Logger.log.error('Error occured in CityRepository - find - id:' + id + '  Error:' + Error);
                        reject(city);
                    }
                });
            });
        });
    }

    getCitiesByState(stateId: number): Promise<Array<model.CityModel>> {
        return new Promise(function (resolve, reject) {
            let cities: Array<model.CityModel> = new Array<model.CityModel>();
            DB.get().getConnection(function (err, connection) {
                let query = connection.query('SELECT * FROM city WHERE idState = ?', stateId);
                query.on('error', function (err) {
                    Logger.log.error('Error occured in CityRepository - getCitiesByState - stateid:' + stateId + '  Error:' + err);
                    reject(err);
                });
                query.on('result', function (row, result) {
                    try {
                        let city: model.CityModel =
                            {
                                id: row.id,
                                name: row.name,
                                idState: row.idState
                            };
                        cities.push(city);
                    }
                    catch (err) {
                        Logger.log.error('Error occured in CityRepository - find - id:' + stateId + '  Error:' + err);
                        reject(err);
                    }
                });
                query.on('end', function () {
                    resolve(cities);
                    connection.release();
                });
            });
        });
    }
}


class StateRepository implements irepo.IStateRepository {
    find(id: number): Promise<model.StateModel> {
        let state: model.StateModel;
        return new Promise<model.StateModel>((resolve, reject) => {
            DB.get().getConnection(function (err, connection) {
                let query = connection.query('SELECT * FROM state where id=?', id);
                query.on('error', function (err) {
                    reject(err);
                });

                query.on('result', function (row, result) {
                    state =
                        {
                            id: row.id,
                            abbr: row.abbr,
                            name: row.name,
                            idCountry: row.IdCountry
                        };
                });
                query.on('end', function (result) {
                    let countryRepo = new CountryRepository();
                    countryRepo.find(state.id)
                        .then(function (result: model.CountryModel) {
                            state.country = result;
                            resolve(state);
                        })
                        .catch(function (error) {
                            Logger.log.error("Error while fetching Country for state:" + state.id + " - " + error);
                            reject(err.message);
                        });
                    connection.release();
                });
            });
        });
    }

    getStatesByCountry(countryId: number): Promise<Array<model.StateModel>> {
        let states: Array<model.StateModel> = new Array<model.StateModel>();
        return new Promise<Array<model.StateModel>>((resolve, reject) => {
            DB.get().getConnection(function (err, connection) {
                let query = connection.query('SELECT * FROM state WHERE isCountry=?', countryId);

                query.on('error', function (err) {
                    Logger.log.info('Error occured in StateRepository - getAll Error:' + err);
                    reject(err);
                });

                query.on('result', function (row, result) {
                    let state: model.StateModel =
                        {
                            id: row.id,
                            abbr: row.abbr,
                            name: row.name,
                            idCountry: row.idCountry
                        };
                    states.push(state);
                });
                query.on('end', function (result) {
                    resolve(states);
                    connection.release();
                });
            });
        });
    }
};

class CountryRepository implements irepo.ICountryRepository {
    find(id: number): Promise<model.CountryModel> {
        return new Promise((resolve, reject) => {
            let country: model.CountryModel;
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    Logger.log.info('Error occured in CountryRepository - find - id:' + id + '  Error:' + err);
                    reject(err);
                }
                else {
                    let query = connection.query('SELECT * FROM country where id=?', id);
                    query.on('error', function (err) {
                        reject(err);
                    });
                    query.on('result', function (row, index) {
                        country =
                            {
                                id: row.id,
                                abbr: row.abbr,
                                name: row.name
                            };
                    });

                    query.on('end', function (result) {
                        resolve(country);
                        connection.release();
                    });
                }//else closing
            });
        });
    }

    getAll(): Promise<Array<model.CountryModel>> {
        let countries: Array<model.CountryModel> = new Array<model.CountryModel>();
        return new Promise<Array<model.CountryModel>>((resolve, reject) => {
            DB.get().getConnection(function (err, connection) {
                let query = connection.query('SELECT * FROM country');
                query.on('error', function (err) {
                    Logger.log.info('Error occured in CountryRepository - getAll Error:' + err);
                    reject(err);
                });

                query.on('result', function (row, result) {
                    let country: model.CountryModel =
                        {
                            id: row.id,
                            abbr: row.abbr,
                            name: row.name
                        };
                    countries.push(country);
                });

                query.on('end', function (result) {
                    resolve(countries);
                    connection.release();
                });
            });
        });
    }
};

//export {CityRepository as cityRepository };
//export {StateRepository as stateRepository };
//export {CountryRepository as countryRepository };

export {CityRepository};
export {StateRepository};
export {CountryRepository};