import { middyfy } from "src/lib/lambda";

 async function handler()  {
    return {
        statusCode: 200,
        body: "Hello from test-Function2!",
      };

}
export {handler}