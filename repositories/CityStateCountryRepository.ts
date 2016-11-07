import * as irepo from "../interfaces/ICityStateCountryRepository";
import {RepoResponse} from "../RepoResponse";
import * as model from "../models/CityStateCountryModel";
import * as DB from "../DB";
import {Logger}  from "../Logger";
import * as CLError from "../CLError";

class CityRepository implements irepo.ICityRepository {
    find(id: number): Promise<model.CityModel> {
        Logger.log.info('CityRepository - find - id:' + id);
        let city: model.CityModel;
        return new Promise<model.CityModel>(function (resolve, reject): void {
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL));
                }

                let encounteredError: boolean = false;
                let query = connection.query('SELECT * FROM city WHERE id = ?', id);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, 'Error occured while getting cities. ' + err.message));
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
                    catch (ex) {
                        encounteredError = true;
                        return reject(new CLError.DBError(CLError.ErrorCode.DB_DATA_PARSE_ERROR));
                    }
                });

                query.on('end', function (result) {
                    connection.release();
                    //populate state for the city
                    if (!encounteredError) {
                        if (city == null) {
                            return reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, 'City not found.'));
                        }
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
                });
            });
        });
    }

    getAll(offset: number, limit: number, idState?: number): Promise<RepoResponse> {
        return new Promise<RepoResponse>(function (resolve, reject) {
            let cities: Array<model.CityModel> = new Array<model.CityModel>();
            if (offset < 0) {
                return reject(new CLError.BadRequest(CLError.ErrorCode.INVALID_PARAM_VALUE, "Invalid value supplied for offset\limit params."));
            }
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL));
                }
                let encounteredError: boolean = false;
                let recCount: number = 0;
                let query = connection.query('SET @rCount=0; CAll sp_select_city(@rCount,?,?,?); select @rCount rcount;', [offset, limit, idState]);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, "Error occured while reading cities." + err.message));
                });
                query.on('result', function (row, index) {
                    if (index == 1) {
                        let city: model.CityModel =
                            {
                                id: row.id,
                                name: row.name,
                                idState: row.idState
                            };
                        cities.push(city);
                    }
                    if (index == 3) {
                        recCount = row.rcount;
                    }
                });
                query.on('end', function (result) {
                    connection.release();
                    if (!encounteredError) {
                        if (cities.length > 0) {
                            let res: RepoResponse = {
                                data: cities
                                , recordCount: recCount
                            };
                            resolve(res);
                        }
                        else {
                            reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "No city found."));
                        }
                    }
                });
            });
        });
    }
}

class StateRepository implements irepo.IStateRepository {
    find(id: number): Promise<RepoResponse> {
        let state: model.StateModel;
        return new Promise<RepoResponse>((resolve, reject) => {
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL));
                }

                let encounteredError: boolean = false;
                let query = connection.query('SELECT * FROM state where id=?', id);
                query.on('error', function (err) {
                    reject(err);
                });

                query.on('result', function (row, index) {
                    state =
                        {
                            id: row.id,
                            abbr: row.abbr,
                            name: row.name,
                            idCountry: row.IdCountry
                        };
                });
                query.on('end', function (result) {
                    if (state != null) {
                        let countryRepo = new CountryRepository();
                        countryRepo.find(state.id)
                            .then(function (result: model.CountryModel) {
                                state.country = result;
                                let res: RepoResponse = {
                                    data: state
                                }
                                resolve(res);
                            })
                            .catch(function (error) {
                                Logger.log.error("Error while fetching Country for state:" + state.id + " - " + error);
                                reject(err.message);
                            });
                    }
                    else {
                        reject(new Error("State not found."));
                    }
                    connection.release();
                });
            });
        });
    }

    getAll(offset: number, limit: number, idCountry?: number): Promise<RepoResponse> {
        let states: Array<model.StateModel> = new Array<model.StateModel>();
        return new Promise<RepoResponse>((resolve, reject) => {
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL));
                }
                let encounteredError: boolean = false;
                let recCount: number = 0;
                let query = connection.query('SET @rCount=0; CAll sp_select_state(@rCount,?,?,?); select @rCount rcount;', [offset, limit, idCountry]);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, "Error occured while reading states." + err.message));
                });
                query.on('result', function (row, index) {
                    if (index == 1) {
                        let state: model.StateModel =
                            {
                                id: row.id,
                                abbr: row.abbr,
                                name: row.name,
                                idCountry: row.idCountry
                            };
                        states.push(state);
                    }
                    if (index == 3) {
                        recCount = row.rcount;
                    }
                });
                query.on('end', function (result) {
                    connection.release();
                    if (!encounteredError) {
                        if (states.length > 0) {
                            let res: RepoResponse = {
                                data: states
                                , recordCount: recCount
                            };
                            resolve(res);
                        }
                        else {
                            reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "No state found."));
                        }
                    }
                });
            });
        });
    }

};

class CountryRepository implements irepo.ICountryRepository {
    find(id: number): Promise<model.CountryModel> {
        return new Promise<model.CountryModel>((resolve, reject) => {
            let country: model.CountryModel;
            DB.get().getConnection(function (err, connection) {
                if (err != null) {
                    Logger.log.error('Error occured in CountryRepository - find - id:' + id + '  Error:' + err);
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

    getAll(offset: number, limit: number): Promise<RepoResponse> {
        let countries: Array<model.CountryModel> = new Array<model.CountryModel>();
        return new Promise<RepoResponse>((resolve, reject)=>{
            DB.get().getConnection(function (err, connection) {
                if (err) {
                    let clError: CLError.DBError = new CLError.DBError(CLError.ErrorCode.DB_CONNECTION_FAIL);
                    clError.stack = err.stack;
                    return reject(clError);
                }
                let encounteredError: boolean = false;
                let recCount: number = 0;
                let query = connection.query('SET @rCount=0; CAll sp_select_country(@rCount,?,?); select @rCount rcount;', [offset, limit]);
                query.on('error', function (err) {
                    encounteredError = true;
                    return reject(new CLError.DBError(CLError.ErrorCode.DB_QUERY_EXECUTION_ERROR, "Error occured while reading states." + err.message));
                });
                query.on('result', function (row, index) {
                    if (index == 1) {
                        let country: model.CountryModel =
                            {
                                id: row.id,
                                abbr: row.abbr,
                                name: row.name
                            };
                        countries.push(country);
                    }
                    if (index == 3) {
                        recCount = row.rcount;
                    }
                });
                query.on('end', function (result) {
                    connection.release();
                    if (!encounteredError) {
                        if (countries.length > 0) {
                            let res: RepoResponse = {
                                data: countries
                                , recordCount: recCount
                            };
                            resolve(res);
                        }
                        else {
                            reject(new CLError.NotFound(CLError.ErrorCode.RESOURCE_NOT_FOUND, "No country found."));
                        }
                    }
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