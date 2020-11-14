// .vuepress/config.jsa
module.exports = {
    base: '/toby-spring/', // base url을 설정합니다.
    title: 'Toby\'s Spring Study',
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Sample', link: '/sample.html' },
        ],
        sidebar: [
            '/chapter01/',
            '/chapter02/',
        ],
        sidebarDepth: 1, // default, h2
   },
};
