# redis-timing-tracker-web

Application to display data tracked by the `redis-timing-tracker` package.

## Prerequisites

- Node.js v16 or later
- Docker - v20.10.17

You need to configure the environment variable for the Redis connection: 
- `REDIS_HOST`: the hostname of the redis server
- `REDIS_PORT`: the port of the redis server
- `REDIS_PASSWORD`: the ACL password to connect to the redis server


## Getting Started

### Run in dev mode

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

The application is available on your browser at ```http://locahost:3000`


### Run in production mode

First, you need to build the application:

```bash
npm run build
# or
yarn build
```

Then, start the server:

```bash
npm run start
# or
yarn start
```

The application is available on your browser at ```http://locahost:3000`

