export interface CityModel {
    id: number;
    name: string;
    state: StateModel;
}
export interface CountryModel {
    id: number;
    name: string;
    abbr: string;
}

export interface StateModel {
    id: number;
    name: string;
    country: CountryModel;
    abbr: string;
}