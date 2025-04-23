# @sallar-network/server

## Description

Server-side library for manage and communicate with programs running on the sallar network.

## Installation

```bash
Coming soon :)
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
// Server

import { InstanceManager } from '@sallar-network/server';


const manager = new InstanceManager({
    public_path: `./public`, // Your program files
    http_port: 3000,         // Your server port
    dev_mode: true,          // To test locally
});

// Listen for program event
manager.on('hello', ({ worker_id }) => {
    console.log(`${worker_id} said hello!`);
});

await manager.launch(({ worker_id }, manager) => {
    // Send events to program
    manager.emit('say-hello', null, worker_id);
});


// Client

import io from 'socket.io-client';
import { InstanceManager } from '@sallar-network/client';

const program = new InstanceManager(io);

program.on('say-hello', (_, manager) => {
    manager.emit('hello');
});
```