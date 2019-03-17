function getHelpers(app) {
  const waitText = (txt, container = 'body') =>
    app.client.waitUntilTextExists(container, txt)

  const get = id => app.client.$(`[data-testid="${id}"]`)

  const fillField = (id, value) => get(id).setValue(value)

  const fillPassword = (id = 'pass-field') =>
    get(id).setValue(app.getSettings().env.E2E_PASSWORD)

  const click = id => get(id).click()

  const submitForm = id =>
    get(id)
      .$('[type="submit"]')
      .click()

  const expectExistence = (id, shoudlExist = true) =>
    app.client
      .isExisting(`[data-testid="${id}"]`)
      .then(isExisting => expect(isExisting).toBe(shoudlExist))

  const expectInexistence = id => expectExistence(id, false)

  return {
    expectInexistence,
    expectExistence,
    fillPassword,
    submitForm,
    fillField,
    waitText,
    click,
    get
  }
}

module.exports = { getHelpers }
