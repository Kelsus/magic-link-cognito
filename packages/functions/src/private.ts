import { middyfy } from "src/lib/lambda"

async function main(event) {
  console.log(event)
    return {
      statusCode: 200,
      body: `Hello ${event.customVariables.email}!`,
    };
  }

  const mainFunction = middyfy(main);

export { mainFunction };