(async () => {
  const moment = require('moment');
  const shell = require('shelljs');
  const defaultTagName = process.argv[2] || `release-${ moment.utc().format('YYYYMMDD') }`;

  function async exec(command, options) {
    return new Promise((resolve, reject) => {
      shell.exec(
        command,
        options,
        (code, stdout, stderr) => {
          if (code) {
            const e = new Error();
            e.message = stderr;
            e.name = String(code);
            reject(e);
            return;
          }

          resolve(stdout);
        }
      );
    });
  }

  async function getTagname(version = 0) {
    const tag = version ? `${ defaultTagName }-${ version }` : defaultTagName;

    try {
      await exec(`git show-ref --tags --verify -- "refs/tags/${ tag }"`);
      return tag;
    } catch(e) {
      return await getTagName(version + 1);
    }
  }

  const tagName = await getTagname();

  try {
    await exec('git add -f ./dist');
    await exec(`git commit -m "${ tagName }"`);
    await exec(`git tag -a ${ tagName } -m "${ tagName }"`);
    await exec(`git push origin --tags`);
  } catch(e) {
    console.log(e);
  }

})();
