import supertest = require("supertest");
var should = require("should");

// This agent refers to PORT where program is runninng.

var server = supertest.agent("http://localhost:1337/");

// UNIT test begin

describe("CityTest", function () {

    beforeEach(function () {

        return         
    });
    // #1 should return home page

    it("should return home page", function (done) {

        // calling home page api
        server
            .get("api/cities/1")
            .expect("Content-type", /json/)
            .expect(200) // This is HTTP response
            .end(function (err, res) {
                res.status.should.equal(401);
               should(res.body.data).equal(undefined).not.be.ok;
                done();
            });
    });

});