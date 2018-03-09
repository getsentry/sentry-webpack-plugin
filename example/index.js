var Raven = require('raven-js');

Raven.config('__DSN__').install();
Raven.captureMessage('test');

let div = <div />;
