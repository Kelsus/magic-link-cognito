async function handler(event) {
  console.log(event)
  console.log('Ingresa PreSignUp')
    event.response.autoConfirmUser = true
    return event
  }

export {handler}