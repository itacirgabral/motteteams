# gRPC api
```typescript
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')

const packageDefinition = protoLoader.loadSync(
  './helloworld.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })

const  hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld

const client = new hello_proto.Greeter(target, grpc.credentials.createInsecure())

client.sayHello({name: user}, function(err, response) {
  console.log('Greeting:', response.message);
})
```
# MALI grpc
- https://mali.js.org/guide/
```javascript
const Mali = require('mali')

function sayHello (ctx) {
  ctx.res = { message: `Hello ${ctx.req.name}` }
}

function main () {
  const app = new Mali('helloworld.proto')
  app.use({ sayHello })
  app.start('0.0.0.0:50051')
}
```