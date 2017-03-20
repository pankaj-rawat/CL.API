import url = require('url');
import express = require("express");
import config = require('config');

export class Util{

    getPagingInfo(req:express.Request): PagingInfo {
        let maxLimit: number = Number(process.env.PAGING_LIMIT || config.get("paging.limit"));
        let offset: number = Number(req.query.offset || 0);
        let limit: number = Number(req.query.limit || 0);
        if (limit <= 0 || limit > maxLimit) {
            limit = maxLimit;
        }
        if (offset < 0) {
            offset = 0;
        }
        let pagingData: PagingInfo;
        pagingData = {
            limit: limit    
            ,offset:offset
        }
        return pagingData; 
    }

    setResponseHeaderPageLinks(recordCount: number, req: express.Request, res: express.Response, pagingInfo:PagingInfo): express.Response {
        var pageLink = this.getPageLinks(this.getURLstring(req), pagingInfo.offset, pagingInfo.limit, recordCount);
        res.links(pageLink);
        res.setHeader('content-range', getHeaderContentRange(pagingInfo.offset, pagingInfo.limit, recordCount));
        return res;
    };

    getPageLinks(uri: string, offset: number, limit: number, totalCount: number): Links {
        let current: number = offset;
        let links: Links = {
            self: this.updateUrlParameter(uri, "offset", current.toString()) //uri
        };
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

    getURLstring(req: express.Request): string {
        var urlobj = url.parse(req.originalUrl, true);
        urlobj.protocol = req.protocol;
        urlobj.host = req.get('host');
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

    getPostedResourceLocation(req: express.Request, resourceId: string): string {
        let locationLink: string;
        locationLink = this.getURLstring(req) + "/" + resourceId;
        return locationLink;
    }
};

export interface PagingInfo {
    limit: number;
    offset: number;
}

function getHeaderContentRange(offset: number, limit: number, recordCount: number): string {
    let rangeFrom: number = offset + 1;
    let rangeTo: number = offset + limit;
    let rangeOf: number = recordCount;
    if (rangeTo > rangeOf) {
        rangeTo = rangeOf;
    }
    return rangeFrom.toString() + "-" + rangeTo.toString() + "/" + rangeOf; //subtracting with 0 just to convert into number again.;
}

interface Links {
    next?: string;
    prev?: string;
    self?: string;
    first?: string;
    last?: string;
}

