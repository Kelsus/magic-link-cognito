import { middyfy } from "src/lib/lambda";

export async function handler()  {
    return {
        statusCode: 200,
        body: "Hello from test-Function!",
      };

}

const testFunction = middyfy(handler);
export { testFunction };