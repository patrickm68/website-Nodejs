# Migrating from Appium 1.x to Appium 2.x
This document is a guide for those who are using Appium 1.x and wish to migrate to Appium 2.x. It contains a list of breaking changes and how to migrate your environments or test suites to ensure compatibility with Appium 2.0.

# Overview of Appium 2.0
Appium 2.0 is the most major new release of Appium in over 5 years. The changes in Appium 2.0 are not primarily related to changes in automation behaviors for specific platforms. Instead, Appium 2.0 reenvisions Appium as a platform where "drivers" (code projects that introduce support for automation of a given platform) and "plugins" (code projects that allow for overriding, altering, extending, or adding behaviors to Appium) can be easily created and shared.

At the same time, the Appium project is taking the opportunity to remove many old and deprecated bits of functionality.

Together these do introduce a few breaking changes to how Appium is installed, how drivers and various features are managed, and protocol support. These are detailed below.

# Breaking Changes
Here we call out the breaking changes and what you need to do to account for them.

## ‼ Default server base path
With Appium 1.x, the server would accept commands by default on http://localhost:4723/wd/hub. The /wd/hub base path was a legacy convention from the days of migrating from Selenium 1 to Selenium 2, and is no longer relevant. As such the default base path for the server is now /. If you want to retain the old behaviour, you can set the base path via a command line argument as follows:

`appium --base-path=/wd/hub`

## ‼ Installing drivers during setup
When you installed Appium 1.x, all available drivers would be installed at the same time as the main Appium server. This is no longer the case. Simply installing Appium 2.0 (e.g., by npm install -g appium@next), will install the Appium server only, but no drivers. To install drivers, you must instead use the new [Appium extension CLI](https://appium.github.io/appium/docs/en/2.0/cli/extensions/). For example, to install the latest versions of the XCUITest and UiAutomator2 drivers, after installing Appium you would run the following commands:

```
appium driver install uiautomator2,xcuitest     # installs the latest driver version  
```
At this point, your drivers are installed and ready. There's a lot more you can do with this CLI so be sure to check out the docs on it. If you're running in a CI environment or want to install Appium along with some drivers all in one step, you can do so using some special flags during install, for example:

`npm install --global appium --drivers=xcuitest,uiautomator2`
This will install Appium and the two drivers for you in one go. Please uninstall any existing Appium 1.x npm packages (with npm uninstall -g appium) if you get an installation or startup error.

## ‼ Capabilities
One significant difference between old and new protocols is in the format of capabilities. Previously called "desired capabilities", and now called simply "capabilities", there is now a requirement for a so-called "vendor prefix" on any non-standard capabilities. The list of standard capabilities is given in the [WebDriver Protocol spec](https://www.w3.org/TR/webdriver/#capabilities), and includes a few commonly used capabilities such as browserName and platformName.

These standard capabilities continue to be used as-is. All other capabilities must include a "vendor prefix" in their name. A vendor prefix is a string followed by a colon, such as appium:. Most of Appium's capabilities go beyond the standard W3C capabilities and must therefore include vendor prefixes (we recommend that you use appium: unless directed otherwise by documentation). For example:

```
`appium:app`
`appium:noReset`
`appium:deviceName`
```

This requirement may or may not be a breaking change for your test suites when targeting Appium 2.0. If you're using an updated Appium client (at least one maintained by the Appium team), the client will add the appium: prefix for you on all necessary capabilities automatically. New versions of [Appium Inspector](https://github.com/appium/appium-inspector) will also do this. Cloud-based Appium providers may also do this. So simply be aware that if you get any messages to the effect that your capabilities lack a vendor prefix, this is how you solve that problem.

To make everyone's lives a bit easier with CodeceptJS, you don't need to update your capabilities to include "vendor prefix", CodeceptJS does it for you out of the box.

## ‼ WebdriverIO upgrade
CodeceptJS should be installed with webdriverio support, as the moment of testing, `webdriverio@8.6.3` works seamlessly:
```bash
npm install codeceptjs webdriverio@8.6.3 --save
```

## ‼ CodeceptJS configuration

```
...
        appiumV2: true, // set this to true to try out appium 2.x
        'app': `${process.cwd()}/build/Monefy_Pro_v1.15.0.apk`,
        'platform': 'android',
        'device': 'emulator',
        'port': DEFAULT_PORT,
        'path': '/wd/hub',
        browser: '',
        desiredCapabilities: {
            'appPackage': data.packageName,
            'deviceName': process.env.DEVICE || 'Emulator',
            'platformName': process.env.PLATFORM || 'android',
            'platformVersion': process.env.OS_VERSION || '11.0',
            'automationName': process.env.ENGINE || 'UIAutomator2',
            'avd': process.env.UDID || 'Pixel_XL_API_30',
            'newCommandTimeout': 300000,
            'androidDeviceReadyTimeout': 300000,
            'androidInstallTimeout': 90000,
            'appWaitDuration': 300000,
            'autoGrantPermissions': true,
            'gpsEnabled': true,
            'isHeadless': false,
            'noReset': false,
            'noSign': true,
        }
...
```


Demo project to try with Appium v2: https://github.com/kobenguyent/thanh-nguyen/tree/main/task2
