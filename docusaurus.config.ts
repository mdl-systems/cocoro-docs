import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
    title: 'Cocoro OS',
    tagline: 'AIに人格を与えるOS',
    favicon: 'img/favicon.ico',

    url: 'https://mdl-systems.github.io',
    baseUrl: '/cocoro-docs/',

    organizationName: 'mdl-systems',
    projectName: 'cocoro-docs',
    trailingSlash: false,

    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',

    markdown: {
        mermaid: true,
    },

    themes: ['@docusaurus/theme-mermaid'],

    i18n: {
        defaultLocale: 'ja',
        locales: ['ja'],
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    editUrl: 'https://github.com/mdl-systems/cocoro-docs/tree/main/',
                },
                blog: false,
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        image: 'img/cocoro-social-card.png',
        colorMode: {
            defaultMode: 'light',
            disableSwitch: false,
            respectPrefersColorScheme: true,
        },
        navbar: {
            title: 'Cocoro OS',
            logo: {
                alt: 'Cocoro OS Logo',
                src: 'img/logo.svg',
            },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'tutorialSidebar',
                    position: 'left',
                    label: 'ドキュメント',
                },

                {
                    href: 'https://github.com/mdl-systems/cocoro-core',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'ドキュメント',
                    items: [
                        {
                            label: 'クイックスタート',
                            to: '/docs/getting-started/quickstart',
                        },
                        {
                            label: 'アーキテクチャ',
                            to: '/docs/architecture',
                        },
                        {
                            label: 'SDK リファレンス',
                            to: '/docs/sdk/overview',
                        },
                    ],
                },
                {
                    title: 'リポジトリ',
                    items: [
                        {
                            label: 'cocoro-core',
                            href: 'https://github.com/mdl-systems/cocoro-core',
                        },
                        {
                            label: 'cocoro-console',
                            href: 'https://github.com/mdl-systems/cocoro-console',
                        },
                        {
                            label: 'cocoro-installer',
                            href: 'https://github.com/mdl-systems/cocoro-installer',
                        },
                    ],
                },
                {
                    title: 'リンク',
                    items: [

                        {
                            label: 'GitHub (mdl-systems)',
                            href: 'https://github.com/mdl-systems',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} mdl-systems. Licensed under Apache 2.0.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
            additionalLanguages: ['bash', 'typescript', 'python', 'yaml', 'json'],
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
