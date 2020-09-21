let webdriverio;

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const requireg = require('requireg');

const Helper = require('../helper');
const stringIncludes = require('../assert/include').includes;
const { urlEquals, equals } = require('../assert/equal');
const { debug } = require('../output');
const empty = require('../assert/empty').empty;
const truth = require('../assert/truth').truth;
const {
  xpathLocator,
  fileExists,
  decodeUrl,
  chunkArray,
  convertCssPropertiesToCamelCase,
  screenshotOutputFolder,
  getNormalizedKeyAttributeValue,
  modifierKeys,
} = require('../utils');
const {
  isColorProperty,
  convertColorToRGBA,
} = require('../colorUtils');
const ElementNotFound = require('./errors/ElementNotFound');
const ConnectionRefused = require('./errors/ConnectionRefused');
const Locator = require('../locator');

const SHADOW = 'shadow';
const webRoot = 'body';

let version;
/**
 * WebDriver helper which wraps [webdriverio](http://webdriver.io/) library to
 * manipulate browser using Selenium WebDriver or PhantomJS.
 *
 * WebDriver requires Selenium Server and ChromeDriver/GeckoDriver to be installed. Those tools can be easily installed via NPM. Please check [Testing with WebDriver](https://codecept.io/webdriver/#testing-with-webdriver) for more details.
 *
 * ### Configuration
 *
 * This helper should be configured in codecept.json or codecept.conf.js
 *
 * * `url`: base url of website to be tested.
 * * `basicAuth`: (optional) the basic authentication to pass to base url. Example: {username: 'username', password: 'password'}
 * * `browser`: browser in which to perform testing.
 * * `host`: (optional, default: localhost) - WebDriver host to connect.
 * * `port`: (optional, default: 4444) - WebDriver port to connect.
 * * `protocol`: (optional, default: http) - protocol for WebDriver server.
 * * `path`: (optional, default: /wd/hub) - path to WebDriver server,
 * * `restart`: (optional, default: true) - restart browser between tests.
 * * `smartWait`: (optional) **enables [SmartWait](http://codecept.io/acceptance/#smartwait)**; wait for additional milliseconds for element to appear. Enable for 5 secs: "smartWait": 5000.
 * * `disableScreenshots`: (optional, default: false) - don't save screenshots on failure.
 * * `fullPageScreenshots` (optional, default: false) - make full page screenshots on failure.
 * * `uniqueScreenshotNames`: (optional, default: false) - option to prevent screenshot override if you have scenarios with the same name in different suites.
 * * `keepBrowserState`: (optional, default: false) - keep browser state between tests when `restart` is set to false.
 * * `keepCookies`: (optional, default: false) - keep cookies between tests when `restart` set to false.
 * * `windowSize`: (optional) default window size. Set to `maximize` or a dimension in the format `640x480`.
 * * `waitForTimeout`: (optional, default: 1000) sets default wait time in *ms* for all `wait*` functions.
 * * `desiredCapabilities`: Selenium's [desired
 * capabilities](https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities).
 * * `manualStart`: (optional, default: false) - do not start browser before a test, start it manually inside a helper
 * with `this.helpers["WebDriver"]._startBrowser()`.
 * * `timeouts`: [WebDriver timeouts](http://webdriver.io/docs/timeouts.html) defined as hash.
 *
 * Example:
 *
 * ```js
 * {
 *    helpers: {
 *      WebDriver : {
 *        smartWait: 5000,
 *        browser: "chrome",
 *        restart: false,
 *        windowSize: "maximize",
 *        timeouts: {
 *          "script": 60000,
 *          "page load": 10000
 *        }
 *      }
 *    }
 * }
 * ```
 *
 * Example with basic authentication
 * ```js
 * {
 *    helpers: {
 *      WebDriver : {
 *        smartWait: 5000,
 *        browser: "chrome",
 *        basicAuth: {username: 'username', password: 'password'},
 *        restart: false,
 *        windowSize: "maximize",
 *        timeouts: {
 *          "script": 60000,
 *          "page load": 10000
 *        }
 *      }
 *    }
 * }
 * ```
 *
 * Additional configuration params can be used from [webdriverio
 * website](http://webdriver.io/guide/getstarted/configuration.html).
 *
 * ### Headless Chrome
 *
 * ```js
 * {
 *    helpers: {
 *      WebDriver : {
 *        url: "http://localhost",
 *        browser: "chrome",
 *        desiredCapabilities: {
 *          chromeOptions: {
 *            args: [ "--headless", "--disable-gpu", "--no-sandbox" ]
 *          }
 *        }
 *      }
 *    }
 * }
 * ```
 *
 * ### Internet Explorer
 *
 * Additional configuration params can be used from [IE options](https://seleniumhq.github.io/selenium/docs/api/rb/Selenium/WebDriver/IE/Options.html)
 *
 * ```js
 * {
 *    helpers: {
 *      WebDriver : {
 *        url: "http://localhost",
 *        browser: "internet explorer",
 *        desiredCapabilities: {
 *          ieOptions: {
 *            "ie.browserCommandLineSwitches": "-private",
 *            "ie.usePerProcessProxy": true,
 *            "ie.ensureCleanSession": true,
 *          }
 *        }
 *      }
 *    }
 * }
 * ```
 *
 * ### Selenoid Options
 *
 * [Selenoid](https://aerokube.com/selenoid/latest/) is a modern way to run Selenium inside Docker containers.
 * Selenoid is easy to set up and provides more features than original Selenium Server. Use `selenoidOptions` to set Selenoid capabilities
 *
 * ```js
 * {
 *    helpers: {
 *      WebDriver : {
 *        url: "http://localhost",
 *        browser: "chrome",
 *        desiredCapabilities: {
 *          selenoidOptions: {
 *            enableVNC: true,
 *          }
 *        }
 *      }
 *    }
 * }
 * ```
 *
 * ### Connect Through proxy
 *
 * CodeceptJS also provides flexible options when you want to execute tests to Selenium servers through proxy. You will
 * need to update the `helpers.WebDriver.capabilities.proxy` key.
 *
 * ```js
 * {
 *     helpers: {
 *         WebDriver: {
 *             capabilities: {
 *                 proxy: {
 *                     "proxyType": "manual|pac",
 *                     "proxyAutoconfigUrl": "URL TO PAC FILE",
 *                     "httpProxy": "PROXY SERVER",
 *                     "sslProxy": "PROXY SERVER",
 *                     "ftpProxy": "PROXY SERVER",
 *                     "socksProxy": "PROXY SERVER",
 *                     "socksUsername": "USERNAME",
 *                     "socksPassword": "PASSWORD",
 *                     "noProxy": "BYPASS ADDRESSES"
 *                 }
 *             }
 *         }
 *     }
 * }
 * ```
 * For example,
 *
 * ```js
 * {
 *     helpers: {
 *         WebDriver: {
 *             capabilities: {
 *                 proxy: {
 *                     "proxyType": "manual",
 *                     "httpProxy": "http://corporate.proxy:8080",
 *                     "socksUsername": "codeceptjs",
 *                     "socksPassword": "secret",
 *                     "noProxy": "127.0.0.1,localhost"
 *                 }
 *             }
 *         }
 *     }
 * }
 * ```
 *
 * Please refer to [Selenium - Proxy Object](https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities) for more
 * information.
 *
 * ### Cloud Providers
 *
 * WebDriver makes it possible to execute tests against services like `Sauce Labs` `BrowserStack` `TestingBot`
 * Check out their documentation on [available parameters](http://webdriver.io/guide/usage/cloudservices.html)
 *
 * Connecting to `BrowserStack` and `Sauce Labs` is simple. All you need to do
 * is set the `user` and `key` parameters. WebDriver automatically know which
 * service provider to connect to.
 *
 * ```js
 * {
 *     helpers:{
 *         WebDriver: {
 *             url: "YOUR_DESIRED_HOST",
 *             user: "YOUR_BROWSERSTACK_USER",
 *             key: "YOUR_BROWSERSTACK_KEY",
 *             capabilities: {
 *                 "browserName": "chrome",
 *
 *                 // only set this if you're using BrowserStackLocal to test a local domain
 *                 // "browserstack.local": true,
 *
 *                 // set this option to tell browserstack to provide addition debugging info
 *                 // "browserstack.debug": true,
 *             }
 *         }
 *     }
 * }
 * ```
 *
 * #### SauceLabs
 *
 * SauceLabs can be configured via wdio service, which should be installed additionally:
 *
 * ```
 * npm i @wdio/sauce-service --save
 * ```
 *
 * It is important to make sure it is compatible with current webdriverio version.
 *
 * Enable `wdio` plugin in plugins list and add `sauce` service:
 *
 * ```js
 * plugins: {
 *    wdio: {
  *       enabled: true,
 *        services: ['sauce'],
 *        user: ... ,// saucelabs username
 *        key: ... // saucelabs api key
 *        // additional config, from sauce service
 *    }
 * }
 * ```
 *
 * See [complete reference on webdriver.io](https://webdriver.io/docs/sauce-service.html).
 *
 * > Alternatively, use [codeceptjs-saucehelper](https://github.com/puneet0191/codeceptjs-saucehelper/) for better reporting.
 *
 * #### BrowserStack
 *
 * BrowserStack can be configured via wdio service, which should be installed additionally:
 *
 * ```
 * npm i @wdio/browserstack-service --save
 * ```
 *
 * It is important to make sure it is compatible with current webdriverio version.
 *
 * Enable `wdio` plugin in plugins list and add `browserstack` service:
 *
 * ```js
 * plugins: {
 *    wdio: {
  *       enabled: true,
 *        services: ['browserstack'],
 *        user: ... ,// browserstack username
 *        key: ... // browserstack api key
 *        // additional config, from browserstack service
 *    }
 * }
 * ```
 *
 * See [complete reference on webdriver.io](https://webdriver.io/docs/browserstack-service.html).
 *
 * > Alternatively, use [codeceptjs-bshelper](https://github.com/PeterNgTr/codeceptjs-bshelper) for better reporting.
 *
 * #### TestingBot
 *
 * > **Recommended**: use official [TestingBot Helper](https://github.com/testingbot/codeceptjs-tbhelper).
 *
 * Alternatively, TestingBot can be configured via wdio service, which should be installed additionally:
 *
 * ```
 * npm i @wdio/testingbot-service --save
 * ```
 *
 * It is important to make sure it is compatible with current webdriverio version.
 *
 * Enable `wdio` plugin in plugins list and add `testingbot` service:
 *
 * ```js
 * plugins: {
 *   wdio: {
 *       enabled: true,
 *       services: ['testingbot'],
 *       user: ... ,// testingbot key
 *       key: ... // testingbot secret
 *       // additional config, from testingbot service
 *   }
 * }
 * ```
 *
 * See [complete reference on webdriver.io](https://webdriver.io/docs/testingbot-service.html).
 *
 * #### Applitools
 *
 * Visual testing via Applitools service
 *
 * > Use [CodeceptJS Applitools Helper](https://github.com/PeterNgTr/codeceptjs-applitoolshelper) with Applitools wdio service.
 *
 *
 * ### Multiremote Capabilities
 *
 * This is a work in progress but you can control two browsers at a time right out of the box.
 * Individual control is something that is planned for a later version.
 *
 * Here is the [webdriverio docs](http://webdriver.io/guide/usage/multiremote.html) on the subject
 *
 * ```js
 * {
 *     helpers: {
 *         WebDriver: {
 *             "multiremote": {
 *                 "MyChrome": {
 *                     "desiredCapabilities": {
 *                         "browserName": "chrome"
 *                      }
 *                 },
 *                 "MyFirefox": {
 *                    "desiredCapabilities": {
 *                        "browserName": "firefox"
 *                    }
 *                 }
 *             }
 *         }
 *     }
 * }
 * ```
 *
 * ## Access From Helpers
 *
 * Receive a WebDriver client from a custom helper by accessing `browser` property:
 *
 * ```js
 * const { WebDriver } = this.helpers;
 * const browser = WebDriver.browser
 * ```
 *
 * ## Methods
 */
class WebDriver extends Helper {
  constructor(config) {
    super(config);
    webdriverio = requireg('webdriverio');
    if (webdriverio.VERSION && webdriverio.VERSION.indexOf('4') === 0) {
      throw new Error(`This helper is compatible with "webdriverio@5". Current version: ${webdriverio.VERSION}. Please upgrade webdriverio to v5+ or use WebDriverIO helper instead`);
    }
    try {
      version = JSON.parse(fs.readFileSync(path.join(requireg.resolve('webdriverio'), '/../../', 'package.json')).toString()).version;
    } catch (err) {
      this.debug('Can\'t detect webdriverio version, assuming webdriverio v6 is used');
    }

    if (isWebDriver5()) {
      console.log('DEPRECATION NOTICE:');
      console.log('You are using webdriverio v5. It is recommended to update to webdriverio@6.\nSupport of webdriverio v5 is deprecated and will be removed in CodeceptJS 3.0\n');
    }
    // set defaults
    this.root = webRoot;
    this.isWeb = true;
    this.isRunning = false;
    this.sessionWindows = {};
    this.activeSessionName = '';

    this._setConfig(config);

    Locator.addFilter((locator, result) => {
      if (typeof locator === 'string' && locator.indexOf('~') === 0) {
        // accessibility locator
        if (this.isWeb) {
          result.value = `[aria-label="${locator.slice(1)}"]`;
          result.type = 'css';
          result.output = `aria-label=${locator.slice(1)}`;
        }
      }
    });
  }

  _validateConfig(config) {
    const defaults = {
      logLevel: 'silent',
      path: '/wd/hub',
      // codeceptjs
      remoteFileUpload: true,
      smartWait: 0,
      waitForTimeout: 1000, // ms
      capabilities: {},
      restart: true,
      uniqueScreenshotNames: false,
      disableScreenshots: false,
      fullPageScreenshots: false,
      manualStart: false,
      keepCookies: false,
      keepBrowserState: false,
      deprecationWarnings: false,
      timeouts: {
        script: 1000, // ms
      },
    };

    // override defaults with config
    config = Object.assign(defaults, config);

    if (typeof config.host !== 'undefined') config.hostname = config.host; // webdriverio spec
    config.baseUrl = config.url || config.baseUrl;
    if (config.desiredCapabilities && Object.keys(config.desiredCapabilities).length) {
      config.capabilities = config.desiredCapabilities;
    }
    config.capabilities.browserName = config.browser || config.capabilities.browserName;
    if (config.capabilities.chromeOptions) {
      config.capabilities['goog:chromeOptions'] = config.capabilities.chromeOptions;
      delete config.capabilities.chromeOptions;
    }
    if (config.capabilities.firefoxOptions) {
      config.capabilities['moz:firefoxOptions'] = config.capabilities.firefoxOptions;
      delete config.capabilities.firefoxOptions;
    }
    if (config.capabilities.ieOptions) {
      config.capabilities['se:ieOptions'] = config.capabilities.ieOptions;
      delete config.capabilities.ieOptions;
    }
    if (config.capabilities.selenoidOptions) {
      config.capabilities['selenoid:options'] = config.capabilities.selenoidOptions;
      delete config.capabilities.selenoidOptions;
    }

    config.waitForTimeout /= 1000; // convert to seconds

    if (!config.capabilities.platformName && (!config.url || !config.browser)) {
      throw new Error(`
        WebDriver requires at url and browser to be set.
        Check your codeceptjs config file to ensure these are set properly
          {
            "helpers": {
              "WebDriver": {
                "url": "YOUR_HOST"
                "browser": "YOUR_PREFERRED_TESTING_BROWSER"
              }
            }
          }
      `);
    }

    return config;
  }

  static _checkRequirements() {
    try {
      requireg('webdriverio');
    } catch (e) {
      return ['webdriverio@^5.2.2'];
    }
  }

  static _config() {
    return [{
      name: 'url',
      message: 'Base url of site to be tested',
      default: 'http://localhost',
    }, {
      name: 'browser',
      message: 'Browser in which testing will be performed',
      default: 'chrome',
    }];
  }

  _beforeSuite() {
    if (!this.options.restart && !this.options.manualStart && !this.isRunning) {
      this.debugSection('Session', 'Starting singleton browser session');
      return this._startBrowser();
    }
  }

  async _startBrowser() {
    try {
      if (this.options.multiremote) {
        this.browser = await webdriverio.multiremote(this.options.multiremote);
      } else {
        // remove non w3c capabilities
        delete this.options.capabilities.protocol;
        delete this.options.capabilities.hostname;
        delete this.options.capabilities.port;
        delete this.options.capabilities.path;
        this.browser = await webdriverio.remote(this.options);
      }
    } catch (err) {
      if (err.toString().indexOf('ECONNREFUSED')) {
        throw new ConnectionRefused(err);
      }
      throw err;
    }

    this.isRunning = true;
    if (this.options.timeouts && this.isWeb) {
      await this.defineTimeout(this.options.timeouts);
    }

    await this._resizeWindowIfNeeded(this.browser, this.options.windowSize);

    this.$$ = this.browser.$$.bind(this.browser);
    return this.browser;
  }

  async _stopBrowser() {
    if (this.browser && this.isRunning) await this.browser.deleteSession();
  }

  async _before() {
    this.context = this.root;
    if (this.options.restart && !this.options.manualStart) return this._startBrowser();
    if (!this.isRunning && !this.options.manualStart) return this._startBrowser();
    this.$$ = this.browser.$$.bind(this.browser);
    return this.browser;
  }

  async _after() {
    if (!this.isRunning) return;
    if (this.options.restart) {
      this.isRunning = false;
      return this.browser.deleteSession();
    }
    if (this.browser.isInsideFrame) await this.browser.switchToFrame(null);

    if (this.options.keepBrowserState) return;

    if (!this.options.keepCookies && this.options.capabilities.browserName) {
      this.debugSection('Session', 'cleaning cookies and localStorage');
      await this.browser.deleteCookies();
    }
    await this.browser.execute('localStorage.clear();').catch((err) => {
      if (!(err.message.indexOf("Storage is disabled inside 'data:' URLs.") > -1)) throw err;
    });
    await this.closeOtherTabs();
    return this.browser;
  }

  _afterSuite() {
  }

  _finishTest() {
    if (!this.options.restart && this.isRunning) return this._stopBrowser();
  }

  _session() {
    const defaultSession = this.browser;
    return {
      start: async (sessionName, opts) => {
        // opts.disableScreenshots = true; // screenshots cant be saved as session will be already closed
        opts = this._validateConfig(Object.assign(this.options, opts));
        this.debugSection('New Browser', JSON.stringify(opts));
        const browser = await webdriverio.remote(opts);
        this.activeSessionName = sessionName;
        if (opts.timeouts && this.isWeb) {
          await this._defineBrowserTimeout(browser, opts.timeouts);
        }

        await this._resizeWindowIfNeeded(browser, opts.windowSize);

        return browser;
      },
      stop: async (browser) => {
        if (!browser) return;
        return browser.deleteSession();
      },
      loadVars: async (browser) => {
        if (this.context !== this.root) throw new Error('Can\'t start session inside within block');
        this.browser = browser;
        this.$$ = this.browser.$$.bind(this.browser);
        this.sessionWindows[this.activeSessionName] = browser;
      },
      restoreVars: async (session) => {
        if (!session) {
          this.activeSessionName = '';
        }
        this.browser = defaultSession;
        this.$$ = this.browser.$$.bind(this.browser);
      },
    };
  }

  async _failed(test) {
    if (this.context !== this.root) await this._withinEnd();
  }

  async _withinBegin(locator) {
    const frame = isFrameLocator(locator);
    if (frame) {
      this.browser.isInsideFrame = true;
      if (Array.isArray(frame)) {
        // this.switchTo(null);
        await forEachAsync(frame, async f => this.switchTo(f));
        return;
      }
      await this.switchTo(frame);
      return;
    }
    this.context = locator;

    let res = await this.browser.$$(withStrictLocator(locator));
    assertElementExists(res, locator);
    res = usingFirstElement(res);
    this.context = res.selector;
    this.$$ = res.$$.bind(res);
  }

  async _withinEnd() {
    if (this.browser.isInsideFrame) {
      this.browser.isInsideFrame = false;
      return this.switchTo(null);
    }
    this.context = this.root;
    this.$$ = this.browser.$$.bind(this.browser);
  }

  /**
   * Check if locator is type of "Shadow"
   *
   * @param {object} locator
   */
  _isShadowLocator(locator) {
    return locator.type === SHADOW || locator[SHADOW];
  }

  /**
   * Locate Element within the Shadow Dom
   *
   * @param {object} locator
   */
  async _locateShadow(locator) {
    const shadow = locator.value ? locator.value : locator[SHADOW];
    const shadowSequence = [];
    let elements;

    if (!Array.isArray(shadow)) {
      throw new Error(`Shadow '${shadow}' should be defined as an Array of elements.`);
    }

    // traverse through the Shadow locators in sequence
    for (let index = 0; index < shadow.length; index++) {
      const shadowElement = shadow[index];
      shadowSequence.push(shadowElement);

      if (!elements) {
        elements = await (this.browser.$$(shadowElement));
      } else if (Array.isArray(elements)) {
        elements = await elements[0].shadow$$(shadowElement);
      } else if (elements) {
        elements = await elements.shadow$$(shadowElement);
      }

      if (!elements || !elements[0]) {
        throw new Error(`Shadow Element '${shadowElement}' is not found. It is possible the element is incorrect or elements sequence is incorrect. Please verify the sequence '${shadowSequence.join('>')}' is correctly chained.`);
      }
    }

    this.debugSection('Elements', `Found ${elements.length} '${SHADOW}' elements`);

    return elements;
  }

  /**
   * Smart Wait to locate an element
   *
   * @param {object} locator
   */
  async _smartWait(locator) {
    this.debugSection(`SmartWait (${this.options.smartWait}ms)`, `Locating ${locator} in ${this.options.smartWait}`);
    await this.defineTimeout({ implicit: this.options.smartWait });
  }

  /**
   * Get elements by different locator types, including strict locator.
   * Should be used in custom helpers:
   *
   * ```js
   * this.helpers['WebDriver']._locate({name: 'password'}).then //...
   * ```
   *
   *
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   */
  async _locate(locator, smartWait = false) {
    if (require('../store').debugMode) smartWait = false;

    // special locator type for Shadow DOM
    if (this._isShadowLocator(locator)) {
      if (!this.options.smartWait || !smartWait) {
        const els = await this._locateShadow(locator);
        return els;
      }

      const els = await this._locateShadow(locator);
      return els;
    }

    // special locator type for React
    if (locator.react) {
      const els = await this.browser.react$$(locator.react, locator.props || undefined, locator.state || undefined);
      this.debugSection('Elements', `Found ${els.length} react components`);
      return els;
    }

    if (!this.options.smartWait || !smartWait) {
      const els = await this.$$(withStrictLocator(locator));
      return els;
    }

    await this._smartWait(locator);

    const els = await this.$$(withStrictLocator(locator));
    await this.defineTimeout({ implicit: 0 });
    return els;
  }

  /**
   * Find a checkbox by providing human readable text:
   *
   * ```js
   * this.helpers['WebDriver']._locateCheckable('I agree with terms and conditions').then // ...
   * ```
   *
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   */
  async _locateCheckable(locator) {
    return findCheckable.call(this, locator, this.$$.bind(this)).then(res => res);
  }

  /**
   * Find a clickable element by providing human readable text:
   *
   * ```js
   * const els = await this.helpers.WebDriver._locateClickable('Next page');
   * const els = await this.helpers.WebDriver._locateClickable('Next page', '.pages');
   * ```
   *
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   */
  async _locateClickable(locator, context) {
    const locateFn = prepareLocateFn.call(this, context);
    return findClickable.call(this, locator, locateFn);
  }

  /**
   * Find field elements by providing human readable text:
   *
   * ```js
   * this.helpers['WebDriver']._locateFields('Your email').then // ...
   * ```
   *
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   */
  async _locateFields(locator) {
    return findFields.call(this, locator).then(res => res);
  }

  /**
   * Set [WebDriver timeouts](https://webdriver.io/docs/timeouts.html) in realtime.
   *
   * Timeouts are expected to be passed as object:
   *
   * ```js
   * I.defineTimeout({ script: 5000 });
   * I.defineTimeout({ implicit: 10000, pageLoad: 10000, script: 5000 });
   * ```
   *
   * @param {WebdriverIO.Timeouts} timeouts WebDriver timeouts object.
   */
  defineTimeout(timeouts) {
    return this._defineBrowserTimeout(this.browser, timeouts);
  }

  _defineBrowserTimeout(browser, timeouts) {
    return browser.setTimeout(timeouts);
  }

  /**
   * Opens a web page in a browser. Requires relative or absolute url.
   * If url starts with `/`, opens a web page of a site defined in `url` config parameter.
   * 
   * ```js
   * I.amOnPage('/'); // opens main page of website
   * I.amOnPage('https://github.com'); // opens github
   * I.amOnPage('/login'); // opens a login page
   * ```
   * 
   * @param {string} url url path or global url.
   *
   */
  amOnPage(url) {
    let split_url;
    if (this.config.basicAuth) {
      if (url.startsWith('/')) {
        url = this.config.url + url;
      }
      split_url = url.split('//');
      url = `${split_url[0]}//${this.config.basicAuth.username}:${this.config.basicAuth.password}@${split_url[1]}`;
    }
    return this.browser.url(url);
  }

  /**
   * Perform a click on a link or a button, given by a locator.
   * If a fuzzy locator is given, the page will be searched for a button, link, or image matching the locator string.
   * For buttons, the "value" attribute, "name" attribute, and inner text are searched. For links, the link text is searched.
   * For images, the "alt" attribute and inner text of any parent links are searched.
   * 
   * The second parameter is a context (CSS or XPath locator) to narrow the search.
   * 
   * ```js
   * // simple link
   * I.click('Logout');
   * // button of form
   * I.click('Submit');
   * // CSS button
   * I.click('#form input[type=submit]');
   * // XPath
   * I.click('//form/*[@type=submit]');
   * // link in context
   * I.click('Logout', '#nav');
   * // using strict locator
   * I.click({css: 'nav a.login'});
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator clickable link or button located by text, or any element located by CSS|XPath|strict locator.
   * @param {?CodeceptJS.LocatorOrString} [context=null] (optional, `null` by default) element to search in CSS|XPath|Strict locator.
   * 
   *
   * {{ react }}
   */
  async click(locator, context = null) {
    const clickMethod = this.browser.isMobile ? 'touchClick' : 'elementClick';
    const locateFn = prepareLocateFn.call(this, context);

    const res = await findClickable.call(this, locator, locateFn);
    if (context) {
      assertElementExists(res, locator, 'Clickable element', `was not found inside element ${new Locator(context)}`);
    } else {
      assertElementExists(res, locator, 'Clickable element');
    }
    const elem = usingFirstElement(res);
    return this.browser[clickMethod](getElementId(elem));
  }

  /**
   * Perform an emulated click on a link or a button, given by a locator.
   * Unlike normal click instead of sending native event, emulates a click with JavaScript.
   * This works on hidden, animated or inactive elements as well.
   * 
   * If a fuzzy locator is given, the page will be searched for a button, link, or image matching the locator string.
   * For buttons, the "value" attribute, "name" attribute, and inner text are searched. For links, the link text is searched.
   * For images, the "alt" attribute and inner text of any parent links are searched.
   * 
   * The second parameter is a context (CSS or XPath locator) to narrow the search.
   * 
   * ```js
   * // simple link
   * I.forceClick('Logout');
   * // button of form
   * I.forceClick('Submit');
   * // CSS button
   * I.forceClick('#form input[type=submit]');
   * // XPath
   * I.forceClick('//form/*[@type=submit]');
   * // link in context
   * I.forceClick('Logout', '#nav');
   * // using strict locator
   * I.forceClick({css: 'nav a.login'});
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator clickable link or button located by text, or any element located by CSS|XPath|strict locator.
   * @param {?CodeceptJS.LocatorOrString} [context=null] (optional, `null` by default) element to search in CSS|XPath|Strict locator.
   * 
   *
   * {{ react }}
   */
  async forceClick(locator, context = null) {
    const locateFn = prepareLocateFn.call(this, context);

    const res = await findClickable.call(this, locator, locateFn);
    if (context) {
      assertElementExists(res, locator, 'Clickable element', `was not found inside element ${new Locator(context)}`);
    } else {
      assertElementExists(res, locator, 'Clickable element');
    }
    const elem = usingFirstElement(res);

    return this.executeScript((el) => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      const event = document.createEvent('MouseEvent');
      event.initEvent('click', true, true);
      return el.dispatchEvent(event);
    }, elem);
  }

  /**
   * Performs a double-click on an element matched by link|button|label|CSS or XPath.
   * Context can be specified as second parameter to narrow search.
   * 
   * ```js
   * I.doubleClick('Edit');
   * I.doubleClick('Edit', '.actions');
   * I.doubleClick({css: 'button.accept'});
   * I.doubleClick('.btn.edit');
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator clickable link or button located by text, or any element located by CSS|XPath|strict locator.
   * @param {?CodeceptJS.LocatorOrString} [context=null] (optional, `null` by default) element to search in CSS|XPath|Strict locator.
   * 
   *
   * {{ react }}
   */
  async doubleClick(locator, context = null) {
    const locateFn = prepareLocateFn.call(this, context);

    const res = await findClickable.call(this, locator, locateFn);
    if (context) {
      assertElementExists(res, locator, 'Clickable element', `was not found inside element ${new Locator(context)}`);
    } else {
      assertElementExists(res, locator, 'Clickable element');
    }

    const elem = usingFirstElement(res);
    return elem.doubleClick();
  }

  /**
   * Performs right click on a clickable element matched by semantic locator, CSS or XPath.
   * 
   * ```js
   * // right click element with id el
   * I.rightClick('#el');
   * // right click link or button with text "Click me"
   * I.rightClick('Click me');
   * // right click button with text "Click me" inside .context
   * I.rightClick('Click me', '.context');
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator clickable element located by CSS|XPath|strict locator.
   * @param {?CodeceptJS.LocatorOrString} [context=null] (optional, `null` by default) element located by CSS|XPath|strict locator.
   * 
   *
   * {{ react }}
   */
  async rightClick(locator, context) {
    const locateFn = prepareLocateFn.call(this, context);

    const res = await findClickable.call(this, locator, locateFn);
    if (context) {
      assertElementExists(res, locator, 'Clickable element', `was not found inside element ${new Locator(context)}`);
    } else {
      assertElementExists(res, locator, 'Clickable element');
    }

    const el = usingFirstElement(res);

    await el.moveTo();

    if (this.browser.isW3C) {
      return el.click({ button: 'right' });
    }
    // JSON Wire version
    await this.browser.buttonDown(2);
  }

  /**
   * Emulates right click on an element.
   * Unlike normal click instead of sending native event, emulates a click with JavaScript.
   * This works on hidden, animated or inactive elements as well.
   * 
   * If a fuzzy locator is given, the page will be searched for a button, link, or image matching the locator string.
   * For buttons, the "value" attribute, "name" attribute, and inner text are searched. For links, the link text is searched.
   * For images, the "alt" attribute and inner text of any parent links are searched.
   * 
   * The second parameter is a context (CSS or XPath locator) to narrow the search.
   * 
   * ```js
   * // simple link
   * I.forceRightClick('Menu');
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator clickable link or button located by text, or any element located by CSS|XPath|strict locator.
   * @param {?CodeceptJS.LocatorOrString} [context=null] (optional, `null` by default) element to search in CSS|XPath|Strict locator.
   * 
   *
   * {{ react }}
   */
  async forceRightClick(locator, context = null) {
    const locateFn = prepareLocateFn.call(this, context);

    const res = await findClickable.call(this, locator, locateFn);
    if (context) {
      assertElementExists(res, locator, 'Clickable element', `was not found inside element ${new Locator(context)}`);
    } else {
      assertElementExists(res, locator, 'Clickable element');
    }
    const elem = usingFirstElement(res);

    return this.executeScript((el) => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      const event = document.createEvent('MouseEvent');
      event.initEvent('contextmenu', true, true);
      return el.dispatchEvent(event);
    }, elem);
  }

  /**
   * Fills a text field or textarea, after clearing its value, with the given string.
   * Field is located by name, label, CSS, or XPath.
   * 
   * ```js
   * // by label
   * I.fillField('Email', 'hello@world.com');
   * // by name
   * I.fillField('password', secret('123456'));
   * // by CSS
   * I.fillField('form#login input[name=username]', 'John');
   * // or by strict locator
   * I.fillField({css: 'form#login input[name=username]'}, 'John');
   * ```
   * @param {CodeceptJS.LocatorOrString} field located by label|name|CSS|XPath|strict locator.
   * @param {string} value text value to fill.
   * 
   * {{ react }}
   *
   */
  async fillField(field, value) {
    const res = await findFields.call(this, field);
    assertElementExists(res, field, 'Field');
    const elem = usingFirstElement(res);
    return elem.setValue(value.toString());
  }

  /**
   * Appends text to a input field or textarea.
   * Field is located by name, label, CSS or XPath
   * 
   * ```js
   * I.appendField('#myTextField', 'appended');
   * ```
   * @param {CodeceptJS.LocatorOrString} field located by label|name|CSS|XPath|strict locator
   * @param {string} value text value to append.
   * {{ react }}
   */
  async appendField(field, value) {
    const res = await findFields.call(this, field);
    assertElementExists(res, field, 'Field');
    const elem = usingFirstElement(res);
    return elem.addValue(value);
  }

  /**
   * Clears a `<textarea>` or text `<input>` element's value.
   * 
   * ```js
   * I.clearField('Email');
   * I.clearField('user[email]');
   * I.clearField('#email');
   * ```
   * @param {string|object} editable field located by label|name|CSS|XPath|strict locator.
   *
   */
  async clearField(field) {
    const res = await findFields.call(this, field);
    assertElementExists(res, field, 'Field');
    const elem = usingFirstElement(res);
    return elem.clearValue(getElementId(elem));
  }

  /**
   * Selects an option in a drop-down select.
   * Field is searched by label | name | CSS | XPath.
   * Option is selected by visible text or by value.
   * 
   * ```js
   * I.selectOption('Choose Plan', 'Monthly'); // select by label
   * I.selectOption('subscription', 'Monthly'); // match option by text
   * I.selectOption('subscription', '0'); // or by value
   * I.selectOption('//form/select[@name=account]','Premium');
   * I.selectOption('form select[name=account]', 'Premium');
   * I.selectOption({css: 'form select[name=account]'}, 'Premium');
   * ```
   * 
   * Provide an array for the second argument to select multiple options.
   * 
   * ```js
   * I.selectOption('Which OS do you use?', ['Android', 'iOS']);
   * ```
   * @param {CodeceptJS.LocatorOrString} select field located by label|name|CSS|XPath|strict locator.
   * @param {string|Array<*>} option visible text or value of option.
   */
  async selectOption(select, option) {
    const res = await findFields.call(this, select);
    assertElementExists(res, select, 'Selectable field');
    const elem = usingFirstElement(res);

    if (!Array.isArray(option)) {
      option = [option];
    }

    // select options by visible text
    let els = await forEachAsync(option, async opt => this.browser.findElementsFromElement(getElementId(elem), 'xpath', Locator.select.byVisibleText(xpathLocator.literal(opt))));

    const clickOptionFn = async (el) => {
      if (el[0]) el = el[0];
      const elementId = getElementId(el);
      if (elementId) return this.browser.elementClick(elementId);
    };

    if (Array.isArray(els) && els.length) {
      return forEachAsync(els, clickOptionFn);
    }
    // select options by value
    els = await forEachAsync(option, async opt => this.browser.findElementsFromElement(getElementId(elem), 'xpath', Locator.select.byValue(xpathLocator.literal(opt))));
    if (els.length === 0) {
      throw new ElementNotFound(select, `Option "${option}" in`, 'was not found neither by a visible text nor by a value');
    }
    return forEachAsync(els, clickOptionFn);
  }

  /**
   * Attaches a file to element located by label, name, CSS or XPath
   * Path to file is relative current codecept directory (where codecept.json or codecept.conf.js is located).
   * File will be uploaded to remote system (if tests are running remotely).
   * 
   * ```js
   * I.attachFile('Avatar', 'data/avatar.jpg');
   * I.attachFile('form input[name=avatar]', 'data/avatar.jpg');
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator field located by label|name|CSS|XPath|strict locator.
   * @param {string} pathToFile local file path relative to codecept.json config file.
   * Appium: not tested
   */
  async attachFile(locator, pathToFile) {
    let file = path.join(global.codecept_dir, pathToFile);
    if (!fileExists(file)) {
      throw new Error(`File at ${file} can not be found on local system`);
    }

    const res = await findFields.call(this, locator);
    this.debug(`Uploading ${file}`);
    assertElementExists(res, locator, 'File field');
    const el = usingFirstElement(res);

    // Remote Upload (when running Selenium Server)
    if (this.options.remoteFileUpload) {
      try {
        this.debugSection('File', 'Uploading file to remote server');
        file = await this.browser.uploadFile(file);
      } catch (err) {
        throw new Error(`File can't be transferred to remote server. Set \`remoteFileUpload: false\` in config to upload file locally.\n${err.message}`);
      }
    }

    return el.addValue(file);
  }

  /**
   * Selects a checkbox or radio button.
   * Element is located by label or name or CSS or XPath.
   * 
   * The second parameter is a context (CSS or XPath locator) to narrow the search.
   * 
   * ```js
   * I.checkOption('#agree');
   * I.checkOption('I Agree to Terms and Conditions');
   * I.checkOption('agree', '//form');
   * ```
   * @param {CodeceptJS.LocatorOrString} field checkbox located by label | name | CSS | XPath | strict locator.
   * @param {?CodeceptJS.LocatorOrString} [context=null] (optional, `null` by default) element located by CSS | XPath | strict locator.
   * Appium: not tested
   */
  async checkOption(field, context = null) {
    const clickMethod = this.browser.isMobile ? 'touchClick' : 'elementClick';
    const locateFn = prepareLocateFn.call(this, context);

    const res = await findCheckable.call(this, field, locateFn);

    assertElementExists(res, field, 'Checkable');
    const elem = usingFirstElement(res);
    const elementId = getElementId(elem);

    const isSelected = await this.browser.isElementSelected(elementId);
    if (isSelected) return Promise.resolve(true);
    return this.browser[clickMethod](elementId);
  }

  /**
   * Unselects a checkbox or radio button.
   * Element is located by label or name or CSS or XPath.
   * 
   * The second parameter is a context (CSS or XPath locator) to narrow the search.
   * 
   * ```js
   * I.uncheckOption('#agree');
   * I.uncheckOption('I Agree to Terms and Conditions');
   * I.uncheckOption('agree', '//form');
   * ```
   * @param {CodeceptJS.LocatorOrString} field checkbox located by label | name | CSS | XPath | strict locator.
   * @param {?CodeceptJS.LocatorOrString} [context=null] (optional, `null` by default) element located by CSS | XPath | strict locator.
   * Appium: not tested
   */
  async uncheckOption(field, context = null) {
    const clickMethod = this.browser.isMobile ? 'touchClick' : 'elementClick';
    const locateFn = prepareLocateFn.call(this, context);

    const res = await findCheckable.call(this, field, locateFn);

    assertElementExists(res, field, 'Checkable');
    const elem = usingFirstElement(res);
    const elementId = getElementId(elem);

    const isSelected = await this.browser.isElementSelected(elementId);
    if (!isSelected) return Promise.resolve(true);
    return this.browser[clickMethod](elementId);
  }

  /**
   * Retrieves a text from an element located by CSS or XPath and returns it to test.
   * Resumes test execution, so **should be used inside async with `await`** operator.
   * 
   * ```js
   * let pin = await I.grabTextFrom('#pin');
   * ```
   * If multiple elements found returns an array of texts.
   * 
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * @returns {Promise<string|string[]>} attribute value
   *
   */
  async grabTextFrom(locator) {
    const res = await this._locate(locator, true);
    assertElementExists(res, locator);
    let val;
    if (res.length > 1) {
      val = await forEachAsync(res, async el => this.browser.getElementText(getElementId(el)));
    } else {
      val = await this.browser.getElementText(getElementId(res[0]));
    }
    this.debugSection('Grab', val);
    return val;
  }

  /**
   * Retrieves the innerHTML from an element located by CSS or XPath and returns it to test.
   * Resumes test execution, so **should be used inside async function with `await`** operator.
   * If more than one element is found - an array of HTMLs returned.
   * 
   * ```js
   * let postHTML = await I.grabHTMLFrom('#post');
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} element located by CSS|XPath|strict locator.
   * @returns {Promise<string>} HTML code for an element
   *
   */
  async grabHTMLFrom(locator) {
    const elems = await this._locate(locator, true);
    assertElementExists(elems, locator);
    const values = await Promise.all(elems.map(elem => elem.getHTML(false)));
    this.debugSection('Grab', values);
    if (Array.isArray(values) && values.length === 1) {
      return values[0];
    }
    return values;
  }

  /**
   * Retrieves a value from a form element located by CSS or XPath and returns it to test.
   * Resumes test execution, so **should be used inside async function with `await`** operator.
   * 
   * ```js
   * let email = await I.grabValueFrom('input[name=email]');
   * ```
   * @param {CodeceptJS.LocatorOrString} locator field located by label|name|CSS|XPath|strict locator.
   * @returns {Promise<string>} attribute value
   *
   */
  async grabValueFrom(locator) {
    const res = await this._locate(locator, true);
    assertElementExists(res, locator);

    return forEachAsync(res, async el => el.getValue());
  }

  /**
   * Grab CSS property for given locator
   * Resumes test execution, so **should be used inside an async function with `await`** operator.
   * 
   * ```js
   * const value = await I.grabCssPropertyFrom('h3', 'font-weight');
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * @param {string} cssProperty CSS property name.
   * @returns {Promise<string>} CSS value
   */
  async grabCssPropertyFrom(locator, cssProperty) {
    const res = await this._locate(locator, true);
    assertElementExists(res, locator);
    return forEachAsync(res, async el => this.browser.getElementCSSValue(getElementId(el), cssProperty));
  }

  /**
   * Retrieves an attribute from an element located by CSS or XPath and returns it to test.
   * An array as a result will be returned if there are more than one matched element.
   * Resumes test execution, so **should be used inside async function with `await`** operator.
   * 
   * ```js
   * let hint = await I.grabAttributeFrom('#tooltip', 'title');
   * ```
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * @param {string} attr attribute name.
   * @returns {Promise<string>} attribute value
   * Appium: can be used for apps only with several values ("contentDescription", "text", "className", "resourceId")
   */
  async grabAttributeFrom(locator, attr) {
    const res = await this._locate(locator, true);
    assertElementExists(res, locator);
    return forEachAsync(res, async el => el.getAttribute(attr));
  }

  /**
   * Checks that title contains text.
   * 
   * ```js
   * I.seeInTitle('Home Page');
   * ```
   * 
   * @param {string} text text value to check.
   *
   */
  async seeInTitle(text) {
    const title = await this.browser.getTitle();
    return stringIncludes('web page title').assert(text, title);
  }

  /**
   * Checks that title is equal to provided one.
   *
   * ```js
   * I.seeTitleEquals('Test title.');
   * ```
   *
   * @param {string} text value to check.
   */
  async seeTitleEquals(text) {
    const title = await this.browser.getTitle();
    return assert.equal(title, text, `expected web page title to be ${text}, but found ${title}`);
  }

  /**
   * Checks that title does not contain text.
   * 
   * ```js
   * I.dontSeeInTitle('Error');
   * ```
   * 
   * @param {string} text value to check.
   *
   */
  async dontSeeInTitle(text) {
    const title = await this.browser.getTitle();
    return stringIncludes('web page title').negate(text, title);
  }

  /**
   * Retrieves a page title and returns it to test.
   * Resumes test execution, so **should be used inside async with `await`** operator.
   * 
   * ```js
   * let title = await I.grabTitle();
   * ```
   * 
   * @returns {Promise<string>} title
   *
   */
  async grabTitle() {
    const title = await this.browser.getTitle();
    this.debugSection('Title', title);
    return title;
  }

  /**
   * Checks that a page contains a visible text.
   * Use context parameter to narrow down the search.
   * 
   * ```js
   * I.see('Welcome'); // text welcome on a page
   * I.see('Welcome', '.content'); // text inside .content div
   * I.see('Register', {css: 'form.register'}); // use strict locator
   * ```
   * @param {string} text expected on page.
   * @param {?CodeceptJS.LocatorOrString} [context=null] (optional, `null` by default) element located by CSS|Xpath|strict locator in which to search for text.
   *
   * {{ react }}
   */
  async see(text, context = null) {
    return proceedSee.call(this, 'assert', text, context);
  }

  /**
   * Checks that text is equal to provided one.
   * 
   * ```js
   * I.seeTextEquals('text', 'h1');
   * ```
   * 
   * @param {string} text element value to check.
   * @param {CodeceptJS.LocatorOrString?} [context=null]  element located by CSS|XPath|strict locator.
   */
  async seeTextEquals(text, context = null) {
    return proceedSee.call(this, 'assert', text, context, true);
  }

  /**
   * Opposite to `see`. Checks that a text is not present on a page.
   * Use context parameter to narrow down the search.
   * 
   * ```js
   * I.dontSee('Login'); // assume we are already logged in.
   * I.dontSee('Login', '.nav'); // no login inside .nav element
   * ```
   * 
   * @param {string} text which is not present.
   * @param {CodeceptJS.LocatorOrString} [context] (optional) element located by CSS|XPath|strict locator in which to perfrom search.
   * 
   *
   * {{ react }}
   */
  async dontSee(text, context = null) {
    return proceedSee.call(this, 'negate', text, context);
  }

  /**
   * Checks that the given input field or textarea equals to given value.
   * For fuzzy locators, fields are matched by label text, the "name" attribute, CSS, and XPath.
   * 
   * ```js
   * I.seeInField('Username', 'davert');
   * I.seeInField({css: 'form textarea'},'Type your comment here');
   * I.seeInField('form input[type=hidden]','hidden_value');
   * I.seeInField('#searchform input','Search');
   * ```
   * @param {CodeceptJS.LocatorOrString} field located by label|name|CSS|XPath|strict locator.
   * @param {string} value value to check.
   * 
   *
   */
  async seeInField(field, value) {
    return proceedSeeField.call(this, 'assert', field, value);
  }

  /**
   * Checks that value of input field or textarea doesn't equal to given value
   * Opposite to `seeInField`.
   * 
   * ```js
   * I.dontSeeInField('email', 'user@user.com'); // field by name
   * I.dontSeeInField({ css: 'form input.email' }, 'user@user.com'); // field by CSS
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} field located by label|name|CSS|XPath|strict locator.
   * @param {string} value value to check.
   *
   */
  async dontSeeInField(field, value) {
    return proceedSeeField.call(this, 'negate', field, value);
  }

  /**
   * Verifies that the specified checkbox is checked.
   * 
   * ```js
   * I.seeCheckboxIsChecked('Agree');
   * I.seeCheckboxIsChecked('#agree'); // I suppose user agreed to terms
   * I.seeCheckboxIsChecked({css: '#signup_form input[type=checkbox]'});
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} field located by label|name|CSS|XPath|strict locator.
   * 
   * Appium: not tested
   */
  async seeCheckboxIsChecked(field) {
    return proceedSeeCheckbox.call(this, 'assert', field);
  }

  /**
   * Verifies that the specified checkbox is not checked.
   * 
   * ```js
   * I.dontSeeCheckboxIsChecked('#agree'); // located by ID
   * I.dontSeeCheckboxIsChecked('I agree to terms'); // located by label
   * I.dontSeeCheckboxIsChecked('agree'); // located by name
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} field located by label|name|CSS|XPath|strict locator.
   * 
   * Appium: not tested
   */
  async dontSeeCheckboxIsChecked(field) {
    return proceedSeeCheckbox.call(this, 'negate', field);
  }

  /**
   * Checks that a given Element is visible
   * Element is located by CSS or XPath.
   * 
   * ```js
   * I.seeElement('#modal');
   * ```
   * @param {CodeceptJS.LocatorOrString} locator located by CSS|XPath|strict locator.
   * {{ react }}
   *
   */
  async seeElement(locator) {
    const res = await this._locate(locator, true);
    assertElementExists(res, locator);
    const selected = await forEachAsync(res, async el => el.isDisplayed());
    return truth(`elements of ${locator}`, 'to be seen').assert(selected);
  }

  /**
   * Opposite to `seeElement`. Checks that element is not visible (or in DOM)
   * 
   * ```js
   * I.dontSeeElement('.modal'); // modal is not shown
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator located by CSS|XPath|Strict locator.
   * {{ react }}
   */
  async dontSeeElement(locator) {
    const res = await this._locate(locator, false);
    if (!res || res.length === 0) {
      return truth(`elements of ${locator}`, 'to be seen').negate(false);
    }
    const selected = await forEachAsync(res, async el => el.isDisplayed());
    return truth(`elements of ${locator}`, 'to be seen').negate(selected);
  }

  /**
   * Checks that a given Element is present in the DOM
   * Element is located by CSS or XPath.
   * 
   * ```js
   * I.seeElementInDOM('#modal');
   * ```
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * 
   *
   */
  async seeElementInDOM(locator) {
    const res = await this.$$(withStrictLocator(locator));
    return empty('elements').negate(res);
  }

  /**
   * Opposite to `seeElementInDOM`. Checks that element is not on page.
   * 
   * ```js
   * I.dontSeeElementInDOM('.nav'); // checks that element is not on page visible or not
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator located by CSS|XPath|Strict locator.
   *
   */
  async dontSeeElementInDOM(locator) {
    const res = await this.$$(withStrictLocator(locator));
    return empty('elements').assert(res);
  }

  /**
   * Checks that the current page contains the given string in its raw source code.
   * 
   * ```js
   * I.seeInSource('<h1>Green eggs &amp; ham</h1>');
   * ```
   * @param {string} text value to check.
   *
   */
  async seeInSource(text) {
    const source = await this.browser.getPageSource();
    return stringIncludes('HTML source of a page').assert(text, source);
  }

  /**
   * Retrieves page source and returns it to test.
   * Resumes test execution, so **should be used inside async function with `await`** operator.
   * 
   * ```js
   * let pageSource = await I.grabSource();
   * ```
   * 
   * @returns {Promise<string>} source code
   *
   */
  async grabSource() {
    return this.browser.getPageSource();
  }

  /**
   * Get JS log from browser. Log buffer is reset after each request.
   *
   * ```js
   * let logs = await I.grabBrowserLogs();
   * console.log(JSON.stringify(logs))
   * ```
   * @returns {Promise<string|undefined>}
   */
  async grabBrowserLogs() {
    if (this.browser.isW3C) {
      this.debug('Logs not awailable in W3C specification');
      return;
    }
    return this.browser.getLogs('browser');
  }

  /**
   * Get current URL from browser.
   * Resumes test execution, so should be used inside an async function.
   * 
   * ```js
   * let url = await I.grabCurrentUrl();
   * console.log(`Current URL is [${url}]`);
   * ```
   * 
   * @returns {Promise<string>} current URL
   */
  async grabCurrentUrl() {
    const res = await this.browser.getUrl();
    this.debugSection('Url', res);
    return res;
  }

  /**
   * Checks that the current page does not contains the given string in its raw source code.
   * 
   * ```js
   * I.dontSeeInSource('<!--'); // no comments in source
   * ```
   * 
   * @param {string} value to check.
   * 
   */
  async dontSeeInSource(text) {
    const source = await this.browser.getPageSource();
    return stringIncludes('HTML source of a page').negate(text, source);
  }

  /**
   * Asserts that an element appears a given number of times in the DOM.
   * Element is located by label or name or CSS or XPath.
   * 
   * 
   * ```js
   * I.seeNumberOfElements('#submitBtn', 1);
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * @param {number} num number of elements.
   * 
   * {{ react }}
   */
  async seeNumberOfElements(locator, num) {
    const res = await this._locate(locator);
    return assert.equal(res.length, num, `expected number of elements (${locator}) is ${num}, but found ${res.length}`);
  }

  /**
   * Asserts that an element is visible a given number of times.
   * Element is located by CSS or XPath.
   * 
   * ```js
   * I.seeNumberOfVisibleElements('.buttons', 3);
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * @param {number} num number of elements.
   * 
   * {{ react }}
   */
  async seeNumberOfVisibleElements(locator, num) {
    const res = await this.grabNumberOfVisibleElements(locator);
    return assert.equal(res, num, `expected number of visible elements (${locator}) is ${num}, but found ${res}`);
  }

  /**
   * Checks that all elements with given locator have given CSS properties.
   * 
   * ```js
   * I.seeCssPropertiesOnElements('h3', { 'font-weight': "bold"});
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator located by CSS|XPath|strict locator.
   * @param {object} cssProperties object with CSS properties and their values to check.
   */
  async seeCssPropertiesOnElements(locator, cssProperties) {
    const res = await this._locate(locator);
    assertElementExists(res, locator);
    const elemAmount = res.length;

    let props = await forEachAsync(res, async (el) => {
      return forEachAsync(Object.keys(cssProperties), async (prop) => {
        const propValue = await this.browser.getElementCSSValue(getElementId(el), prop);
        if (isColorProperty(prop) && propValue && propValue.value) {
          return convertColorToRGBA(propValue.value);
        }
        return propValue;
      });
    });

    const cssPropertiesCamelCase = convertCssPropertiesToCamelCase(cssProperties);

    const values = Object.keys(cssPropertiesCamelCase).map(key => cssPropertiesCamelCase[key]);
    if (!Array.isArray(props)) props = [props];
    let chunked = chunkArray(props, values.length);
    chunked = chunked.filter((val) => {
      for (let i = 0; i < val.length; ++i) {
        if (val[i] !== values[i]) return false;
      }
      return true;
    });
    return assert.ok(
      chunked.length === elemAmount,
      `expected all elements (${locator}) to have CSS property ${JSON.stringify(cssProperties)}`,
    );
  }

  /**
   * Checks that all elements with given locator have given attributes.
   * 
   * ```js
   * I.seeAttributesOnElements('//form', { method: "post"});
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator located by CSS|XPath|strict locator.
   * @param {object} attributes attributes and their values to check.
   */
  async seeAttributesOnElements(locator, attributes) {
    const res = await this._locate(locator);
    assertElementExists(res, locator);
    const elemAmount = res.length;

    let attrs = await forEachAsync(res, async (el) => {
      return forEachAsync(Object.keys(attributes), async attr => el.getAttribute(attr));
    });

    const values = Object.keys(attributes).map(key => attributes[key]);
    if (!Array.isArray(attrs)) attrs = [attrs];
    let chunked = chunkArray(attrs, values.length);
    chunked = chunked.filter((val) => {
      for (let i = 0; i < val.length; ++i) {
        if (val[i] !== values[i]) return false;
      }
      return true;
    });
    return assert.ok(
      chunked.length === elemAmount,
      `expected all elements (${locator}) to have attributes ${JSON.stringify(attributes)}`,
    );
  }

  /**
   * Grab number of visible elements by locator.
   * Resumes test execution, so **should be used inside async function with `await`** operator.
   * 
   * ```js
   * let numOfElements = await I.grabNumberOfVisibleElements('p');
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator located by CSS|XPath|strict locator.
   * @returns {Promise<number>} number of visible elements
   */
  async grabNumberOfVisibleElements(locator) {
    const res = await this._locate(locator);

    let selected = await forEachAsync(res, async el => el.isDisplayed());
    if (!Array.isArray(selected)) selected = [selected];
    selected = selected.filter(val => val === true);
    return selected.length;
  }

  /**
   * Checks that current url contains a provided fragment.
   * 
   * ```js
   * I.seeInCurrentUrl('/register'); // we are on registration page
   * ```
   * 
   * @param {string} url a fragment to check
   *
   */
  async seeInCurrentUrl(url) {
    const res = await this.browser.getUrl();
    return stringIncludes('url').assert(url, decodeUrl(res));
  }

  /**
   * Checks that current url does not contain a provided fragment.
   * 
   * @param {string} url value to check.
   *
   */
  async dontSeeInCurrentUrl(url) {
    const res = await this.browser.getUrl();
    return stringIncludes('url').negate(url, decodeUrl(res));
  }

  /**
   * Checks that current url is equal to provided one.
   * If a relative url provided, a configured url will be prepended to it.
   * So both examples will work:
   * 
   * ```js
   * I.seeCurrentUrlEquals('/register');
   * I.seeCurrentUrlEquals('http://my.site.com/register');
   * ```
   * 
   * @param {string} url value to check.
   *
   */
  async seeCurrentUrlEquals(url) {
    const res = await this.browser.getUrl();
    return urlEquals(this.options.url).assert(url, decodeUrl(res));
  }

  /**
   * Checks that current url is not equal to provided one.
   * If a relative url provided, a configured url will be prepended to it.
   * 
   * ```js
   * I.dontSeeCurrentUrlEquals('/login'); // relative url are ok
   * I.dontSeeCurrentUrlEquals('http://mysite.com/login'); // absolute urls are also ok
   * ```
   * 
   * @param {string} url value to check.
   *
   */
  async dontSeeCurrentUrlEquals(url) {
    const res = await this.browser.getUrl();
    return urlEquals(this.options.url).negate(url, decodeUrl(res));
  }

  /**
   * Executes sync script on a page.
   * Pass arguments to function as additional parameters.
   * Will return execution result to a test.
   * In this case you should use async function and await to receive results.
   * 
   * Example with jQuery DatePicker:
   * 
   * ```js
   * // change date of jQuery DatePicker
   * I.executeScript(function() {
   *   // now we are inside browser context
   *   $('date').datetimepicker('setDate', new Date());
   * });
   * ```
   * Can return values. Don't forget to use `await` to get them.
   * 
   * ```js
   * let date = await I.executeScript(function(el) {
   *   // only basic types can be returned
   *   return $(el).datetimepicker('getDate').toString();
   * }, '#date'); // passing jquery selector
   * ```
   * 
   * @param {string|function} fn function to be executed in browser context.
   * @param {...any} args to be passed to function.
   * @return {Promise<any>}
   * 
   *
   *
   * Wraps [execute](http://webdriver.io/api/protocol/execute.html) command.
   */
  executeScript(fn) {
    return this.browser.execute.apply(this.browser, arguments);
  }

  /**
   * Executes async script on page.
   * Provided function should execute a passed callback (as first argument) to signal it is finished.
   * 
   * Example: In Vue.js to make components completely rendered we are waiting for [nextTick](https://vuejs.org/v2/api/#Vue-nextTick).
   * 
   * ```js
   * I.executeAsyncScript(function(done) {
   *   Vue.nextTick(done); // waiting for next tick
   * });
   * ```
   * 
   * By passing value to `done()` function you can return values.
   * Additional arguments can be passed as well, while `done` function is always last parameter in arguments list.
   * 
   * ```js
   * let val = await I.executeAsyncScript(function(url, done) {
   *   // in browser context
   *   $.ajax(url, { success: (data) => done(data); }
   * }, 'http://ajax.callback.url/');
   * ```
   * 
   * @param {string|function} fn function to be executed in browser context.
   * @param {...any} args to be passed to function.
   * @return {Promise<any>}
   * 
   *
   */
  executeAsyncScript(fn) {
    return this.browser.executeAsync.apply(this.browser, arguments);
  }

  /**
   * Scroll element into viewport.
   * 
   * ```js
   * I.scrollIntoView('#submit');
   * I.scrollIntoView('#submit', true);
   * I.scrollIntoView('#submit', { behavior: "smooth", block: "center", inline: "center" });
   * ```
   * 
   * @param {string|object} locator located by CSS|XPath|strict locator.
   * @param {boolean|object} alignToTop (optional) or scrollIntoViewOptions (optional), see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView.
   * 
   *
   */
  async scrollIntoView(locator, scrollIntoViewOptions) {
    const res = await this._locate(withStrictLocator(locator), true);
    assertElementExists(res);
    const elem = usingFirstElement(res);
    return elem.scrollIntoView(scrollIntoViewOptions);
  }

  /**
   * Scrolls to element matched by locator.
   * Extra shift can be set with offsetX and offsetY options.
   * 
   * ```js
   * I.scrollTo('footer');
   * I.scrollTo('#submit', 5, 5);
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator located by CSS|XPath|strict locator.
   * @param {number} [offsetX=0] (optional, `0` by default) X-axis offset.
   * @param {number} [offsetY=0] (optional, `0` by default) Y-axis offset.
   *
   */
  async scrollTo(locator, offsetX = 0, offsetY = 0) {
    if (typeof locator === 'number' && typeof offsetX === 'number') {
      offsetY = offsetX;
      offsetX = locator;
      locator = null;
    }

    if (locator) {
      const res = await this._locate(withStrictLocator(locator), true);
      assertElementExists(res);
      const elem = usingFirstElement(res);
      const elementId = getElementId(elem);
      if (this.browser.isMobile) return this.browser.touchScroll(offsetX, offsetY, elementId);
      const location = await elem.getLocation();
      assertElementExists(location, 'Failed to receive', 'location');
      /* eslint-disable prefer-arrow-callback */
      return this.browser.execute(function (x, y) { return window.scrollTo(x, y); }, location.x + offsetX, location.y + offsetY);
      /* eslint-enable */
    }

    if (this.browser.isMobile) return this.browser.touchScroll(locator, offsetX, offsetY);

    /* eslint-disable prefer-arrow-callback, comma-dangle */
    return this.browser.execute(function (x, y) { return window.scrollTo(x, y); }, offsetX, offsetY);
    /* eslint-enable */
  }

  /**
   * Moves cursor to element matched by locator.
   * Extra shift can be set with offsetX and offsetY options.
   * 
   * ```js
   * I.moveCursorTo('.tooltip');
   * I.moveCursorTo('#submit', 5,5);
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator located by CSS|XPath|strict locator.
   * @param {number} [offsetX=0] (optional, `0` by default) X-axis offset.
   * @param {number} [offsetY=0] (optional, `0` by default) Y-axis offset.
   * 
   *
   */
  async moveCursorTo(locator, xOffset, yOffset) {
    const res = await this._locate(withStrictLocator(locator), true);
    assertElementExists(res, locator);
    const elem = usingFirstElement(res);
    if (isWebDriver5()) return elem.moveTo(xOffset, yOffset);
    return elem.moveTo({ xOffset, yOffset });
  }

  /**
   * Saves screenshot of the specified locator to ouput folder (set in codecept.json or codecept.conf.js).
   * Filename is relative to output folder.
   * 
   * ```js
   * I.saveElementScreenshot(`#submit`,'debug.png');
   * ```
   * 
   * @param {string|object} locator element located by CSS|XPath|strict locator.  
   * @param {string} fileName file name to save.
   *
   */
  async saveElementScreenshot(locator, fileName) {
    const outputFile = screenshotOutputFolder(fileName);

    const res = await this._locate(withStrictLocator(locator), true);
    assertElementExists(res, locator);
    const elem = usingFirstElement(res);

    this.debug(`Screenshot of ${locator} element has been saved to ${outputFile}`);
    return elem.saveScreenshot(outputFile);
  }

  /**
   * Saves a screenshot to ouput folder (set in codecept.json or codecept.conf.js).
   * Filename is relative to output folder.
   * Optionally resize the window to the full available page `scrollHeight` and `scrollWidth` to capture the entire page by passing `true` in as the second argument.
   * 
   * ```js
   * I.saveScreenshot('debug.png');
   * I.saveScreenshot('debug.png', true) //resizes to available scrollHeight and scrollWidth before taking screenshot
   * ```
   * 
   * @param {string} fileName file name to save.
   * @param {boolean} [fullPage=false] (optional, `false` by default) flag to enable fullscreen screenshot mode.
   *
   */
  async saveScreenshot(fileName, fullPage = false) {
    const outputFile = screenshotOutputFolder(fileName);

    if (this.activeSessionName) {
      const browser = this.sessionWindows[this.activeSessionName];

      if (browser) {
        this.debug(`Screenshot of ${this.activeSessionName} session has been saved to ${outputFile}`);
        return browser.saveScreenshot(outputFile);
      }
    }

    if (!fullPage) {
      this.debug(`Screenshot has been saved to ${outputFile}`);
      return this.browser.saveScreenshot(outputFile);
    }

    /* eslint-disable prefer-arrow-callback, comma-dangle, prefer-const */
    const originalWindowSize = await this.browser.getWindowSize();

    let { width, height } = await this.browser.execute(function () {
      return {
        height: document.body.scrollHeight,
        width: document.body.scrollWidth
      };
    }).then(res => res);

    if (height < 100) height = 500; // errors for very small height
    /* eslint-enable */

    await this.browser.setWindowSize(width, height);
    this.debug(`Screenshot has been saved to ${outputFile}, size: ${width}x${height}`);
    const buffer = await this.browser.saveScreenshot(outputFile);
    await this.browser.setWindowSize(originalWindowSize.width, originalWindowSize.height);
    return buffer;
  }

  /**
   * Sets cookie(s).
   * 
   * Can be a single cookie object or an array of cookies:
   * 
   * ```js
   * I.setCookie({name: 'auth', value: true});
   * 
   * // as array
   * I.setCookie([
   *   {name: 'auth', value: true},
   *   {name: 'agree', value: true}
   * ]);
   * ```
   * 
   * @param {object|array} cookie a cookie object or array of cookie objects.
   *
   *
   * Uses Selenium's JSON [cookie
   * format](https://code.google.com/p/selenium/wiki/JsonWireProtocol#Cookie_JSON_Object).
   */
  async setCookie(cookie) {
    return this.browser.setCookies(cookie);
  }

  /**
   * Clears a cookie by name,
   * if none provided clears all cookies.
   * 
   * ```js
   * I.clearCookie();
   * I.clearCookie('test');
   * ```
   * 
   * @param {?string} [cookie=null] (optional, `null` by default) cookie name
   *
   */
  async clearCookie(cookie) {
    return this.browser.deleteCookies(cookie);
  }

  /**
   * Checks that cookie with given name exists.
   * 
   * ```js
   * I.seeCookie('Auth');
   * ```
   * 
   * @param {string} name cookie name.
   * 
   *
   */
  async seeCookie(name) {
    const cookie = await this.browser.getCookies([name]);
    return truth(`cookie ${name}`, 'to be set').assert(cookie);
  }

  /**
   * Checks that cookie with given name does not exist.
   * 
   * ```js
   * I.dontSeeCookie('auth'); // no auth cookie
   * ```
   * 
   * @param {string} name cookie name.
   *
   */
  async dontSeeCookie(name) {
    const cookie = await this.browser.getCookies([name]);
    return truth(`cookie ${name}`, 'to be set').negate(cookie);
  }

  /**
   * Gets a cookie object by name.
   * If none provided gets all cookies.
   * Resumes test execution, so **should be used inside async function with `await`** operator.
   * 
   * ```js
   * let cookie = await I.grabCookie('auth');
   * assert(cookie.value, '123456');
   * ```
   * 
   * @param {?string} [name=null] cookie name.
   * @returns {Promise<string>} attribute value
   *
   */
  async grabCookie(name) {
    if (!name) return this.browser.getCookies();
    const cookie = await this.browser.getCookies([name]);
    this.debugSection('Cookie', JSON.stringify(cookie));
    return cookie[0];
  }

  /**
   * Accepts the active JavaScript native popup window, as created by window.alert|window.confirm|window.prompt.
   * Don't confuse popups with modal windows, as created by [various
   * libraries](http://jster.net/category/windows-modals-popups).
   */
  async acceptPopup() {
    return this.browser.getAlertText().then((res) => {
      if (res !== null) {
        return this.browser.acceptAlert();
      }
    });
  }

  /**
   * Dismisses the active JavaScript popup, as created by window.alert|window.confirm|window.prompt.
   *
   */
  async cancelPopup() {
    return this.browser.getAlertText().then((res) => {
      if (res !== null) {
        return this.browser.dismissAlert();
      }
    });
  }

  /**
   * Checks that the active JavaScript popup, as created by `window.alert|window.confirm|window.prompt`, contains the
   * given string.
   *
   * @param {string} text value to check.
   */
  async seeInPopup(text) {
    return this.browser.getAlertText().then((res) => {
      if (res === null) {
        throw new Error('Popup is not opened');
      }
      stringIncludes('text in popup').assert(text, res);
    });
  }

  /**
   * Grab the text within the popup. If no popup is visible then it will return null.
   *
   * ```js
   * await I.grabPopupText();
   * ```
   */
  async grabPopupText() {
    try {
      return await this.browser.getAlertText();
    } catch (err) {
      this.debugSection('Popup', 'Error getting text from popup');
    }
  }

  /**
   * Presses a key in the browser and leaves it in a down state.
   * 
   * To make combinations with modifier key and user operation (e.g. `'Control'` + [`click`](#click)).
   * 
   * ```js
   * I.pressKeyDown('Control');
   * I.click('#element');
   * I.pressKeyUp('Control');
   * ```
   * 
   * @param {string} key name of key to press down.
   * 
   */
  async pressKeyDown(key) {
    key = getNormalizedKey.call(this, key);
    if (!this.browser.isW3C) {
      return this.browser.sendKeys([key]);
    }
    return this.browser.performActions([{
      type: 'key',
      id: 'keyboard',
      actions: [{
        type: 'keyDown',
        value: key,
      }],
    }]);
  }

  /**
   * Releases a key in the browser which was previously set to a down state.
   * 
   * To make combinations with modifier key and user operation (e.g. `'Control'` + [`click`](#click)).
   * 
   * ```js
   * I.pressKeyDown('Control');
   * I.click('#element');
   * I.pressKeyUp('Control');
   * ```
   * 
   * @param {string} key name of key to release.
   * 
   */
  async pressKeyUp(key) {
    key = getNormalizedKey.call(this, key);
    if (!this.browser.isW3C) {
      return this.browser.sendKeys([key]);
    }
    return this.browser.performActions([{
      type: 'key',
      id: 'keyboard',
      actions: [{
        type: 'keyUp',
        value: key,
      }],
    }]);
  }

  /**
   * Presses a key in the browser (on a focused element).
   * 
   * _Hint:_ For populating text field or textarea, it is recommended to use [`fillField`](#fillfield).
   * 
   * ```js
   * I.pressKey('Backspace');
   * ```
   * 
   * To press a key in combination with modifier keys, pass the sequence as an array. All modifier keys (`'Alt'`, `'Control'`, `'Meta'`, `'Shift'`) will be released afterwards.
   * 
   * ```js
   * I.pressKey(['Control', 'Z']);
   * ```
   * 
   * For specifying operation modifier key based on operating system it is suggested to use `'CommandOrControl'`.
   * This will press `'Command'` (also known as `'Meta'`) on macOS machines and `'Control'` on non-macOS machines.
   * 
   * ```js
   * I.pressKey(['CommandOrControl', 'Z']);
   * ```
   * 
   * Some of the supported key names are:
   * - `'AltLeft'` or `'Alt'`
   * - `'AltRight'`
   * - `'ArrowDown'`
   * - `'ArrowLeft'`
   * - `'ArrowRight'`
   * - `'ArrowUp'`
   * - `'Backspace'`
   * - `'Clear'`
   * - `'ControlLeft'` or `'Control'`
   * - `'ControlRight'`
   * - `'Command'`
   * - `'CommandOrControl'`
   * - `'Delete'`
   * - `'End'`
   * - `'Enter'`
   * - `'Escape'`
   * - `'F1'` to `'F12'`
   * - `'Home'`
   * - `'Insert'`
   * - `'MetaLeft'` or `'Meta'`
   * - `'MetaRight'`
   * - `'Numpad0'` to `'Numpad9'`
   * - `'NumpadAdd'`
   * - `'NumpadDecimal'`
   * - `'NumpadDivide'`
   * - `'NumpadMultiply'`
   * - `'NumpadSubtract'`
   * - `'PageDown'`
   * - `'PageUp'`
   * - `'Pause'`
   * - `'Return'`
   * - `'ShiftLeft'` or `'Shift'`
   * - `'ShiftRight'`
   * - `'Space'`
   * - `'Tab'`
   * 
   * @param {string|string[]} key key or array of keys to press.
   * 
   *
   * _Note:_ In case a text field or textarea is focused be aware that some browsers do not respect active modifier when combining modifier keys with other keys.
   */
  async pressKey(key) {
    const modifiers = [];
    if (Array.isArray(key)) {
      for (let k of key) {
        k = getNormalizedKey.call(this, k);
        if (isModifierKey(k)) {
          modifiers.push(k);
        } else {
          key = k;
          break;
        }
      }
    } else {
      key = getNormalizedKey.call(this, key);
    }
    for (const modifier of modifiers) {
      await this.pressKeyDown(modifier);
    }
    if (!this.browser.isW3C) {
      await this.browser.sendKeys([key]);
    } else {
      await this.browser.performActions([{
        type: 'key',
        id: 'keyboard',
        actions: [{
          type: 'keyDown',
          value: key,
        }, {
          type: 'keyUp',
          value: key,
        }],
      }]);
    }
    for (const modifier of modifiers) {
      await this.pressKeyUp(modifier);
    }
  }

  /**
   * Types out the given text into an active field.
   * To slow down typing use a second parameter, to set interval between key presses.
   * _Note:_ Should be used when [`fillField`](#fillfield) is not an option.
   * 
   * ```js
   * // passing in a string
   * I.type('Type this out.');
   * 
   * // typing values with a 100ms interval
   * I.type('4141555311111111', 100);
   * 
   * // passing in an array
   * I.type(['T', 'E', 'X', 'T']);
   * ```
   * 
   * @param {string|string[]} key or array of keys to type.
   * @param {?number} [delay=null] (optional) delay in ms between key presses
   * 
   */
  async type(keys, delay = null) {
    if (!Array.isArray(keys)) {
      keys = keys.split('');
    }
    if (delay) {
      for (const key of keys) {
        await this.browser.keys(key);
        await this.wait(delay / 1000);
      }
      return;
    }
    await this.browser.keys(keys);
  }

  /**
   * Resize the current window to provided width and height.
   * First parameter can be set to `maximize`.
   * 
   * @param {number} width width in pixels or `maximize`.
   * @param {number} height height in pixels.
   * Appium: not tested in web, in apps doesn't work
   */
  async resizeWindow(width, height) {
    return this._resizeBrowserWindow(this.browser, width, height);
  }

  async _resizeBrowserWindow(browser, width, height) {
    if (width === 'maximize') {
      const size = await browser.maximizeWindow();
      this.debugSection('Window Size', size);
      return;
    }
    if (browser.isW3C) {
      return browser.setWindowRect(null, null, parseInt(width, 10), parseInt(height, 10));
    }
    return browser.setWindowSize(parseInt(width, 10), parseInt(height, 10));
  }

  async _resizeWindowIfNeeded(browser, windowSize) {
    if (this.isWeb && windowSize === 'maximize') {
      await this._resizeBrowserWindow(browser, 'maximize');
    } else if (this.isWeb && windowSize && windowSize.indexOf('x') > 0) {
      const dimensions = windowSize.split('x');
      await this._resizeBrowserWindow(browser, dimensions[0], dimensions[1]);
    }
  }

  /**
   * Drag an item to a destination element.
   * 
   * ```js
   * I.dragAndDrop('#dragHandle', '#container');
   * ```
   * 
   * @param {string|object} srcElement located by CSS|XPath|strict locator.
   * @param {string|object} destElement located by CSS|XPath|strict locator.
   * Appium: not tested
   */
  async dragAndDrop(srcElement, destElement) {
    let sourceEl = await this._locate(srcElement);
    assertElementExists(sourceEl);
    sourceEl = usingFirstElement(sourceEl);

    let destEl = await this._locate(destElement);
    assertElementExists(destEl);
    destEl = usingFirstElement(destEl);

    return sourceEl.dragAndDrop(destEl);
  }

  /**
   * Drag the scrubber of a slider to a given position
   * For fuzzy locators, fields are matched by label text, the "name" attribute, CSS, and XPath.
   * 
   * ```js
   * I.dragSlider('#slider', 30);
   * I.dragSlider('#slider', -70);
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator located by label|name|CSS|XPath|strict locator.
   * @param {number} offsetX position to drag.
   */
  async dragSlider(locator, offsetX = 0) {
    const browser = this.browser;
    await this.moveCursorTo(locator);

    // for chrome
    if (browser.isW3C) {
      const xOffset = await this.grabElementBoundingRect(locator, 'x');
      const yOffset = await this.grabElementBoundingRect(locator, 'y');

      return browser.performActions([{
        type: 'pointer',
        id: 'pointer1',
        parameters: { pointerType: 'mouse' },
        actions: [
          {
            type: 'pointerMove', origin: 'pointer', duration: 1000, x: xOffset, y: yOffset,
          },
          { type: 'pointerDown', button: 0 },
          {
            type: 'pointerMove', origin: 'pointer', duration: 1000, x: offsetX, y: 0,
          },
          { type: 'pointerUp', button: 0 },
        ],
      },
      ]);
    }

    await browser.buttonDown(0);
    await browser.moveToElement(null, offsetX, 0);
    await browser.buttonUp(0);
  }

  /**
   * Get all Window Handles.
   * Useful for referencing a specific handle when calling `I.switchToWindow(handle)`
   *
   * ```js
   * const windows = await I.grabAllWindowHandles();
   * ```
   */
  async grabAllWindowHandles() {
    return this.browser.getWindowHandles();
  }

  /**
   * Get the current Window Handle.
   * Useful for referencing it when calling `I.switchToWindow(handle)`
   *
   * ```js
   * const window = await I.grabCurrentWindowHandle();
   * ```
   */
  async grabCurrentWindowHandle() {
    return this.browser.getWindowHandle();
  }

  /**
   * Switch to the window with a specified handle.
   *
   * ```js
   * const windows = await I.grabAllWindowHandles();
   * // ... do something
   * await I.switchToWindow( windows[0] );
   *
   * const window = await I.grabCurrentWindowHandle();
   * // ... do something
   * await I.switchToWindow( window );
   * ```
   */
  async switchToWindow(window) {
    await this.browser.switchToWindow(window);
  }

  /**
   * Close all tabs except for the current one.
   *
   *
   * ```js
   * I.closeOtherTabs();
   * ```
   */
  async closeOtherTabs() {
    const handles = await this.browser.getWindowHandles();
    const currentHandle = await this.browser.getWindowHandle();
    const otherHandles = handles.filter(handle => handle !== currentHandle);

    await forEachAsync(otherHandles, async (handle) => {
      await this.browser.switchToWindow(handle);
      await this.browser.closeWindow();
    });
    await this.browser.switchToWindow(currentHandle);
  }

  /**
   * Pauses execution for a number of seconds.
   * 
   * ```js
   * I.wait(2); // wait 2 secs
   * ```
   * 
   * @param {number} sec number of second to wait.
   *
   */
  async wait(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
  }

  /**
   * Waits for element to become enabled (by default waits for 1sec).
   * Element can be located by CSS or XPath.
   * 
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * @param {number} [sec=1] (optional) time in seconds to wait, 1 by default.
   *
   */
  async waitForEnabled(locator, sec = null) {
    const aSec = sec || this.options.waitForTimeout;
    if (isWebDriver5()) {
      return this.browser.waitUntil(async () => {
        const res = await this.$$(withStrictLocator(locator));
        if (!res || res.length === 0) {
          return false;
        }
        const selected = await forEachAsync(res, async el => this.browser.isElementEnabled(getElementId(el)));
        if (Array.isArray(selected)) {
          return selected.filter(val => val === true).length > 0;
        }
        return selected;
      }, aSec * 1000, `element (${new Locator(locator)}) still not enabled after ${aSec} sec`);
    }
    return this.browser.waitUntil(async () => {
      const res = await this.$$(withStrictLocator(locator));
      if (!res || res.length === 0) {
        return false;
      }
      const selected = await forEachAsync(res, async el => this.browser.isElementEnabled(getElementId(el)));
      if (Array.isArray(selected)) {
        return selected.filter(val => val === true).length > 0;
      }
      return selected;
    }, {
      timeout: aSec * 1000,
      timeoutMsg: `element (${new Locator(locator)}) still not enabled after ${aSec} sec`,
    });
  }

  /**
   * Waits for element to be present on page (by default waits for 1sec).
   * Element can be located by CSS or XPath.
   * 
   * ```js
   * I.waitForElement('.btn.continue');
   * I.waitForElement('.btn.continue', 5); // wait for 5 secs
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * @param {number} [sec] (optional, `1` by default) time in seconds to wait
   */
  async waitForElement(locator, sec = null) {
    const aSec = sec || this.options.waitForTimeout;
    if (isWebDriver5()) {
      return this.browser.waitUntil(async () => {
        const res = await this.$$(withStrictLocator(locator));
        return res && res.length;
      }, aSec * 1000, `element (${locator}) still not present on page after ${aSec} sec`);
    }
    return this.browser.waitUntil(async () => {
      const res = await this.$$(withStrictLocator(locator));
      return res && res.length;
    }, { timeout: aSec * 1000, timeoutMsg: `element (${locator}) still not present on page after ${aSec} sec` });
  }

  /**
   * Waits for element to be clickable (by default waits for 1sec).
   * Element can be located by CSS or XPath.
   * 
   * ```js
   * I.waitForClickable('.btn.continue');
   * I.waitForClickable('.btn.continue', 5); // wait for 5 secs
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * @param {number} [sec] (optional, `1` by default) time in seconds to wait
   */
  async waitForClickable(locator, waitTimeout) {
    waitTimeout = waitTimeout || this.options.waitForTimeout;
    let res = await this._locate(locator);
    res = usingFirstElement(res);
    assertElementExists(res, locator);

    return res.waitForClickable({
      timeout: waitTimeout * 1000,
      timeoutMsg: `element ${res.selector} still not clickable after ${waitTimeout} sec`,
    });
  }

  async waitUntilExists(locator, sec = null) {
    console.log(`waitUntilExists deprecated:
    * use 'waitForElement' to wait for element to be attached
    * use 'waitForDetached to wait for element to be removed'`);
    return this.waitForStalenessOf(locator, sec);
  }

  /**
   * Waiting for the part of the URL to match the expected. Useful for SPA to understand that page was changed.
   * 
   * ```js
   * I.waitInUrl('/info', 2);
   * ```
   * 
   * @param {string} urlPart value to check.
   * @param {number} [sec=1] (optional, `1` by default) time in seconds to wait
   */
  async waitInUrl(urlPart, sec = null) {
    const client = this.browser;
    const aSec = sec || this.options.waitForTimeout;
    let currUrl = '';
    if (isWebDriver5()) {
      return client
        .waitUntil(function () {
          return this.getUrl().then((res) => {
            currUrl = decodeUrl(res);
            return currUrl.indexOf(urlPart) > -1;
          });
        }, aSec * 1000).catch((e) => {
          if (e.message.indexOf('timeout')) {
            throw new Error(`expected url to include ${urlPart}, but found ${currUrl}`);
          }
          throw e;
        });
    }
    return client
      .waitUntil(function () {
        return this.getUrl().then((res) => {
          currUrl = decodeUrl(res);
          return currUrl.indexOf(urlPart) > -1;
        });
      }, { timeout: aSec * 1000 }).catch((e) => {
        if (e.message.indexOf('timeout')) {
          throw new Error(`expected url to include ${urlPart}, but found ${currUrl}`);
        }
        throw e;
      });
  }

  /**
   * Waits for the entire URL to match the expected
   * 
   * ```js
   * I.waitUrlEquals('/info', 2);
   * I.waitUrlEquals('http://127.0.0.1:8000/info');
   * ```
   * 
   * @param {string} urlPart value to check.
   * @param {number} [sec=1] (optional, `1` by default) time in seconds to wait
   */
  async waitUrlEquals(urlPart, sec = null) {
    const aSec = sec || this.options.waitForTimeout;
    const baseUrl = this.options.url;
    if (urlPart.indexOf('http') < 0) {
      urlPart = baseUrl + urlPart;
    }
    let currUrl = '';
    return this.browser.waitUntil(function () {
      return this.getUrl().then((res) => {
        currUrl = decodeUrl(res);
        return currUrl === urlPart;
      });
    }, aSec * 1000).catch((e) => {
      if (e.message.indexOf('timeout')) {
        throw new Error(`expected url to be ${urlPart}, but found ${currUrl}`);
      }
      throw e;
    });
  }

  /**
   * Waits for a text to appear (by default waits for 1sec).
   * Element can be located by CSS or XPath.
   * Narrow down search results by providing context.
   * 
   * ```js
   * I.waitForText('Thank you, form has been submitted');
   * I.waitForText('Thank you, form has been submitted', 5, '#modal');
   * ```
   * 
   * @param {string }text to wait for.
   * @param {number} [sec=1] (optional, `1` by default) time in seconds to wait
   * @param {CodeceptJS.LocatorOrString} [context] (optional) element located by CSS|XPath|strict locator.
   *
   */
  async waitForText(text, sec = null, context = null) {
    const aSec = sec || this.options.waitForTimeout;
    const _context = context || this.root;
    if (isWebDriver5()) {
      return this.browser.waitUntil(
        async () => {
          const res = await this.$$(withStrictLocator.call(this, _context));
          if (!res || res.length === 0) return false;
          const selected = await forEachAsync(res, async el => this.browser.getElementText(getElementId(el)));
          if (Array.isArray(selected)) {
            return selected.filter(part => part.indexOf(text) >= 0).length > 0;
          }
          return selected.indexOf(text) >= 0;
        }, aSec * 1000,
        `element (${_context}) is not in DOM or there is no element(${_context}) with text "${text}" after ${aSec} sec`,
      );
    }

    return this.browser.waitUntil(
      async () => {
        const res = await this.$$(withStrictLocator.call(this, _context));
        if (!res || res.length === 0) return false;
        const selected = await forEachAsync(res, async el => this.browser.getElementText(getElementId(el)));
        if (Array.isArray(selected)) {
          return selected.filter(part => part.indexOf(text) >= 0).length > 0;
        }
        return selected.indexOf(text) >= 0;
      }, {
        timeout: aSec * 1000,
        timeoutMsg: `element (${_context}) is not in DOM or there is no element(${_context}) with text "${text}" after ${aSec} sec`,
      },
    );
  }

  /**
   * Waits for the specified value to be in value attribute.
   * 
   * ```js
   * I.waitForValue('//input', "GoodValue");
   * ```
   * 
   * @param {string|object} field input field.
   * @param {string }value expected value.
   * @param {number} [sec=1] (optional, `1` by default) time in seconds to wait
   */
  async waitForValue(field, value, sec = null) {
    const client = this.browser;
    const aSec = sec || this.options.waitForTimeout;
    if (isWebDriver5()) {
      return client.waitUntil(
        async () => {
          const res = await findFields.call(this, field);
          if (!res || res.length === 0) return false;
          const selected = await forEachAsync(res, async el => el.getValue());
          if (Array.isArray(selected)) {
            return selected.filter(part => part.indexOf(value) >= 0).length > 0;
          }
          return selected.indexOf(value) >= 0;
        }, aSec * 1000,
        `element (${field}) is not in DOM or there is no element(${field}) with value "${value}" after ${aSec} sec`,
      );
    }
    return client.waitUntil(
      async () => {
        const res = await findFields.call(this, field);
        if (!res || res.length === 0) return false;
        const selected = await forEachAsync(res, async el => el.getValue());
        if (Array.isArray(selected)) {
          return selected.filter(part => part.indexOf(value) >= 0).length > 0;
        }
        return selected.indexOf(value) >= 0;
      }, {
        timeout: aSec * 1000,
        timeoutMsg: `element (${field}) is not in DOM or there is no element(${field}) with value "${value}" after ${aSec} sec`,
      },
    );
  }

  /**
   * Waits for an element to become visible on a page (by default waits for 1sec).
   * Element can be located by CSS or XPath.
   * 
   * ```js
   * I.waitForVisible('#popup');
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * @param {number} [sec=1] (optional, `1` by default) time in seconds to wait
   *
   */
  async waitForVisible(locator, sec = null) {
    const aSec = sec || this.options.waitForTimeout;
    if (isWebDriver5()) {
      return this.browser.waitUntil(async () => {
        const res = await this.$$(withStrictLocator(locator));
        if (!res || res.length === 0) return false;
        const selected = await forEachAsync(res, async el => el.isDisplayed());
        if (Array.isArray(selected)) {
          return selected.filter(val => val === true).length > 0;
        }
        return selected;
      }, aSec * 1000, `element (${new Locator(locator)}) still not visible after ${aSec} sec`);
    }
    return this.browser.waitUntil(async () => {
      const res = await this.$$(withStrictLocator(locator));
      if (!res || res.length === 0) return false;
      const selected = await forEachAsync(res, async el => el.isDisplayed());
      if (Array.isArray(selected)) {
        return selected.filter(val => val === true).length > 0;
      }
      return selected;
    }, { timeout: aSec * 1000, timeoutMsg: `element (${new Locator(locator)}) still not visible after ${aSec} sec` });
  }

  /**
   * Waits for a specified number of elements on the page.
   * 
   * ```js
   * I.waitNumberOfVisibleElements('a', 3);
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * @param {number} num number of elements.
   * @param {number} [sec=1] (optional, `1` by default) time in seconds to wait
   */
  async waitNumberOfVisibleElements(locator, num, sec = null) {
    const aSec = sec || this.options.waitForTimeout;
    if (isWebDriver5()) {
      return this.browser.waitUntil(async () => {
        const res = await this.$$(withStrictLocator(locator));
        if (!res || res.length === 0) return false;
        let selected = await forEachAsync(res, async el => el.isDisplayed());

        if (!Array.isArray(selected)) selected = [selected];
        selected = selected.filter(val => val === true);
        return selected.length === num;
      }, aSec * 1000, `The number of elements (${new Locator(locator)}) is not ${num} after ${aSec} sec`);
    }
    return this.browser.waitUntil(async () => {
      const res = await this.$$(withStrictLocator(locator));
      if (!res || res.length === 0) return false;
      let selected = await forEachAsync(res, async el => el.isDisplayed());

      if (!Array.isArray(selected)) selected = [selected];
      selected = selected.filter(val => val === true);
      return selected.length === num;
    }, { timeout: aSec * 1000, timeoutMsg: `The number of elements (${new Locator(locator)}) is not ${num} after ${aSec} sec` });
  }

  /**
   * Waits for an element to be removed or become invisible on a page (by default waits for 1sec).
   * Element can be located by CSS or XPath.
   * 
   * ```js
   * I.waitForInvisible('#popup');
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * @param {number} [sec=1] (optional, `1` by default) time in seconds to wait
   *
   */
  async waitForInvisible(locator, sec = null) {
    const aSec = sec || this.options.waitForTimeout;
    if (isWebDriver5()) {
      return this.browser.waitUntil(async () => {
        const res = await this.$$(withStrictLocator(locator));
        if (!res || res.length === 0) return true;
        const selected = await forEachAsync(res, async el => el.isDisplayed());
        return !selected.length;
      }, aSec * 1000, `element (${new Locator(locator)}) still visible after ${aSec} sec`);
    }
    return this.browser.waitUntil(async () => {
      const res = await this.$$(withStrictLocator(locator));
      if (!res || res.length === 0) return true;
      const selected = await forEachAsync(res, async el => el.isDisplayed());
      return !selected.length;
    }, { timeout: aSec * 1000, timeoutMsg: `element (${new Locator(locator)}) still visible after ${aSec} sec` });
  }

  /**
   * Waits for an element to hide (by default waits for 1sec).
   * Element can be located by CSS or XPath.
   * 
   * ```js
   * I.waitToHide('#popup');
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * @param {number} [sec=1] (optional, `1` by default) time in seconds to wait
   *
   */
  async waitToHide(locator, sec = null) {
    return this.waitForInvisible(locator, sec);
  }

  async waitForStalenessOf(locator, sec = null) {
    console.log('waitForStalenessOf deprecated. Use waitForDetached instead');
    return this.waitForDetached(locator, sec);
  }

  /**
   * Waits for an element to become not attached to the DOM on a page (by default waits for 1sec).
   * Element can be located by CSS or XPath.
   * 
   * ```js
   * I.waitForDetached('#popup');
   * ```
   * 
   * @param {CodeceptJS.LocatorOrString} locator element located by CSS|XPath|strict locator.
   * @param {number} [sec=1] (optional, `1` by default) time in seconds to wait
   *
   */
  async waitForDetached(locator, sec = null) {
    const aSec = sec || this.options.waitForTimeout;
    if (isWebDriver5()) {
      return this.browser.waitUntil(async () => {
        const res = await this.$$(withStrictLocator(locator));
        if (!res || res.length === 0) {
          return true;
        }
        return false;
      }, aSec * 1000, `element (${new Locator(locator)}) still on page after ${aSec} sec`);
    }
    return this.browser.waitUntil(async () => {
      const res = await this.$$(withStrictLocator(locator));
      if (!res || res.length === 0) {
        return true;
      }
      return false;
    }, { timeout: aSec * 1000, timeoutMsg: `element (${new Locator(locator)}) still on page after ${aSec} sec` });
  }

  /**
   * Waits for a function to return true (waits for 1 sec by default).
   * Running in browser context.
   * 
   * ```js
   * I.waitForFunction(fn[, [args[, timeout]])
   * ```
   * 
   * ```js
   * I.waitForFunction(() => window.requests == 0);
   * I.waitForFunction(() => window.requests == 0, 5); // waits for 5 sec
   * I.waitForFunction((count) => window.requests == count, [3], 5) // pass args and wait for 5 sec
   * ```
   * 
   * @param {string|function} fn to be executed in browser context.
   * @param {any[]|number} [argsOrSec] (optional, `1` by default) arguments for function or seconds.
   * @param {number} [sec] (optional, `1` by default) time in seconds to wait
   * 
   *
   */
  async waitForFunction(fn, argsOrSec = null, sec = null) {
    let args = [];
    if (argsOrSec) {
      if (Array.isArray(argsOrSec)) {
        args = argsOrSec;
      } else if (typeof argsOrSec === 'number') {
        sec = argsOrSec;
      }
    }

    const aSec = sec || this.options.waitForTimeout;
    if (isWebDriver5()) {
      return this.browser.waitUntil(async () => this.browser.execute(fn, ...args), aSec * 1000, '');
    }
    return this.browser.waitUntil(async () => this.browser.execute(fn, ...args), { timeout: aSec * 1000, timeoutMsg: '' });
  }

  /**
   * Waits for a function to return true (waits for 1sec by default).
   * 
   * ```js
   * I.waitUntil(() => window.requests == 0);
   * I.waitUntil(() => window.requests == 0, 5);
   * ```
   * 
   * @param {function|string} fn function which is executed in browser context.
   * @param {number} [sec=1] (optional, `1` by default) time in seconds to wait
   * @param {string} [timeoutMsg=''] message to show in case of timeout fail.
   * @param {?number} [interval=null]
   *
   */
  async waitUntil(fn, sec = null, timeoutMsg = null, interval = null) {
    const aSec = sec || this.options.waitForTimeout;
    const _interval = typeof interval === 'number' ? interval * 1000 : null;
    if (isWebDriver5()) {
      return this.browser.waitUntil(fn, aSec * 1000, timeoutMsg, _interval);
    }
    return this.browser.waitUntil(fn, { timeout: aSec * 1000, timeoutMsg, interval: _interval });
  }

  /**
   * Switches frame or in case of null locator reverts to parent.
   * 
   * ```js
   * I.switchTo('iframe'); // switch to first iframe
   * I.switchTo(); // switch back to main page
   * ```
   * 
   * @param {?CodeceptJS.LocatorOrString} [locator=null] (optional, `null` by default) element located by CSS|XPath|strict locator.
   *
   */
  async switchTo(locator) {
    this.browser.isInsideFrame = true;
    if (Number.isInteger(locator)) {
      return this.browser.switchToFrame(locator);
    }
    if (!locator) {
      return this.browser.switchToFrame(null);
    }

    let res = await this._locate(locator, true);
    assertElementExists(res, locator);
    res = usingFirstElement(res);
    return this.browser.switchToFrame(res);
  }

  /**
   * Switch focus to a particular tab by its number. It waits tabs loading and then switch tab.
   *
   * ```js
   * I.switchToNextTab();
   * I.switchToNextTab(2);
   * ```
   *
   * @param {number} [num] (optional) number of tabs to switch forward, default: 1.
   * @param {number | null} [sec] (optional) time in seconds to wait.
   */
  async switchToNextTab(num = 1, sec = null) {
    const aSec = sec || this.options.waitForTimeout;
    let target;
    const current = await this.browser.getWindowHandle();

    if (isWebDriver5()) {
      await this.browser.waitUntil(async () => {
        await this.browser.getWindowHandles().then((handles) => {
          if (handles.indexOf(current) + num + 1 <= handles.length) {
            target = handles[handles.indexOf(current) + num];
          }
        });
        return target;
      }, aSec * 1000, `There is no ability to switch to next tab with offset ${num}`);
      return this.browser.switchToWindow(target);
    }

    await this.browser.waitUntil(async () => {
      await this.browser.getWindowHandles().then((handles) => {
        if (handles.indexOf(current) + num + 1 <= handles.length) {
          target = handles[handles.indexOf(current) + num];
        }
      });
      return target;
    }, { timeout: aSec * 1000, timeoutMsg: `There is no ability to switch to next tab with offset ${num}` });
    return this.browser.switchToWindow(target);
  }

  /**
   * Switch focus to a particular tab by its number. It waits tabs loading and then switch tab.
   *
   * ```js
   * I.switchToPreviousTab();
   * I.switchToPreviousTab(2);
   * ```
   *
   * @param {number} [num] (optional) number of tabs to switch backward, default: 1.
   * @param {number?} [sec] (optional) time in seconds to wait.
   */
  async switchToPreviousTab(num = 1, sec = null) {
    const aSec = sec || this.options.waitForTimeout;
    const current = await this.browser.getWindowHandle();
    let target;

    if (isWebDriver5()) {
      await this.browser.waitUntil(async () => {
        await this.browser.getWindowHandles().then((handles) => {
          if (handles.indexOf(current) - num > -1) {
            target = handles[handles.indexOf(current) - num];
          }
        });
        return target;
      }, aSec * 1000, `There is no ability to switch to previous tab with offset ${num}`);
      return this.browser.switchToWindow(target);
    }

    await this.browser.waitUntil(async () => {
      await this.browser.getWindowHandles().then((handles) => {
        if (handles.indexOf(current) - num > -1) {
          target = handles[handles.indexOf(current) - num];
        }
      });
      return target;
    }, { timeout: aSec * 1000, timeoutMsg: `There is no ability to switch to previous tab with offset ${num}` });
    return this.browser.switchToWindow(target);
  }

  /**
   * Close current tab.
   *
   * ```js
   * I.closeCurrentTab();
   * ```
   */
  async closeCurrentTab() {
    await this.browser.closeWindow();
    const handles = await this.browser.getWindowHandles();
    if (handles[0]) await this.browser.switchToWindow(handles[0]);
  }

  /**
   * Open new tab and switch to it.
   *
   * ```js
   * I.openNewTab();
   * ```
   */
  async openNewTab(url = 'about:blank', windowName = null) {
    const client = this.browser;
    const crypto = require('crypto');
    if (windowName == null) {
      windowName = crypto.randomBytes(32).toString('hex');
    }
    return client.newWindow(url, windowName);
  }

  /**
   * Grab number of open tabs.
   * Resumes test execution, so **should be used inside async function with `await`** operator.
   * 
   * ```js
   * let tabs = await I.grabNumberOfOpenTabs();
   * ```
   * 
   * @returns {Promise<number>} number of open tabs
   */
  async grabNumberOfOpenTabs() {
    const pages = await this.browser.getWindowHandles();
    this.debugSection('Tabs', `Total ${pages.length}`);
    return pages.length;
  }

  /**
   * Reload the current page.
   * 
   * ```js
   * I.refreshPage();
   * ```
   * 
   */
  async refreshPage() {
    const client = this.browser;
    return client.refresh();
  }

  /**
   * Scroll page to the top.
   * 
   * ```js
   * I.scrollPageToTop();
   * ```
   * 
   */
  scrollPageToTop() {
    const client = this.browser;
    /* eslint-disable prefer-arrow-callback */
    return client.execute(function () {
      window.scrollTo(0, 0);
    });
    /* eslint-enable */
  }

  /**
   * Scroll page to the bottom.
   * 
   * ```js
   * I.scrollPageToBottom();
   * ```
   * 
   */
  scrollPageToBottom() {
    const client = this.browser;
    /* eslint-disable prefer-arrow-callback, comma-dangle */
    return client.execute(function () {
      const body = document.body;
      const html = document.documentElement;
      window.scrollTo(0, Math.max(
        body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight
      ));
    });
    /* eslint-enable */
  }

  /**
   * Retrieves a page scroll position and returns it to test.
   * Resumes test execution, so **should be used inside an async function with `await`** operator.
   * 
   * ```js
   * let { x, y } = await I.grabPageScrollPosition();
   * ```
   * 
   * @returns {Promise<Object<string, *>>} scroll position
   */
  async grabPageScrollPosition() {
    /* eslint-disable comma-dangle */
    function getScrollPosition() {
      return {
        x: window.pageXOffset,
        y: window.pageYOffset
      };
    }
    /* eslint-enable comma-dangle */
    return this.executeScript(getScrollPosition);
  }

  /**
   * Set the current geo location
   * 
   * 
   * ```js
   * I.setGeoLocation(121.21, 11.56);
   * I.setGeoLocation(121.21, 11.56, 10);
   * ```
   * 
   * @param {number} latitude to set.
   * @param {number} longitude to set
   * @param {number} altitude (optional, null by default) to set
   *
   */
  async setGeoLocation(latitude, longitude, altitude = null) {
    if (altitude) {
      return this.browser.setGeoLocation({ latitude, longitude });
    }
    return this.browser.setGeoLocation({ latitude, longitude, altitude });
  }

  /**
   * Return the current geo location 
   * Resumes test execution, so **should be used inside async function with `await`** operator.
   * 
   * ```js
   * let geoLocation = await I.grabGeoLocation();
   * ```
   * 
   * @returns {Promise<{ latitude: number, longitude: number, altitude: number }>}
   *
   */
  async grabGeoLocation() {
    return this.browser.getGeoLocation();
  }

  /**
   * Grab the width, height, location of given locator.
   * Provide `width` or `height`as second param to get your desired prop.
   * Resumes test execution, so **should be used inside an async function with `await`** operator.
   * 
   * Returns an object with `x`, `y`, `width`, `height` keys.
   * 
   * ```js
   * const value = await I.grabElementBoundingRect('h3');
   * // value is like { x: 226.5, y: 89, width: 527, height: 220 }
   * ```
   * 
   * To get only one metric use second parameter:
   * 
   * ```js
   * const width = await I.grabElementBoundingRect('h3', 'width');
   * // width == 527
   * ```
   * @param {string|object} locator element located by CSS|XPath|strict locator.
   * @param {string} elementSize x, y, width or height of the given element.
   * @returns {object} Element bounding rectangle
   */
  async grabElementBoundingRect(locator, prop) {
    const res = await this._locate(locator, true);
    assertElementExists(res, locator);
    const el = usingFirstElement(res);

    const rect = {
      ...await el.getLocation(),
      ...await el.getSize(),
    };
    if (prop) return rect[prop];
    return rect;
  }

  /**
   * Placeholder for ~ locator only test case write once run on both Appium and WebDriver.
   */
  runOnIOS(caps, fn) {
  }

  /**
   * Placeholder for ~ locator only test case write once run on both Appium and WebDriver.
   */
  runOnAndroid(caps, fn) {
  }

  /**
   * Placeholder for ~ locator only test case write once run on both Appium and WebDriver.
   */
  runInWeb(fn) {
    return fn();
  }
}

async function proceedSee(assertType, text, context, strict = false) {
  let description;
  if (!context) {
    if (this.context === webRoot) {
      context = this.context;
      description = 'web page';
    } else {
      description = `current context ${this.context}`;
      context = './/*';
    }
  } else {
    description = `element ${context}`;
  }

  const smartWaitEnabled = assertType === 'assert';

  const res = await this._locate(withStrictLocator(context), smartWaitEnabled);
  assertElementExists(res, context);

  const selected = await forEachAsync(res, async el => this.browser.getElementText(getElementId(el)));

  if (strict) {
    if (Array.isArray(selected) && selected.length !== 0) {
      return selected.map(elText => equals(description)[assertType](text, elText));
    }
    return equals(description)[assertType](text, selected);
  }
  return stringIncludes(description)[assertType](text, selected);
}

/**
 * Mimic Array.forEach() API, but with an async callback function.
 * Execute each callback on each array item serially. Useful when using WebDriver API.
 *
 * Added due because of problem with chrome driver when too many requests
 * are made simultaneously. https://bugs.chromium.org/p/chromedriver/issues/detail?id=2152#c9
 * @private
 * @param {Array} array Input array items to iterate over.
 * @param {Function} callback - Async function to excute on each array item.
 * @param {object} [options] - Configurable options.
 * @param {boolean} [options.expandArrayResults=true] - Flag to flat one dimension array results.
 * @return {Promise<Array>} - Array of values.
 */
async function forEachAsync(array, callback, options = { expandArrayResults: true }) {
  const {
    expandArrayResults = true,
  } = options;
  const inputArray = Array.isArray(array) ? array : [array];
  const values = [];
  for (let index = 0; index < inputArray.length; index++) {
    const res = await callback(inputArray[index], index, inputArray);

    if (Array.isArray(res) && expandArrayResults) {
      res.forEach(val => values.push(val));
    } else if (res) {
      values.push(res);
    }
  }
  return values;
}

/**
 * Mimic Array.filter() API, but with an async callback function.
 * Execute each callback on each array item serially. Useful when using WebDriver API.
 *
 * Added due because of problem with chrome driver when too many requests
 * are made simultaneously. https://bugs.chromium.org/p/chromedriver/issues/detail?id=2152#c9
 * @private
 * @param {Array} array - Input array items to iterate over.
 * @param {Function} callback - Async functin to excute on each array item.
 * @return {Promise<Array>} - Array of values.
 */
async function filterAsync(array, callback) {
  const inputArray = Array.isArray(array) ? array : [array];
  const values = [];
  for (let index = 0; index < inputArray.length; index++) {
    const res = await callback(inputArray[index], index, inputArray);
    const value = Array.isArray(res) ? res[0] : res;

    if (value) {
      values.push(inputArray[index]);
    }
  }
  return values;
}

async function findClickable(locator, locateFn) {
  locator = new Locator(locator);
  if (locator.isAccessibilityId() && !this.isWeb) return locateFn(locator, true);
  if (!locator.isFuzzy()) return locateFn(locator, true);

  let els;
  const literal = xpathLocator.literal(locator.value);

  els = await locateFn(Locator.clickable.narrow(literal));
  if (els.length) return els;

  els = await locateFn(Locator.clickable.wide(literal));
  if (els.length) return els;

  els = await locateFn(Locator.clickable.self(literal));
  if (els.length) return els;

  return locateFn(locator.value); // by css or xpath
}

async function findFields(locator) {
  locator = new Locator(locator);

  if (locator.isAccessibilityId() && !this.isWeb) return this._locate(locator, true);
  if (!locator.isFuzzy()) return this._locate(locator, true);

  const literal = xpathLocator.literal(locator.value);
  let els = await this._locate(Locator.field.labelEquals(literal));
  if (els.length) return els;

  els = await this._locate(Locator.field.labelContains(literal));
  if (els.length) return els;

  els = await this._locate(Locator.field.byName(literal));
  if (els.length) return els;
  return this._locate(locator.value); // by css or xpath
}

async function proceedSeeField(assertType, field, value) {
  const res = await findFields.call(this, field);
  assertElementExists(res, field, 'Field');
  const elem = usingFirstElement(res);
  const elemId = getElementId(elem);

  const proceedMultiple = async (fields) => {
    const fieldResults = toArray(await forEachAsync(fields, async (el) => {
      const elementId = getElementId(el);
      return this.browser.isW3C ? el.getValue() : this.browser.getElementAttribute(elementId, 'value');
    }));

    if (typeof value === 'boolean') {
      equals(`no. of items matching > 0: ${field}`)[assertType](value, !!fieldResults.length);
    } else {
      // Assert that results were found so the forEach assert does not silently pass
      equals(`no. of items matching > 0:  ${field}`)[assertType](true, !!fieldResults.length);
      fieldResults.forEach(val => stringIncludes(`fields by ${field}`)[assertType](value, val));
    }
  };

  const proceedSingle = el => this.browser.getElementAttribute(getElementId(el), 'value').then((res) => {
    if (res === null) {
      throw new Error(`Element ${el.selector} has no value attribute`);
    }
    stringIncludes(`fields by ${field}`)[assertType](value, res);
  });

  const filterBySelected = async elements => filterAsync(elements, async el => this.browser.isElementSelected(getElementId(el)));

  const filterSelectedByValue = async (elements, value) => {
    return filterAsync(elements, async (el) => {
      const elementId = getElementId(el);
      const currentValue = this.browser.isW3C ? await el.getValue() : await this.browser.getElementAttribute(elementId, 'value');
      const isSelected = await this.browser.isElementSelected(elementId);
      return currentValue === value && isSelected;
    });
  };

  const tag = await elem.getTagName();
  if (tag === 'select') {
    const subOptions = await this.browser.findElementsFromElement(elemId, 'css', 'option');

    if (value === '') {
      // Don't filter by value
      const selectedOptions = await filterBySelected(subOptions);
      return proceedMultiple(selectedOptions);
    }

    const options = await filterSelectedByValue(subOptions, value);
    return proceedMultiple(options);
  }

  if (tag === 'input') {
    const fieldType = await elem.getAttribute('type');

    if (fieldType === 'checkbox' || fieldType === 'radio') {
      if (typeof value === 'boolean') {
        // Support boolean values
        const options = await filterBySelected(res);
        return proceedMultiple(options);
      }

      const options = await filterSelectedByValue(res, value);
      return proceedMultiple(options);
    }
    return proceedSingle(elem);
  }
  return proceedSingle(elem);
}

function toArray(item) {
  if (!Array.isArray(item)) {
    return [item];
  }
  return item;
}

async function proceedSeeCheckbox(assertType, field) {
  const res = await findFields.call(this, field);
  assertElementExists(res, field, 'Field');

  const selected = await forEachAsync(res, async el => this.browser.isElementSelected(getElementId(el)));
  return truth(`checkable field "${field}"`, 'to be checked')[assertType](selected);
}

async function findCheckable(locator, locateFn) {
  let els;
  locator = new Locator(locator);

  if (locator.isAccessibilityId() && !this.isWeb) return locateFn(locator, true);
  if (!locator.isFuzzy()) return locateFn(locator, true);

  const literal = xpathLocator.literal(locator.value);
  els = await locateFn(Locator.checkable.byText(literal));
  if (els.length) return els;
  els = await locateFn(Locator.checkable.byName(literal));
  if (els.length) return els;

  return locateFn(locator.value); // by css or xpath
}

function withStrictLocator(locator) {
  locator = new Locator(locator);
  return locator.simplify();
}

function isFrameLocator(locator) {
  locator = new Locator(locator);
  if (locator.isFrame()) return locator.value;
  return false;
}

function assertElementExists(res, locator, prefix, suffix) {
  if (!res || res.length === 0) {
    throw new ElementNotFound(locator, prefix, suffix);
  }
}

function usingFirstElement(els) {
  if (els.length > 1) debug(`[Elements] Using first element out of ${els.length}`);
  return els[0];
}

function getElementId(el) {
  // W3C WebDriver web element identifier
  // https://w3c.github.io/webdriver/#dfn-web-element-identifier
  if (el['element-6066-11e4-a52e-4f735466cecf']) {
    return el['element-6066-11e4-a52e-4f735466cecf'];
  }
  // (deprecated) JsonWireProtocol identifier
  // https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#webelement-json-object
  if (el.ELEMENT) {
    return el.ELEMENT;
  }
  return null;
}

// List of known key values to unicode code points
// https://www.w3.org/TR/webdriver/#keyboard-actions
const keyUnicodeMap = {
  /* eslint-disable quote-props */
  'Unidentified': '\uE000',
  'Cancel': '\uE001',
  'Clear': '\uE005',
  'Help': '\uE002',
  'Pause': '\uE00B',
  'Backspace': '\uE003',
  'Return': '\uE006',
  'Enter': '\uE007',
  'Escape': '\uE00C',
  'Alt': '\uE00A',
  'AltLeft': '\uE00A',
  'AltRight': '\uE052',
  'Control': '\uE009',
  'ControlLeft': '\uE009',
  'ControlRight': '\uE051',
  'Meta': '\uE03D',
  'MetaLeft': '\uE03D',
  'MetaRight': '\uE053',
  'Shift': '\uE008',
  'ShiftLeft': '\uE008',
  'ShiftRight': '\uE050',
  'Space': '\uE00D',
  ' ': '\uE00D',
  'Tab': '\uE004',
  'Insert': '\uE016',
  'Delete': '\uE017',
  'End': '\uE010',
  'Home': '\uE011',
  'PageUp': '\uE00E',
  'PageDown': '\uE00F',
  'ArrowDown': '\uE015',
  'ArrowLeft': '\uE012',
  'ArrowRight': '\uE014',
  'ArrowUp': '\uE013',
  'F1': '\uE031',
  'F2': '\uE032',
  'F3': '\uE033',
  'F4': '\uE034',
  'F5': '\uE035',
  'F6': '\uE036',
  'F7': '\uE037',
  'F8': '\uE038',
  'F9': '\uE039',
  'F10': '\uE03A',
  'F11': '\uE03B',
  'F12': '\uE03C',
  'Numpad0': '\uE01A',
  'Numpad1': '\uE01B',
  'Numpad2': '\uE01C',
  'Numpad3': '\uE01D',
  'Numpad4': '\uE01E',
  'Numpad5': '\uE01F',
  'Numpad6': '\uE020',
  'Numpad7': '\uE021',
  'Numpad8': '\uE022',
  'Numpad9': '\uE023',
  'NumpadMultiply': '\uE024',
  'NumpadAdd': '\uE025',
  'NumpadSubtract': '\uE027',
  'NumpadDecimal': '\uE028',
  'NumpadDivide': '\uE029',
  'NumpadEnter': '\uE007',
  'NumpadInsert': '\uE05C', // 'Numpad0' alternate (when NumLock off)
  'NumpadDelete': '\uE05D', // 'NumpadDecimal' alternate (when NumLock off)
  'NumpadEnd': '\uE056', // 'Numpad1' alternate (when NumLock off)
  'NumpadHome': '\uE057', // 'Numpad7' alternate (when NumLock off)
  'NumpadPageDown': '\uE055', // 'Numpad3' alternate (when NumLock off)
  'NumpadPageUp': '\uE054', // 'Numpad9' alternate (when NumLock off)
  'NumpadArrowDown': '\uE05B', // 'Numpad2' alternate (when NumLock off)
  'NumpadArrowLeft': '\uE058', // 'Numpad4' alternate (when NumLock off)
  'NumpadArrowRight': '\uE05A', // 'Numpad6' alternate (when NumLock off)
  'NumpadArrowUp': '\uE059', // 'Numpad8' alternate (when NumLock off)
  'Comma': '\uE026', // ',' alias
  'Digit0': '0', // '0' alias
  'Digit1': '1', // '1' alias
  'Digit2': '2', // '2' alias
  'Digit3': '3', // '3' alias
  'Digit4': '4', // '4' alias
  'Digit5': '5', // '5' alias
  'Digit6': '6', // '6' alias
  'Digit7': '7', // '7' alias
  'Digit8': '8', // '8' alias
  'Digit9': '9', // '9' alias
  'Equal': '\uE019', // '=' alias
  'KeyA': 'a', // 'a' alias
  'KeyB': 'b', // 'b' alias
  'KeyC': 'c', // 'c' alias
  'KeyD': 'd', // 'd' alias
  'KeyE': 'e', // 'e' alias
  'KeyF': 'f', // 'f' alias
  'KeyG': 'g', // 'g' alias
  'KeyH': 'h', // 'h' alias
  'KeyI': 'i', // 'i' alias
  'KeyJ': 'j', // 'j' alias
  'KeyK': 'k', // 'k' alias
  'KeyL': 'l', // 'l' alias
  'KeyM': 'm', // 'm' alias
  'KeyN': 'n', // 'n' alias
  'KeyO': 'o', // 'o' alias
  'KeyP': 'p', // 'p' alias
  'KeyQ': 'q', // 'q' alias
  'KeyR': 'r', // 'r' alias
  'KeyS': 's', // 's' alias
  'KeyT': 't', // 't' alias
  'KeyU': 'u', // 'u' alias
  'KeyV': 'v', // 'v' alias
  'KeyW': 'w', // 'w' alias
  'KeyX': 'x', // 'x' alias
  'KeyY': 'y', // 'y' alias
  'KeyZ': 'z', // 'z' alias
  'Period': '.', // '.' alias
  'Semicolon': '\uE018', // ';' alias
  'Slash': '/', // '/' alias
  'ZenkakuHankaku': '\uE040',
  /* eslint-enable quote-props */
};

function convertKeyToRawKey(key) {
  if (Object.prototype.hasOwnProperty.call(keyUnicodeMap, key)) {
    return keyUnicodeMap[key];
  }
  // Key is raw key when no representative unicode code point for value
  return key;
}

function getNormalizedKey(key) {
  let normalizedKey = getNormalizedKeyAttributeValue(key);
  // Always use "left" modifier keys for non-W3C sessions,
  // as JsonWireProtocol does not support "right" modifier keys
  if (!this.browser.isW3C) {
    normalizedKey = normalizedKey.replace(/^(Alt|Control|Meta|Shift)Right$/, '$1');
  }
  if (key !== normalizedKey) {
    this.debugSection('Input', `Mapping key '${key}' to '${normalizedKey}'`);
  }
  return convertKeyToRawKey(normalizedKey);
}

const unicodeModifierKeys = modifierKeys.map(k => convertKeyToRawKey(k));
function isModifierKey(key) {
  return unicodeModifierKeys.includes(key);
}

function prepareLocateFn(context) {
  if (!context) return this._locate.bind(this);
  return (l) => {
    l = new Locator(l, 'css');
    return this._locate(context, true).then(async (res) => {
      assertElementExists(res, context, 'Context element');
      if (l.react) {
        return res[0].react$$(l.react, l.props || undefined);
      }
      return res[0].$$(l.simplify());
    });
  };
}

function isWebDriver5() {
  return version && version.indexOf('5') === 0;
}

module.exports = WebDriver;
