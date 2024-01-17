import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler'
import { setCognitoProperties } from 'src/middlewares/setCognitoProperties';


export const middyfy = (lambda) => {
  return middy(lambda)
  .use(setCognitoProperties())
  .use(httpErrorHandler())
    .use(
      cors(),
    );
};
