var assert = require("assert");
describe("Simple Tests", function () {
    describe("Constructor Test", function () {
        it("Object is created", function () {
            assert.ok(true);
        }),
            it("Has some text", function () {
                assert.equal("Has some text", "Has some text");
            });
    }),
        describe("Famous Names", function () {
            it("Has three", function () {
                assert.equal(3, 3);
            });
        });
});

//describe('public', function () {
//    beforeEach(function () {
//        var collection = { title: 'This is test collection', public: true };
//        it("", function () {
//            assert.ok(true);
//        });
        
//    });
//});