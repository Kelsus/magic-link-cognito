import { StringAttribute } from "aws-cdk-lib/aws-cognito";
import { Api, Cognito, StackContext, Function } from "sst/constructs";

export function ExampleStack({ stack }: StackContext) {
  // Create auth provider

  const testFunciton = new Function(stack, "testFunciton", {
    handler: "packages/functions/src/Cognito/testFunction.testFunction",
  });
  const testFunction2 = new Function(stack, "testFunction2", {
    handler: "packages/functions/src/Cognito/testFunction2.handler",
  });

  const createAuthChallenge = new Function(stack, "createAuthChallenge", {
    handler: "packages/functions/src/Cognito/createAuthChallenge.handler",
  });
  const verifyAuthChallengeResponse = new Function(
    stack,
    "verifyAuthChallengeResponse",
    {
      handler:
        "packages/functions/src/Cognito/verifyAuthChallengeResponse.handler",
    }
  );

  const defineAuthChallenge = new Function(stack, "defineAuthChallenge", {
    handler: "packages/functions/src/Cognito/defineAuthChallenge.handler",
  });
  const preSignUp = new Function(stack, "preSignUp", {
    handler: "packages/functions/src/Cognito/preSignUp.handler",
  });

  const auth = new Cognito(stack, "Auth", {
    triggers: {
      preSignUp: preSignUp,
      defineAuthChallenge: defineAuthChallenge,
      createAuthChallenge: createAuthChallenge,
      verifyAuthChallengeResponse: verifyAuthChallengeResponse,
    },
    cdk: {
      userPool: {
        signInAliases: { email: true },
        customAttributes: {
          authChallenge: new StringAttribute({ mutable: true }),
        },
      },
      userPoolClient: {
        preventUserExistenceErrors: true,
      },
    },
  });

  const logIn = new Function(stack, "logInCognito", {
    handler: "packages/functions/src/Cognito/logIn.logIn",
    environment: {
      SES_FROM_ADDRESS: "Notification@dev.kelsus.com",
      BASE_URL: "localhost:5173",
      USER_POOL_ID: auth.userPoolId,
    },
    permissions: ["cognito-idp:AdminUpdateUserAttributes", "ses:SendEmail"],
  });

  // Create Api
  const api = new Api(stack, "Api", {
    authorizers: {
      authorizer: {
        type: "lambda",
        responseTypes: ["simple"],
        identitySource: [],
        function: new Function(stack, "Authorizer", {
          handler: "packages/functions/src/authorizer/authorizer.main",
          environment:{
            USER_POOL_ID:auth.userPoolId,
            USER_POOL_CLIENT_ID: auth.userPoolClientId
          }
        }),
      },
    },
    defaults: {
      authorizer: "authorizer"
    },
    routes: {
      "GET /private": {function:{handler:"packages/functions/src/private.mainFunction", environment:{
        USER_POOL_ID:auth.userPoolId,
        USER_POOL_CLIENT_ID: auth.userPoolClientId
      }}},
      "GET /public": {
        function: "packages/functions/src/public.main",
        authorizer: "none",
      },
      "POST /login": {
        function: logIn,
        authorizer: "none",
      },
      "GET /login": {
        function: testFunciton,
        authorizer: "none",
      },
      "GET /login2": {
        function: testFunction2,
        authorizer: "none",
      },
    },
    
  });
  // Allow authenticated users invoke API
  auth.attachPermissionsForAuthUsers(stack, [api]);

  // Show the API endpoint and other info in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
    UserPoolId: auth.userPoolId,
    IdentityPoolId: auth.cognitoIdentityPoolId,
    UserPoolClientId: auth.userPoolClientId,
  });
}
