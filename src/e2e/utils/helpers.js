function getHelpers(app) {
  const waitText = (txt, timeout, container = 'body') =>
    app.client.waitUntilTextExists(container, txt, timeout)

  const waitExistence = (testId, timeout) =>
    app.client.waitForExist(`[data-testid="${testId}"]`, timeout)

  const get = id => app.client.$(`[data-testid="${id}"]`)

  const fillField = (id, value) => get(id).setValue(value)

  const fillPassword = (id = 'pass-field') =>
    get(id).setValue(app.getSettings().env.E2E_PASSWORD)

  const click = id => get(id).click()

  const submitForm = async formTestId => {
    const formId = await get(formTestId).getAttribute('id')
    const hasChildSubmit = await app.client.isExisting(
      `[data-testid="${formTestId}"] [type="submit"]`
    )
    return hasChildSubmit
      ? app.client.$(`[data-testid="${formTestId}"] [type="submit"]`).click()
      : app.client.$(`[type="submit"][form="${formId}"]`).click()
  }

  const expectExistence = (id, shoudlExist = true) =>
    app.client
      .isExisting(`[data-testid="${id}"]`)
      .then(isExisting => expect(isExisting).toBe(shoudlExist))

  const expectInexistence = id => expectExistence(id, false)

  return {
    expectInexistence,
    expectExistence,
    waitExistence,
    fillPassword,
    submitForm,
    fillField,
    waitText,
    click,
    get
  }
}

module.exports = { getHelpers }
