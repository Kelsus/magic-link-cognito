
async function handler(event) {
  console.log('Ingresa VerifyAuthChallenge')
  const email = event.request.userAttributes.email

  const expected = event.request.privateChallengeParameters.challenge
  if (event.request.challengeAnswer !== expected) {
    console.log("answer doesn't match current challenge token")
    event.response.answerCorrect = false
    return event
  }

  const json = event.request.challengeAnswer
  const payload = JSON.parse(Buffer.from(json, 'base64').toString())
  console.log(payload)
  console.log(payload.email)
  
  const isExpired = new Date().toJSON() > payload.expiration
  console.log('isExpired:', isExpired)

  if (payload.email === email && !isExpired) {    
    event.response.answerCorrect = true
  } else {
    console.log("email doesn't match or token is expired")
    event.response.answerCorrect = false
  }
  
  return event
}

export {handler}