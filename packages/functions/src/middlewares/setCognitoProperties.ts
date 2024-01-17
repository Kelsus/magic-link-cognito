import { CognitoJwtVerifier } from "aws-jwt-verify";
const userPoolId = process.env.USER_POOL_ID;
const clientId = process.env.USER_POOL_CLIENT_ID;

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: "id",
  clientId,
});

const setCognitoProperties = () => {
  const setCognitoProperties = async (request) => {
    console.log("Ingresa a setCognitoProperties");

    console.log(userPoolId)
    console.log(clientId)
    const authorizationToken = request.event.headers?.authorization;
    const sessionToken = authorizationToken.replace("Bearer ", "");
   const jwtVerifierResponse = await jwtVerifier.verify(sessionToken);
   const { email } = jwtVerifierResponse;
   const username = jwtVerifierResponse["cognito:username"];
   request.event.customVariables = { email,username };

    return;
  };
  return {
    before: setCognitoProperties,
  };
};
export { setCognitoProperties };
