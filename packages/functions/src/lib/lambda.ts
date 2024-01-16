import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler'


export const middyfy = (lambda) => {
  return middy(lambda)
  .use(httpErrorHandler())
    .use(
      cors(),
    );
};
