#!/usr/bin/env node
const fs = require('fs');
const { runok, exec, npx, git, copy, chdir, writeToFile, stopOnFail } = require('runok');

module.exports = {

  async update() {
    stopOnFail(false);
    const dir = 'website';
    if (!fs.existsSync(dir)) {
      await git((fn) => {
        fn.cloneShallow('-b 3.x git@github.com:codeceptjs/codeceptjs.git', dir);
      });
    }
    await chdir(dir, async () => {
      await git(fn => {
        fn.pull();
      });
    });

    await copy('website/docs/', 'docs');
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
      cfg.textFromFile('website/docker/README.md');
    });
    writeToFile('docs/changelog.md', (cfg) => {
      cfg.line('---');
      cfg.line('permalink: /changelog');
      cfg.line('sidebar: false');
      cfg.line('title: Releases');
      cfg.line('editLink: false');
      cfg.line('---');
      cfg.line('');
      cfg.textFromFile('website/CHANGELOG.md');
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
      await exec('git remote add origin git@github.com:codeceptjs/codeceptjs.github.io.git');
      await exec('git checkout -b deploy');
      await exec('git reset --soft HEAD~$(git rev-list --count HEAD ^master)');
      await exec('git add -A');
      await exec('git commit -m "deploy"');
      stopOnFail(true);
      await exec('git push -f origin deploy:master');
    });
  },
}

if (require.main === module) runok(module.exports);
