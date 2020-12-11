# CodeceptJS website

Website is built with vuepress. Source code of [codecept.io](https://codecept.io/)

## Launch website

1. clone this repo
2. `npm i`
3. `./runio.js serve` - to launch server

> runio task runner is used for build tasks. Call it with `./runio.js <command>` or `npx runio <command>`

## Sync docs

Docs are taken from CodeceptJS repo and synchronized manually with:

```
./runio.js update
```

## Publish site

```
./runio.js publish
```

