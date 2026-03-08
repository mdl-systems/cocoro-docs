import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

type FeatureItem = {
    icon: string;
    title: string;
    description: string;
};

const features: FeatureItem[] = [
    {
        icon: '🧠',
        title: '人格の一貫性',
        description:
            'Memory + Values + Emotion + Decision Graph により、LLMが変わっても記憶・価値観・感情は完全に維持されます。',
    },
    {
        icon: '📦',
        title: 'ローカルファースト',
        description:
            'miniPC（Intel N95）上で完全自律動作。Ollamaを使えばインターネット接続なしでオフライン運用も可能。',
    },
    {
        icon: '🤖',
        title: '自律エージェント',
        description:
            '10種のFunction Callingツールを備えたAI Agentが、複雑なタスクを自律的に計画・実行します。',
    },
    {
        icon: '🔒',
        title: 'プライバシー重視',
        description:
            'すべてのデータはローカルminicPCに保存。AES-256-GCM暗号化・Ed25519認証で多層セキュリティを実現。',
    },
    {
        icon: '⚡',
        title: 'ゼロタッチデプロイ',
        description:
            'cocoro-installerでUSBを挿すだけでDebian 13 + Docker + cocoro-coreが全自動セットアップ完了。',
    },
    {
        icon: '🌐',
        title: '2フロントエンド設計',
        description:
            'cocoro-console（LAN内管理UI）とcocoro-website（公開SNS）の2層構造で用途に最適化。',
    },
];

function Feature({ icon, title, description }: FeatureItem) {
    return (
        <div className="col col--4" style={{ marginBottom: '1.5rem' }}>
            <div className="feature-card">
                <span className="feature-icon">{icon}</span>
                <div className="feature-title">{title}</div>
                <p style={{ margin: 0, color: 'var(--ifm-color-content-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {description}
                </p>
            </div>
        </div>
    );
}

function HomepageHero() {
    return (
        <header className="hero">
            <div className="container" style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <span className="badge-chip">v0.1.0-alpha</span>
                    <span className="badge-chip">Apache 2.0</span>
                    <span className="badge-chip">Python 3.11</span>
                    <span className="badge-chip">TypeScript</span>
                </div>
                <Heading as="h1" className="hero__title">
                    AIに人格を与えるOS
                </Heading>
                <p className="hero__subtitle">
                    LLMを「声帯」として扱い、Memory + Values + Emotion + Decision Graph で<br />
                    <strong>人格の一貫性</strong>を保証するパーソナルAI意識OS
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                    <Link className="button button--primary button--lg" to="/docs/getting-started/quickstart">
                        🚀 クイックスタート（5分）
                    </Link>
                    <Link className="button button--secondary button--lg" to="/docs/architecture">
                        📐 アーキテクチャを見る
                    </Link>
                    <Link
                        className="button button--secondary button--lg"
                        href="https://github.com/mdl-systems/cocoro-core"
                    >
                        ⭐ GitHub
                    </Link>
                </div>

                {/* ミニステータス */}
                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    justifyContent: 'center',
                    marginTop: '3rem',
                    flexWrap: 'wrap',
                    opacity: 0.7,
                    fontSize: '0.85rem',
                }}>
                    {[
                        { num: '53', label: 'モジュール' },
                        { num: '131', label: 'APIエンドポイント' },
                        { num: '231', label: 'テスト' },
                        { num: '11', label: 'レイヤー' },
                    ].map(({ num, label }) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ifm-color-primary)' }}>
                                {num}
                            </div>
                            <div>{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </header>
    );
}

function HomepageFeatures() {
    return (
        <section className="features">
            <div className="container">
                <Heading as="h2" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    なぜ Cocoro OS なのか
                </Heading>
                <div className="row">
                    {features.map((item) => (
                        <Feature key={item.title} {...item} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function HomepageQuickDemo() {
    return (
        <section style={{ padding: '4rem 0', background: 'var(--ifm-background-color)' }}>
            <div className="container">
                <div className="row" style={{ alignItems: 'center' }}>
                    <div className="col col--6">
                        <Heading as="h2">5分で動かしてみる</Heading>
                        <p style={{ color: 'var(--ifm-color-content-secondary)', lineHeight: 1.8 }}>
                            Docker Composeで起動し、すぐにチャットできます。
                            Gemini APIキーがあれば、今すぐ試せます。
                        </p>
                        <Link className="button button--primary" to="/docs/getting-started/quickstart">
                            クイックスタートガイド →
                        </Link>
                    </div>
                    <div className="col col--6">
                        <div style={{
                            background: '#1e1e2e',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            fontFamily: 'var(--ifm-font-family-monospace)',
                            fontSize: '0.85rem',
                            lineHeight: 1.7,
                            color: '#cdd6f4',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
                        }}>
                            <div style={{ color: '#6c7086', marginBottom: '0.5rem' }}>{'# 起動'}</div>
                            <div><span style={{ color: '#89b4fa' }}>cd</span> infra/docker</div>
                            <div><span style={{ color: '#89b4fa' }}>docker</span> compose up <span style={{ color: '#a6e3a1' }}>-d</span> --build</div>
                            <br />
                            <div style={{ color: '#6c7086' }}>{'# チャット（すぐ試せる）'}</div>
                            <div style={{ color: '#89b4fa' }}>curl <span style={{ color: '#f38ba8' }}>-X POST</span> http://localhost:8001/chat \</div>
                            <div style={{ paddingLeft: '1rem', color: '#f5c2e7' }}>
                                {'-H "Authorization: Bearer $COCORO_API_KEY"'} \
                            </div>
                            <div style={{ paddingLeft: '1rem', color: '#f5c2e7' }}>
                                {"-d '{\"message\": \"こんにちは\"}'"}
                            </div>
                            <br />
                            <div style={{ color: '#a6e3a1' }}>{'{"text": "こんにちは！私はCocoro OSです。..."}'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Home(): ReactNode {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`${siteConfig.title} - AIに人格を与えるOS`}
            description="Cocoro OS は、Memory+Values+Emotion+Decision Graphで人格の一貫性を保証するパーソナルAI意識OS。miniPC上でローカル常時稼働。"
        >
            <HomepageHero />
            <main>
                <HomepageFeatures />
                <HomepageQuickDemo />
            </main>
        </Layout>
    );
}
