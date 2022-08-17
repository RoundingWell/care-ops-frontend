const REPO_NAME = 'git@github.com:RoundingWell/care-ops-frontend.git';

const dayjs = require('dayjs');
const utcPlugin = require('dayjs/plugin/utc');
dayjs.extend(utcPlugin);

const shell = require('shelljs');
const defaultTagName = dayjs.utc().format('YYYYMMDD');

const isProduction = process.env.NODE_ENV === 'production';

(async() => {
  // Async shell.exec
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
        },
      );
    });
  }

  // Get a valid branch name not already at REPO_NAME
  async function getBranchname() {
    let tagName;
    let version = 0;
    let testTag;
    const tagType = isProduction ? '1' : '2';

    while (!tagName) {
      testTag = `v${ defaultTagName }.${ tagType }.${ version }`;
      console.log(`\n\n\n\n\n\Testing: ${ testTag }`);
      const hasBranch = await exec(`git ls-remote --tags ${ REPO_NAME } ${ testTag }`, { silent: true });
      if (!hasBranch) tagName = testTag;
      version++;
    }

    return tagName;
  }

  const tagName = await getBranchname();

  try {
    await exec('git add -f ./dist');
    await exec('find . -name .DS_Store -print0 | xargs -0 git rm -f --ignore-unmatch');
    await exec(`git commit -m "${ tagName }"`);
    await exec(`git tag ${ tagName }`);
    await exec(`git push ${ REPO_NAME } ${ tagName }`);
  } catch (e) {
    console.log(e);
  }
})();
