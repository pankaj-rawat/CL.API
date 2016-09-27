export interface CityModel {
    id: number;
    name: string;
    idState: number;
    state?: StateModel;
}

export interface StateModel {
    id: number;
    name: string;
    abbr: string;
    idCountry: number;
    country?: CountryModel;
}

export interface CountryModel {
    id: number;
    name: string;
    abbr: string;
}