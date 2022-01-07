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

const server = new grpc.Server()

server.addService(hello_proto.Greeter.service, {
  sayHello: function sayHello(call, callback) {
    callback(null, {
      message: 'Hello ' + call.request.name
    })
  }})

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start()
})