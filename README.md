# Redis Timing Tracker

## What is it?

Track the timing of your jest tests to follow the evolution of time passed for each test.

This way you can know when a change in your configuration, a library upgrade or a change in your test, increased drastically the time passed on
your tests.


## How it works

Here is little achitecture diagram:

![Architecture diagram of the project](./architecture.svg)

### How the data is stored:

I have a project that publish the result timing of test to a topic named `timingTopic`. 2 types of event are sent:
- Single test result, which is of the following type:

```ts
type SingleTestTimingEvent = {
    // The type of the event
    type: 'testType';
    // The name of the test
    name: string;
    // The potential parent describe names
    describeNames: string[];
    // The duration of the test
    duration: number;
    // The timestamp when the test has been started
    startedAt: number;
    // The sha of the commit if we are in a git repository
    commitSha: string | undefined;
    // Indicates if the test finished with error
    hasError: boolean;
}
```

- The global timing result:

```ts
type FullTestTimingEvent = {
    // The type of the event
    type: 'fullTestType';
    // The duration of running all tests
    duration: number;
    // The timstamp when the user launched tests
    startedAt: number;
    // The sha of the commit if we are in a git repository
    commitSha: string | undefined;
    // Indicates if the test finished with error
    hasError: boolean;
}
```


A script is subscribed to this topic and persist data in redis with the following format:

- For event of type `'testType'`:

-- Keep tracking of information about a run with `json` with the following key: `testRunInfo:{uniqueTestName}` 

```bash
JSON.SET testRunInfo:{uniqueTestName} $.{startedAt} {value}
```

The format of the value is:

```ts
type TestInfo = {
    // The timstamp when the user launched tests
    startedAt: number;
    // The sha of the commit if we are in a git repository
    commitSha: string | null;
    // The duration of running all tests
    duration: number;
}
```

-- Keep information about the last run, and track every test that has run:

```bash
JSON.SET runningTests:{uniqueTestName} $ {value}
```

The format of the value is the following one:

```ts
type RunningTest = {
    // The potential parent describe names
    describeNames: string[];
    // The name of the test
    name: string;
    // TODO rtr change this in the code
    // The unique test name, which the concatenation of describeNames and name
    uniqueTestName: string;
    // The timestamp of the latest run
    latestRunTimestamp: number;
}
```

-- Make an index with the previous data (this will be usefull to search test by `uniqueTestName`):

```bash
FT.CREATE idx:runningTests ON JSON PREFIX runningTests SCHEMA $.uniqueTestName AS uniqueTestName TEXT SORTABLE
```

-- Store the duration in a time series:

```bash
TS.ADD {uniqueTestName} {startedAt} {duration}
```

- For event of type `'fullTestType'`:

-- Store the duration in a time series:

```bash
TS.ADD fullTestTimeSeriesKey {startedAt} {duration}
```

-- Keep tracking of information about the run with `json` with the following key: `fullTests:{startedAt}` 

```bash
JSON.SET fullTests:{startedAt} $ {value}
```

The format of the value is:

```ts
type TestInfo = {
    // The timstamp when the user launched tests
    startedAt: number;
    // TODO rtr add this
    // The sha of the commit if we are in a git repository
    commitSha: string | null;
    // The duration of running all tests
    duration: number;
    // The number of test that runned in the current run
    numberOfTests: number;
}
```


### How the data is accessed:

Let's see how I access the data for the single test:

- get test names from the search index:

```bash
FT.SEARCH idx:runningTests "@uniqueTestName:{search}" LIMIT 0 15 
```

- get the first and last timestamp (`firstTimestamp` and `lastTimestamp`):

```bash
TS.INFO {uniqueTestName}
```

- get time series data:

```bash
TS.RANGE {uniqueTestName} {firstTimestamp} {lastTimestamp}
```

> **Note:** `firstTimestamp` and `lastTimestamp` are the values got previously.


- get information about a run:

```bash
JSON.GET testRunInfo:{uniqueTestName} $.{startedAt} 
```

----

We access to the data for the full tests in the following way:


- get the first and last timestamp (`firstTimestamp` and `lastTimestamp`):

```bash
TS.INFO fullTestTimeSeriesKey
```

- get time series data:

```bash
TS.RANGE fullTestTimeSeriesKey {firstTimestamp} {lastTimestamp}
```

> **Note:** `firstTimestamp` and `lastTimestamp` are the values got previously.

- get information about a run:

```bash
JSON.GET fullTests $.{startedAt} 
```

- get information about last run:

```bash
FT.SEARCH idx:fullTests * LIMIT 0 1 SORTBY startedAt DESC
```

## How to run it locally?

### Prerequisites

- Node.js v16 or later
- Docker - v20.10.17

### Local installation

- Launch the redis stack server.

```bash
docker compose up -d
```

- Install dependencies

```bash
yarn
# or
npm i
```

- Run the redis subscriber

```bash
yarn runRedisSubscriber
```

- Run the BO

```bash
yarn redisWeb
```

- Open your browser with http://localhost:3000/

> **Note:** There is no data. So the next is to launch some tests to track timing.

- Run multiple times tests with:

```bash
yarn test
```

- Refresh your browser, you will see all the run that you launch. There are 2 pages:
-- `All test overview` that displays how long takes all test to run.
-- `Timing by test` that displays how long each test takes to run.

## More Information about Redis Stack

Here some resources to help you quickly get started using Redis Stack. If you still have questions, feel free to ask them in the [Redis Discord](https://discord.gg/redis) or on [Twitter](https://twitter.com/redisinc).

### Getting Started

1. Sign up for a [free Redis Cloud account using this link](https://redis.info/try-free-dev-to) and use the [Redis Stack database in the cloud](https://developer.redis.com/create/rediscloud).
1. Based on the language/framework you want to use, you will find the following client libraries:
    - [Redis OM .NET (C#)](https://github.com/redis/redis-om-dotnet)
        - Watch this [getting started video](https://www.youtube.com/watch?v=ZHPXKrJCYNA)
        - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-dotnet/)
    - [Redis OM Node (JS)](https://github.com/redis/redis-om-node)
        - Watch this [getting started video](https://www.youtube.com/watch?v=KUfufrwpBkM)
        - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-node/)
    - [Redis OM Python](https://github.com/redis/redis-om-python)
        - Watch this [getting started video](https://www.youtube.com/watch?v=PPT1FElAS84)
        - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-python/)
    - [Redis OM Spring (Java)](https://github.com/redis/redis-om-spring)
        - Watch this [getting started video](https://www.youtube.com/watch?v=YhQX8pHy3hk)
        - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-spring/)

The above videos and guides should be enough to get you started in your desired language/framework. From there you can expand and develop your app. Use the resources below to help guide you further:

1. [Developer Hub](https://redis.info/devhub) - The main developer page for Redis, where you can find information on building using Redis with sample projects, guides, and tutorials.
1. [Redis Stack getting started page](https://redis.io/docs/stack/) - Lists all the Redis Stack features. From there you can find relevant docs and tutorials for all the capabilities of Redis Stack.
1. [Redis Rediscover](https://redis.com/rediscover/) - Provides use-cases for Redis as well as real-world examples and educational material
1. [RedisInsight - Desktop GUI tool](https://redis.info/redisinsight) - Use this to connect to Redis to visually see the data. It also has a CLI inside it that lets you send Redis CLI commands. It also has a profiler so you can see commands that are run on your Redis instance in real-time
1. Youtube Videos
    - [Official Redis Youtube channel](https://redis.info/youtube)
    - [Redis Stack videos](https://www.youtube.com/watch?v=LaiQFZ5bXaM&list=PL83Wfqi-zYZFIQyTMUU6X7rPW2kVV-Ppb) - Help you get started modeling data, using Redis OM, and exploring Redis Stack
    - [Redis Stack Real-Time Stock App](https://www.youtube.com/watch?v=mUNFvyrsl8Q) from Ahmad Bazzi
    - [Build a Fullstack Next.js app](https://www.youtube.com/watch?v=DOIWQddRD5M) with Fireship.io
    - [Microservices with Redis Course](https://www.youtube.com/watch?v=Cy9fAvsXGZA) by Scalable Scripts on freeCodeCamp
