module.exports = {
  title: 'CodeceptJS', // Title for your website.
  description: 'SuperCharged End 2 End Testing with WebDriver & Puppeteer',
  head: [
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png' }],
    ['link', { rel: 'manifest', href: '/favicon/site.webmanifest' }],
    ['link', { rel: 'mask-icon', href: '/favicon/safari-pinned-tab.svg', color: '#805ad5' }],
    ['meta', { name: 'theme-color', content: '#805ad5' }],
    ['meta', { name: 'msapplication-config', content: '/favicon/browserconfig.xml' }],
    ['script', {}, `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P98R7LQ');`]
  ],

  themeConfig: {
    lastUpdated: 'Last Updated',
    docsRepo: 'codeception/codeceptjs',
    // if your docs are not at the root of the repo:
    docsDir: 'docs',
    // if your docs are in a specific branch (defaults to 'master'):
    docsBranch: 'master',
    // defaults to false, set to true to enable
    editLinks: true,
    // custom text for edit link. Defaults to "Edit this page"
    editLinkText: 'Help us improve this page!',
    logo: '/logo.svg',
    searchPlaceholder: 'Search...',
    algolia: {
      apiKey: '0cc13a0af567a05fc38790be681b1491',
      indexName: 'codecept'
    },

    nav: [
      {
        text: 'Quickstart',
        link: '/quickstart',
      },

      {
      text: "Guides",
      items: [
        {
          group: "Basics",
          items: [
            { text: "Getting Started", link: '/basics' },
            { text: "CodeceptUI", link: '/ui' },
          ]
        },
        {
          group: "Helpers",
          items: [
            { text: "Using WebDriver", link: '/webdriver' },
            { text: "Using Puppeteer", link: '/puppeteer' },
            { text: "Using Playwright", link: '/playwright' },
            { text: "Using TestCafe", link: '/testcafe' },
            { text: "Mobile Testing", link: '/mobile' },
          ]
        },
        {
          group: "Other",
          items: [
            { text: "Custom Helpers", link: '/custom-helpers' },
            { text: "Locators", link: "/locators" },
            { text: "Page Objects", link: "/pageobjects" },
            { text: "Behavior Driven Development", link: "/bdd" },
            { text: "TypeScript", link: "/typescript" },
            { text: "Data Management", link: "/data" },
            { text: "Parallel Execution", link: "/parallel" },
            { text: "Reports", link: "/reports" },
          ]
        },
        {
          group: "Other",
          items: [
            { text: "Best Practices", link: "/best" },
            { text: "Advanced Usage", link: "/advanced" },
          ]
        },

        // {
        //   group: "Mobile Testing",
        //   text: 'Mobile Testing',
        //   items: [
        //     "mobile",
        //     "detox",
        //   ],
        // },
        // {
        //   group: "Organizing Tests",
        //   text: 'Organizing Tests',
        //   items: [
        //     { text: "best", link: "best" },
        //     { text: "locators", link: "locators" },
        //     { text: "pageobjects", link: "pageobjects" },
        //     { text: "helpers", link: "helpers" },
        //     { text: "bdd", link: "bdd" },
        //     { text: "data", link: "data" },
        //     { text: "parallel", link: "parallel" },
        //     { text: "reports", link: "reports" },
        //     { text: "advanced", link: "advanced" },
        //     { text: "hooks", link: "hooks" },
        //   ],
        // }
      ],
      // "Tutorials": [
      // { text: //   "books, link: //   "books" },
      // { text: //   "videos, link: //   "videos" },
      //   "examples"
      // ]
    },
    {
      text: "Helpers",
      items: [
        {
          group: "Web Testing",
          text: 'Web Testing',
          items: [
            { text: "Playwright", link: "/helpers/Playwright" },
            { text: "WebDriver", link: "/helpers/WebDriver" },
            { text: "Puppeteer", link: "/helpers/Puppeteer" },
            { text: "Protractor", link: "/helpers/Protractor" },
            { text: "TestCafe", link: "/helpers/TestCafe" },
            { text: "Nightmare", link: "/helpers/Nightmare" },
          ]
        },
        {
          group: "Mobile Testing",
          text: 'Mobile Testing',
          items: [
            { text: "Appium", link: "/helpers/Appium" },
            { text: "Detox", link: "/helpers/Detox" },
          ]
        },
        {
          group: 'Data Helpers',
          text: 'API Helpers',
          items: [
            { text: "REST", link: "/helpers/REST" },
            { text: "ApiDataFactory", link: "/helpers/ApiDataFactory" },
            { text: "GraphQL", link: "/helpers/GraphQL" },
            { text: "GraphQLDataFactory", link: "/helpers/GraphQLDataFactory" },
            { text: "MockRequest", link: "/helpers/MockRequest" },
          ]
        },
        {
          group: 'other',
          items: [
            { text: "FileSystem", link: "/helpers/FileSystem" },
            { text: "Community Helpers", link: "/community-helpers" },
          ]
        },
      ]
    },
    {
      text: 'Plugins',
      link: '/plugins',
    },
    {
      text: "API",
      items: [
        { text: "Installation", link: "/installation" },
        { text: "Commands", link: "/commands" },
        { text: "Configuration", link: "/configuration" },
        { text: "Docker", link: "/docker" },
        { text: "Translation", link: "/translation" },
      ],
    },
    {
      text: 'Releases',
      link: '/changelog',
    },
    {
      text: "Community",
      items: [
        {
          group: 'links',
          items: [
            { text: "GitHub", link: "https://github.com/codeceptjs/CodeceptJS" },
            { text: "Discussions", link: "https://github.com/codeceptjs/CodeceptJS/discussions" },
            { text: "Slack Chat", link: "http://bit.ly/chat-codeceptjs" },
            { text: "Forum", link: "https://codecept.discourse.group/" },
            { text: "Twitter", link: "https://twitter.com/codeceptjs" },
            { text: "Stack Overflow", link: "https://stackoverflow.com/questions/tagged/codeceptjs" },
          ],
        },
        {
          group: 'wiki',
          items: [
            { text: "Plugins & Helpers", link: "https://github.com/codeceptjs/CodeceptJS/wiki/Community-Helpers-&-Plugins" },
            { text: "Examples", link: "https://github.com/codeceptjs/CodeceptJS/wiki/Examples" },
            { text: "Videos", link: "https://github.com/codeceptjs/CodeceptJS/wiki/Videos" },
            { text: "Posts", link: "https://github.com/Codeception/CodeceptJS/wiki/Books-&-Posts" },
          ],
        },
        {
          group: 'commerce',
          items: [
            { text: "Commercial Support", link: "http://sdclabs.com/" },
            { text: "Trainings", link: "http://sdclabs.com/trainings/web-automation-codeceptjs?utm_source=codecept.io&utm_medium=top_menu&utm_term=link&utm_campaign=reference" },
          ]
        },
        {
          group: 'support',
          items: [
            { text: "Support us via OpenCollective!", link: "https://opencollective.com/codeceptjs" },
          ]
        }
      ],
    },

    ],

    sidebar: {
      '/helpers/': [],
      '/': [
        {
          title: 'Web Testing',   // required
          sidebarDepth: 2,    // optional, defaults to 1
          collapsable: true,
          children: [
            "basics",
            'ui',
            'playwright',
            'webdriver',
            'puppeteer',
            'testcafe',
            'angular',
          ]
        },
        {
          title: 'Mobile Testing',
          children: [
            "mobile",
            "detox",
          ]
        },
        {
          title: 'Organizing Tests',
          children: [
            "custom-helpers",
            "typescript",
            "locators",
            "pageobjects",
            "data",
            "best",
            "bdd",
          ]
        },
        {
          title: 'Advanced Usage',
          children: [
            "advanced",
            "bootstrap",
            "reports",
            "continuous-integration",
            "parallel",
            'visual',
            'email',
            'react',
          ]
        },
      ]
    }
  },


  postcss: {

    plugins: [
      require("tailwindcss")("./tailwind.config.js"),
    ]
  },

  plugins: {
    'sitemap': {
      hostname: 'https://codecept.io'
    }
  }
}
