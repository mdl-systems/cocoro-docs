import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
    tutorialSidebar: [
        'intro',

        // Getting Started
        {
            type: 'category',
            label: '🚀 はじめる',
            collapsed: false,
            items: [
                'getting-started/hardware',
                'getting-started/quickstart',
                'getting-started/installation',
                'getting-started/boot-wizard',
                'getting-started/first-chat',
                'getting-started/configuration',
            ],
        },

        // Architecture
        {
            type: 'category',
            label: '📐 アーキテクチャ',
            items: [
                'architecture',
                'architecture/core-internals',
                'architecture/agent-system',
                'architecture/node-network',
            ],
        },

        // Guides
        {
            type: 'category',
            label: '📖 機能ガイド',
            items: [
                'guides/specialist-agents',
                'guides/memory-system',
                'guides/sync-rate-guide',
                'guides/task-scheduler',
                'guides/file-upload',
                'guides/cloudflare-tunnel',
                'guides/nextjs-integration',
                'guides/personality-setup',
                'guides/custom-agent',
                'guides/multi-node',
                'guides/factory-kitting',
            ],
        },

        // API Reference
        {
            type: 'category',
            label: '📡 API リファレンス',
            items: [
                'api/overview',
                'api/chat',
                'api/emotion',
                'api/sync',
                'api/memory',
                'api/agent',
                'api/personality',
            ],
        },

        // Concepts
        {
            type: 'category',
            label: '💡 コンセプト',
            items: [
                'concepts/personality-engine',
                'concepts/memory-system',
                'concepts/decision-graph',
                'concepts/sync-rate',
            ],
        },

        // SDK
        {
            type: 'category',
            label: '🛠️ SDK',
            items: [
                'sdk/overview',
                'sdk/quickstart',
                'sdk/chat',
                'sdk/personality',
                'sdk/memory',
                'sdk/agent',
            ],
        },

        // Troubleshooting
        {
            type: 'category',
            label: '🔧 トラブルシューティング',
            items: [
                'troubleshooting/index',
            ],
        },

        // Release Notes
        'release-notes',
    ],
};

export default sidebars;
