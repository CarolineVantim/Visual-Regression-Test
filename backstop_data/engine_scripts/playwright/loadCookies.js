const fs = require('fs');

module.exports = async (browserContext, scenario) => {
  let cookies = [];
  const cookiePath = scenario.cookiePath;

  if (fs.existsSync(cookiePath)) {
    cookies = JSON.parse(fs.readFileSync(cookiePath));
  }

  browserContext.addCookies(cookies);

  console.log('Cookie state restored with:', JSON.stringify(cookies, null, 2));
};
