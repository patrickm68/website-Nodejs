This is the guide for maintainers:

## Release Process

1. pull in the latest changes from master
2. create branch `release-x.x.x` and switch to it `git checkout -b release-x.x.x`
3. update version in `package.json`
4. go through commits in this release and write a changelog. 
  * Changelog should be written not for robots! 
  * Use simple wording explaining what a change was, how to use a new feature (maybe with a code example), and mention a related issue. 
  * When using `#123` a link for issue #123 will be automatically added. 
  * A contributor must be mentioned. We use GitHub names with `@` prefix. A link to user profile is automatically added.
5. run `./runio.js docs` to build documentation
6. commit all changes, push, and make PR
7. check that all tests pass and merge your PR
8. run `./runio.js release` to publish latest release. A website will be updated.
  * to update version for patch release: `./runio.js release patch`
  * to update version for minor release: `./runio.js release minor`
9. Post announcements in Twitter & Slack

## Updating a website

* Run `./runio.js docs:helpers` to build docs from helpers
* Run `./runio.js publish:site` to update a website

