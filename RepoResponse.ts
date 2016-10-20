import CityStateCountryModel = require('./models/CityStateCountryModel');
import BusinessModel=require ('./models/BusinessModel');
import CategoryTagModel = require('./models/CategoryTagModel');

export interface RepoResponse {
    data?: any
    ,recordCount?:number
}