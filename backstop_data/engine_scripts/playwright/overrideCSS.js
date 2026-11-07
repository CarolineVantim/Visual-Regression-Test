const BACKSTOP_TEST_CSS_OVERRIDE = `
  html {
    background-image: none;
  }
`;

module.exports = async (page, scenario) => {
  await page.addStyleTag({
    content: BACKSTOP_TEST_CSS_OVERRIDE
  });

  console.log('BACKSTOP_TEST_CSS_OVERRIDE injected for: ' + scenario.label);
};
