var Dijs = this.Dijs || require("../dijs"),
    assert = this.chai && this.chai.assert || require("chai").assert;

describe("dijs", function () {
    var container;

    beforeEach(function () {
        container = new Dijs();
    });

    it('should pass itself as the first argument to bind callback', function () {
        container.bind('foo', function (passed, done) {
            assert.strictEqual(passed, container);
            done();
        });
    });

    it('should share results by default', function () {
        container.bind('foo', function (container, done) {
            done(null, Math.random());
        });

        container.get('foo', function (err, one) {
            container.get('foo', function (err, two) {
                assert.strictEqual(one, two);
            });
        });
    });

    it('should allow non-shared results', function () {
        container.bind('foo', function (container, done) {
            done(null, Math.random());
        }, false);

        container.get('foo', function (err, one) {
            container.get('foo', function (err, two) {
                assert.notEqual(one, two);
            });
        });
    });

    describe('synchronous', function () {
        beforeEach(function () {
            container.bind('foo', function (app, done) {
                done(null, 'foo');
            });

            container.bind('foo.bar', function (app, done) {
                app.get('foo', function (err, foo) {
                    done(null, foo + 'bar');
                });
            });
        });

        it('should resolve items', function () {
            container.get('foo', function (err, value) {
                assert.equal(value, 'foo');
            });
        });


        it('should resolve dependencies', function () {
            container.get('foo.bar', function (err, foobar) {
                assert.equal(foobar, 'foobar');
            });
        });
    });

    describe('asyncrhonous', function () {

        beforeEach(function () {
            container.bind('foo', function (app, cb) {
                setTimeout(function () {
                    cb(null, 'foo');
                }, 0);
            });

            container.bind('foo.bar', function (app, cb) {
                app.get('foo', function (err, foo) {
                    setTimeout(function () {
                        cb(null, foo + 'bar');
                    }, 0);
                });
            });
        });

        it('should allow for asynchronous dependencies', function (done) {
            container.get('foo', function (err, value) {
                assert.equal('foo', value);
                done();
            });
        });

        it('should resolve async dependencies', function (done) {
            container.get('foo.bar', function (err, foobar) {
                assert.equal('foobar', foobar);
                done();
            });
        });
    });

    describe('getting multiple results', function () {
        beforeEach(function () {
            container.bind('foo', function (app, done) { done(null, 'foo') });
            container.bind('bar', function (app, done) { done(null, 'bar') });
            container.bind('baz', function (app, done) { done(null, 'baz') });

            container.bind('error', function (app, done) {
                done(new Error("Something horrible happened!"));
            });
        });

        it('should return the ordered results', function () {
            container.get(['foo', 'bar'], function (err, foo, bar) {
                assert.equal('foo', foo);
                assert.equal('bar', bar);
            });
        });

        it('should only return the error in such an event', function () {
            container.get(['error', 'foo'], function (err) {
                assert.instanceOf(err, Error);
                assert.equal(1, arguments.length);
            });
        });
    });
});
