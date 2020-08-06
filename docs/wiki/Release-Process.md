This is the guide for maintainers:

## Release Process

1. Pull the latest changes from master
2. Create a branch `release-x.x.x` and switch to it `git checkout -b release-x.x.x`
3. Update version in `package.json`
4. Go through the commits for the new release and add them to the CHANGELOG.md: 
  * Changelog should be written for humans (not for robots). 
  * Use simple wording explaining what the change is, how to use a new feature (maybe with a code example) and mention the related issue. 
  * When using `#123` a link for issue #123 will be automatically added. 
  * A contributor must be mentioned. We use GitHub names with `@` prefix. A link to user profile is automatically added.
5. Run `./runio.js docs` to build documentation
6. Commit all changes, push and create a PR
7. Check that all tests pass and merge your PR
8. Run `./runio.js release` to publish latest release. The website will be updated.
  * To update version for patch release: `./runio.js release patch`
  * To update version for minor release: `./runio.js release minor`
9. Post announcements in Twitter & Slack

## Updating the website

* Run `./runio.js docs:helpers` to build docs from helpers
* Run `./runio.js publish:site` to update a website