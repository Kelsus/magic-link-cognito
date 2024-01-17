import { CognitoJwtVerifier } from "aws-jwt-verify";

const userPoolId = process.env.USER_POOL_ID;
const clientId = process.env.USER_POOL_CLIENT_ID;

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: "id",
  clientId,
});

const _validateToken = async (authorizationToken) => {
  const sessionToken = authorizationToken.replace("Bearer ", "");
  const jwtVerifierResponse = await jwtVerifier.verify(sessionToken);
  if (jwtVerifierResponse) {
    const { email } = jwtVerifierResponse;
    const username = jwtVerifierResponse["cognito:username"];
    return { isAuthorized: true, email, username };
  }
  return { isAuthorized: false };
};

async function main(event) {
  console.log("Ingresa al Authorizer");

  const authorizationToken = event.headers?.authorization;
  if (!authorizationToken) {
    return { isAuthorized: false };
  }

  const { isAuthorized, email, username } = await _validateToken(
    authorizationToken
  );
  if (!isAuthorized) {
    return {isAuthorized};
  }

  event.headers.email = email;
  event.headers.username = username;
  return {isAuthorized};
}

export { main };
