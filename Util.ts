import url = require('url');
import express = require("express");

export class Util {

    getPageLinks(uri: string, offset: number, limit: number, totalCount: number): Links {
        let links: Links = {
            self: uri
        };
        let current: number = offset;
        var totalPossiblePage = Math.ceil(totalCount / limit);
        if (current > 0) {
            links.first = this.updateUrlParameter(links.self, "offset", "0");
        }
        if (current - limit >= 0) {
            links.prev = this.updateUrlParameter(links.self, "offset", (current - limit).toString());
        }
        if (current + limit < totalCount) {
            links.next = this.updateUrlParameter(links.self, "offset", (current + limit).toString());
            links.last = this.updateUrlParameter(links.self, "offset", ((totalPossiblePage * limit) - limit).toString());
        }
        return links;
    };

    getURLstring(req): string {
        var urlobj = url.parse(req.originalUrl, true);
        urlobj.protocol = req.protocol;
        urlobj.host = req.headers.host;
        return url.format(urlobj);

    };

    updateUrlParameter(uri, key, value) {
        // remove the hash part before operating on the uri
        var i = uri.indexOf('#');
        var hash = i === -1 ? '' : uri.substr(i);
        uri = i === -1 ? uri : uri.substr(0, i);

        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";

        if (!value) {
            // remove key-value pair if value is empty
            uri = uri.replace(new RegExp("([?&]?)" + key + "=[^&]*", "i"), '');
            if (uri.slice(-1) === '?') {
                uri = uri.slice(0, -1);
            }
            // replace first occurrence of & by ? if no ? is present
            if (uri.indexOf('?') === -1) uri = uri.replace(/&/, '?');
        } else if (uri.match(re)) {
            uri = uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            uri = uri + separator + key + "=" + value;
        }
        return uri + hash;
    }

    getHeaderContentRange(offset: number, limit: number, recordCount: number): string {
        return offset.toString() + "-" + ((offset - 0) + (limit - 1)).toString() + "/" + recordCount; //subtracting with 0 just to convert into number again.;
    }

    getPostedResourceLocation(req:express.Request,resourceId:string):string {
        let locationLink: string;
        locationLink = this.getURLstring(req) + "/" +resourceId;
        return locationLink;
    }
};

interface Links {
    next?: string;
    prev?: string;
    self?: string;
    first?: string;
    last?: string;
}