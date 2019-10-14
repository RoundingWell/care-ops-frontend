(async () => {
  const moment = require('moment');
  const shell = require('shelljs');
  const defaultTagName = process.argv[2] || `release-${ moment.utc().format('YYYYMMDD') }`;

  async function exec(command, options) {
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

  async function getTagname() {
    let tagName;
    let version = 0;
    let tag;

    while(!tagName) {
      try {
        tag = version ? `${ defaultTagName }-${ version }` : defaultTagName;
        await exec(`git show-ref --tags --verify -- "refs/tags/${ tag }"`, { silent: true });
        version++;
      } catch(e) {
        console.log(`\n\n\n\n\n\nReleasing: ${ tag }`);
        tagName = tag;
      }
    }

    return tagName;
  }

  const tagName = await getTagname();

  try {
    await exec('git add -f ./dist');
    await exec(`git commit -m "${ tagName }"`);
    await exec(`git tag -a ${ tagName } -m "${ tagName }"`);
    await exec(`git push origin ${ tagName }`);
  } catch(e) {
    console.log(e);
  }

})();
