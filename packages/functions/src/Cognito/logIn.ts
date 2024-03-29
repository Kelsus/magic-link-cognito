import { middyfy } from "src/lib/lambda"

import Cognito from 'aws-sdk/clients/cognitoidentityserviceprovider'
const cognito = new Cognito()
import SES from 'aws-sdk/clients/sesv2'
const ses = new SES()
const { SES_FROM_ADDRESS, USER_POOL_ID, BASE_URL } = process.env
const ONE_MIN = 60 * 1000
const TIMEOUT_MINS=30
import qs from 'querystring'

 async function handler(event) {
  console.log('Ingresa Log In')
  const { email }= JSON.parse(event.body)
  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'You must provide a valid email.'
      })
    }
  }

  // only send the magic link on the first attempt
  const now = new Date()
  const expiration = new Date(now.getTime() + ONE_MIN * TIMEOUT_MINS)
  const payload = {
    email,
    expiration: expiration.toJSON()
  }
  const tokenRaw =JSON.stringify(payload)
  const tokenB64 = Buffer.from(tokenRaw).toString('base64')
  const token = qs.escape(tokenB64)
  const magicLink = `${BASE_URL}/magic-link?email=${email}&token=${token}`  

  try {
    await cognito.adminUpdateUserAttributes({
      UserPoolId: USER_POOL_ID,
      Username: email,
      UserAttributes: [{
        Name: 'custom:authChallenge',
        Value: tokenB64
      }]
    }).promise()
  } catch (error) {
    console.log(error)
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'User not found'
      })
    }
  }
  
  await sendEmail(email, magicLink)
  return {
    statusCode: 202
  }
}

async function sendEmail(emailAddress, magicLink) {
  await ses.sendEmail({
    Destination: {
      ToAddresses: [ emailAddress ]
    },
    FromEmailAddress: SES_FROM_ADDRESS,
    Content: {
      Simple: {
        Subject: {
          Charset: 'UTF-8',
          Data: 'Your one-time sign in link'
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<html><body><p>This is your one-time sign in link (it will expire in ${TIMEOUT_MINS} mins):</p>
                  <h3>${magicLink}</h3></body></html>`
          },
          Text: {
            Charset: 'UTF-8',
            Data: `Your one-time sign in link (it will expire in ${TIMEOUT_MINS} mins): ${magicLink}`
          }
        }
      }
    }
  }).promise()
}

const logIn = middyfy(handler);

export { logIn };