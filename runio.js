#!/usr/bin/env node
const fs = require('fs');
const { runio, exec, npx, git, copy, chdir, writeToFile, stopOnFail } = require('runio.js');

module.exports = {

  async update() {
    stopOnFail(false);
    const dir = 'codeceptjs';
    if (!fs.existsSync(dir)) {
      await git((fn) => {
        fn.cloneShallow('git@github.com:Codeception/CodeceptJS.git', dir);        
      });
    }
    await chdir(dir, async () => {
      await git(fn => {
        fn.pull();
      });
    });

    await copy('codeceptjs/docs/', 'docs');
    await exec('rm -rf docs/api'); // disabling api at this point
    writeToFile('docs/docker.md', (cfg) => {
      cfg.line('---');
      cfg.line('permalink: /docker');
      cfg.line('layout: Section');
      cfg.line('sidebar: false');
      cfg.line('title: Docker');
      cfg.line('editLink: false');
      cfg.line('---');
      cfg.line('');
      cfg.textFromFile('codeceptjs/docker/README.md');
    });
  },

  async serve() {
    await npx('vuepress dev docs');
  },

  async publish() {
    await exec('npm i');
    await npx('vuepress build docs');
    await chdir('docs/.vuepress/dist', async () => {
      writeToFile('CNAME', cfg => cfg.line('codecept.io'));
      stopOnFail(false);
      await exec('git init');
      await exec('git checkout -b gh-pages');
      stopOnFail(true);
      await exec('git add -A');
      await exec('git commit -m "deploy"');
      await exec('git push -f git@github.com:Codeception/CodeceptJS.git gh-pages:gh-pages');
    });
  },
}

if (require.main === module) runio(module.exports);
