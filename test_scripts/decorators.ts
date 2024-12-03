import "reflect-metadata";
const requiredMetadataKey = Symbol("required");


// Define the routes object where we will register the methods
const routes: { [key: string]: Function } = {};

// Define the registerChannel decorator
function registerChannel(id: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Add the method to the routes object using the provided id
    routes[id] = descriptor.value;
    console.log(`Route registered: ${id}`);
  };
}

// Example class where the decorator is applied
class ExampleChannels {
  
  @registerChannel('channel1')
  handleChannel1() {
    console.log('Handling channel 1');
  }

  @registerChannel('channel2')
  handleChannel2() {
    console.log('Handling channel 2');
  }
}

// Access the registered routes
console.log(routes);

// Testing the registered methods
routes['channel1'](); // Output: Handling channel 1
routes['channel2'](); // Output: Handling channel 2


function NotNull(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  const existingRequiredParams: number[] = Reflect.getOwnMetadata("notnull:params", target, propertyKey) || [];
  existingRequiredParams.push(parameterIndex);
  Reflect.defineMetadata("notnull:params", existingRequiredParams, target, propertyKey);
}

function ValidateNotNull() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value;

      descriptor.value = function (...args: any[]) {
          const requiredParams: number[] = Reflect.getOwnMetadata("notnull:params", target, propertyKey) || [];
          
          requiredParams.forEach(index => {
              if (args[index] === null || args[index] === undefined) {
                  throw new Error(`Argument at index ${index} must not be null or undefined.`);
              }
          });

          return method.apply(this, args);
      };
  };
}

// Usage Example
class MyService {
  @ValidateNotNull()
  someMethod(@NotNull param1: any, param2: any) {
      console.log("Method executed successfully with", param1, param2);
  }
}

const service = new MyService();

// This will execute successfully:
service.someMethod("Valid input", 42);

// This will throw an error for the null parameter:
service.someMethod(null, 42);
