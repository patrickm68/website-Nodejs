# CodeceptJS website

Website is built with vuepress. Source code for [codecept.io](https://codecept.io/)

## Launch website

1. clone this repo
2. `npm i`
3. `./runok.js serve` - to launch server

> runok task runner is used for build tasks. Call it with `./runok.js <command>` or `npx runok <command>`

## Sync docs

Docs are taken from CodeceptJS repo and synchronized manually with:

```
./runok.js update
```

## Publish site

```
./runok.js publish
```

