const REPO_NAME = 'git@github.com:RoundingWell/care-ops-frontend.git';
const moment = require('moment');
const shell = require('shelljs');
const defaultBranchName = process.argv[2] || moment.utc().format('YYYYMMDD');

(async () => {

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
        }
      );
    });
  }

  // Get a valid branch name not already at REPO_NAME
  async function getBranchname() {
    let branchName;
    let version = 0;
    let testBranch;

    while(!branchName) {
      testBranch = version ? `release/${ defaultBranchName }-${ version }` : `release/${ defaultBranchName }`;
      console.log(`\n\n\n\n\n\Testing: ${ testBranch }`);
      const hasBranch = await exec(`git ls-remote --heads ${ REPO_NAME } ${ testBranch }`, { silent: true });
      if(!hasBranch) branchName = testBranch;
      version++;
    }

    return branchName;
  }

  const branchName = await getBranchname();

  try {
    await exec('git add -f ./dist');
    await exec('find . -name .DS_Store -print0 | xargs -0 git rm -f --ignore-unmatch');
    await exec(`git commit -m "${ branchName }"`);
    await exec(`git branch ${ branchName }`);
    await exec(`git push -u ${ REPO_NAME } ${ branchName }`);
  } catch(e) {
    console.log(e);
  }

})();
