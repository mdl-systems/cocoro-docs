import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
    tutorialSidebar: [
        {
            type: 'doc',
            id: 'intro',
            label: '🏠 Cocoro OS とは',
        },
        {
            type: 'doc',
            id: 'architecture',
            label: '📐 アーキテクチャ',
        },
        {
            type: 'category',
            label: '🚀 はじめる',
            collapsed: false,
            items: [
                'getting-started/quickstart',
                'getting-started/installation',
                'getting-started/configuration',
            ],
        },
        {
            type: 'category',
            label: '📦 SDK リファレンス',
            items: [
                'sdk/overview',
                'sdk/quickstart',
                'sdk/chat',
                'sdk/personality',
                'sdk/memory',
                'sdk/agent',
            ],
        },
        {
            type: 'category',
            label: '📖 ガイド',
            items: [
                'guides/nextjs-integration',
                'guides/personality-setup',
                'guides/factory-kitting',
            ],
        },
        {
            type: 'category',
            label: '🧠 コンセプト',
            items: [
                'concepts/personality-engine',
                'concepts/memory-system',
                'concepts/decision-graph',
                'concepts/sync-rate',
            ],
        },
    ],
};

export default sidebars;
