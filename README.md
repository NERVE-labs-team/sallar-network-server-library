# @sallar-network/server

<p align="center">
    <img src="./logo.svg" width="400px">
</p>

## Description

Server-side library for manage and communicate with programs running on the [sallar network](https://sallar.io/).

## Installation

```bash
$ npm i @sallar-network/server
```

## Docs

```bash
$ npm run generate-docs
```

## Build

You can build and test the library on your own:

```bash
$ npm run build
```

And add to your project:

```bash
$ npm link
$ npm link @sallar-network/server
```

## Example

```ts
import { InstanceManager } from '@sallar-network/server';


const manager = new InstanceManager({
    public_path: `./public`, // Your program files
    http_port: 3000,         // Your server port
    dev_mode: true,          // To test locally

    // For production:
    node_manager_server: process.env.node_manager_server,
    program_token: process.env.program_token

});

// Listen for program event
manager.on('hello', ({ worker_id }) => {
    console.log(`${worker_id} said hello!`);
});

await manager.launch(({ worker_id }, manager) => {
    // Send events to program
    manager.emit('say-hello', null, worker_id);
});
```

[See the client library](https://github.com/NERVE-labs-team/sallar-network-client-library)
