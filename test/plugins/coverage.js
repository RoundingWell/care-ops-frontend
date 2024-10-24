import fs from 'fs-extra';
import istanbul from 'istanbul-lib-coverage';

let coverageMap;

export default (on, config) => {
  if (!config.env.COVERAGE) return;

  process.env.NODE_ENV = 'test';

  const coverageFile = `${ config.coverageFolder }/out.json`;
  coverageMap = istanbul.createCoverageMap({});

  on('task', {
    coverage(coverage) {
      coverageMap.merge(coverage);
      return JSON.stringify(coverageMap);
    },
    async write() {
      if (config.isInteractive) {
        const coverage = fs.readJsonSync(coverageFile, { throws: false });

        if (coverage) coverageMap.merge(coverage);
      }

      await fs.outputJson(coverageFile, coverageMap);

      return config.isInteractive;
    },
  });
};
