import * as irepo from "../interfaces/ICityStateCountryRepository";
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
                    Logger.log.info('Error occured in CityRepository - find - id:' + id + '  Error:' + err);
                    reject(err);
                });

                query.on('fields', function (fields) {
                    Logger.log.info(fields);
                });

                query.on('result', function (row, result) {
                    try {
                        city =
                            {
                                id: row.id,
                                name: row.name,
                                state: undefined
                            };
                    }
                    catch (err) {
                        Logger.log.info('Error occured in CityRepository - find - id:' + id + '  Error:' + err);
                        reject(err);
                    }
                });

                query.on('end', function (result) {
                    connection.release();
                    let state: model.StateModel;
                    //populate state for the city
                    try {
                        if (city != null) {
                            let stateRepo = new StateRepository();
                            stateRepo.find(city.id)
                                .then(function (result) {
                                    city.state = state;
                                })
                                .catch(function (err) {
                                });
                        }
                        connection.release();
                        resolve(city);
                    }
                    catch (err) {
                        Logger.log.info('Error occured in CityRepository - find - id:' + id + '  Error:' + Error);
                        reject(city);
                    }
                });
            });
        });


    }

    getAll(): Promise<Array<model.CityModel>> {
        let cities: Array<model.CityModel> = new Array<model.CityModel>();
        return new Promise<Array<model.CityModel>>((resolve, reject) => {
            DB.get().getConnection(function (err, connection) {
                let query = connection.query('SELECT * FROM city');

                query.on('error', function (err) {
                    Logger.log.error("Error while fetching cities. Error:" + err);
                    reject(err);
                });

                query.on('fields', function (fields) {
                    console.log(fields);
                });

                query.on('result', function (row, result) {
                    let state: model.StateModel;
                    let city: model.CityModel =
                        {
                            id: row.id,
                            name: row.name,
                            state: undefined
                        };
                    //populate state for the city
                    if (row.id != null) {
                        let stateRepo = new StateRepository();
                        stateRepo.find(row.id)
                            .then(function (result) {
                                city.state = result
                            })
                            .catch(function (err) {
                                Logger.log.error("Error while fetching state for city:" + row.id + "Error:" + err);
                            });
                        cities.push(city);
                    }
                });
                query.on('end', function (result) {
                    //alternate way
                    //if (result.rows.length > 0) {
                    //    for (let i = 0, len = result.rows.length; i < len; i++) {
                    //        let row = rows[i];
                    //    }
                    //}
                    connection.release();
                    resolve(cities);
                });
            });
        });
    }
};

class StateRepository implements irepo.IStateRepository {
    find(id: number): Promise<model.StateModel> {
        let state: model.StateModel;
        return new Promise<model.StateModel>((resolve, reject) => {
            DB.get().getConnection(function (err, connection) {
                let query = connection.query('SELECT * FROM state where id=?', id);
                query.on('error', function (err) {
                    reject(err);
                });

                query.on('fields', function (fields) {
                    console.log(fields);
                });

                query.on('result', function (row, result) {
                    state =
                        {
                            id: row.id,
                            abbr: row.abbr,
                            name: row.name,
                            country: undefined
                        };
                    let ctr: model.CountryModel;
                    let countryRepo = new CountryRepository();
                    countryRepo.find(state.id)
                        .then(function (result) {
                            state.country = result;
                        })
                        .catch(function (error) {
                            Logger.log.error("Error while fetching Country for state:" + state.id + " - " + error);
                        });
                });
                query.on('end', function (result) {
                    connection.release();
                    resolve(state);
                });
            });
        });


    }
    getAll(): Promise<Array<model.StateModel>> {
        let states: Array<model.StateModel> = new Array<model.StateModel>();
        return new Promise<Array<model.StateModel>>((resolve, reject) => {
            DB.get().getConnection(function (err, connection) {
                let query = connection.query('SELECT * FROM state');
                query.on('error', function (err) {
                    Logger.log.info('Error occured in StateRepository - getAll Error:' + err);
                    reject(err);
                });

                query.on('fields', function (fields) {
                    console.log(fields);
                });

                query.on('result', function (row, result) {
                    let countryRepo = new CountryRepository();
                    let state: model.StateModel =
                        {
                            id: row.id,
                            abbr: row.abbr,
                            name: row.name,
                            country: undefined
                        };

                    countryRepo.find(row.idCountry)
                        .then((result) => {
                            state.country = result;
                        })
                        .catch((err) => {
                            Logger.log.info('Error occured while fetching country for state:' + row.name + ' idCountry:' + row.idCountry + ' Error:' + err);
                        });
                    states.push(state);
                });
                query.on('end', function (result) {
                    connection.release();
                    resolve(states);
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

                    query.on('fields', function (fields) {
                        Logger.log.info(fields);
                    });

                    query.on('result', function (row, result) {
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

                query.on('fields', function (fields) {
                    console.log(fields);
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