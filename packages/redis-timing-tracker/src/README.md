# redis-timing-tracker

## Prerequisites

- Node.js v16 or later
- Docker - v20.10.17

You need to configure the environment variable for the Redis connection: 
- `REDIS_HOST`: the hostname of the redis server
- `REDIS_PORT`: the port of the redis server
- `REDIS_PASSWORD`: the ACL password to connect to the redis server

## Exposed files

### `JestTimingReporter`

This file is a reporter for jest. You have to use it in your `jest.config.js` in the `reporters` key:

```js
module.exports = {
    reporters: ['redis-timing-tracker']
}
```

> **Note:** If you want to keep the default reporters, add the `default` value too. [Jest reporter doc](https://jestjs.io/docs/configuration#reporters-arraymodulename--modulename-options).

This reporter will send message with the duration of each test and the global duration to run all the tests and the number of tests that run.


### `timingTopicSubscriber`

This is the script that listen and process messages sends by the reporter. It stores data in Redis that will be usefull for the `redis-timing-tracker-web` to display charts.

