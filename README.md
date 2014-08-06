# dijs
A flyweight dependency injection container for Node.js and the browser.

## A Contrived Node.js Example

```javascript
var di = new Dijs();

di.bind('config', function (app, done) {
    fs.readFile(__dirname + "/../config.json", function (err, data) {
        if (err) return done(err);
        done(null, JSON.parse(data.toString()));
    });
});

di.bind('database', function (app, done) {
    di.get('config', function (err, config) {
        if (err) return done(err);

        DBManager.connect(config, function (err, connection) {
            done(err, connection);
        });
    });
});

/**
 * GET /users
 */
exports.index = function (di, req, res, next) {
    di.get('database', function (err, database) {
        if (err) throw err;

        database.query('users', function (err, users) {
            if (err) throw err;

            res.json(users);
        });
    });
};
```

## A Contrived Browser Example

```javascript
var di = new Dijs();

di.bind('session.token', function (app, done) {
    app.get('user', function (err, user) {
        if (err) return done(err);

        var data = {
            username: user.username,
            password: user.password
        };

        jQuery.post('/api/sessions/new', data, function (response) {
            return done(null, response.token);
        });
    });
});

jQuery('#login-form').on('submit', function () {
    var user = {
        username: $('#username').val(),
        password: $('#password').val()
    };
    di.bind('user', function (app, done) { done(null, user); });

    di.get('session.token', function (err, token) {
        if (err) throw err;

        // do something fun and exciting with token here!
    });
});
```

## API

### `var di = new Dijs()`

Constructor method.  Declares a new dijs container.

### `di.bind(key, factory, shared=false)`

Bind a new value into the container.  This value will be accessible with
the passed key after this point.  The `factory` function will not be
evaluated lazily, and no code will be run until necessary.

By default, factories are considered "shared," meaning that after the
first time the object is built, that same object will be reused for all
subsequent `get` calls.  You can disable this, forcing the container to evaluate
the factory upon each request by passing `false` after the factory
function.

The signature of the `factory` callback is: `container, callback`, where
container is the originating container, and a callback accepting an
optional `error` and the instantiated value:

```javascript
di.bind('fooer', function (container, done) {
    var fooer = new Fooer();

    if (fooer.hasError()) {
        return done(fooer.getError());
    }

    done(null, fooer);
});
```

### `di.get(key|keys, callback)`

Retrieve the value(s) previously specified by `key` (or `keys`) from the
container.  If multiple values are specified, they will be returned in
the order they were requested.  Duplicate key requests are permitted:

```javascript
di.get(['foo', 'bar', 'baz'], function (err, foo, bar, baz) {
    document.getElementById('bazholder').innerHtml = foo + bar + baz;
});
```

```javascript
di.bind('random', function (app, done) {
    done(null, Math.random());
}, false); // Not a shared factory -- evaluated each request

di.get(['random', 'random', 'random'], function (err, rand1, rand2, rand3) {
    process.stdout.write(
        "For your enjoyment, 3 different random numbers:\n" +
        [rand1,rand2,rand3].join(', ')
    );
});
```

### `di.getOne(key, callback)`

Effectively the same as `di.get`, `getOne` only accepts a singular
argument.  There's probably no reason for you to use it.


## License

MIT.  See the LICENSE file for details.
