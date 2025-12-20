import path from 'path';

import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import peggyLoader from 'vite-plugin-peggy-loader';

// Mobile-specific build configuration for loot-core
// Produces an ESM bundle that uses expo-sqlite instead of sql.js
export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';
    const outDir = path.resolve(__dirname, 'lib-dist/mobile');
    const crdtDir = path.resolve(__dirname, '../crdt');
    const mobileAppDir = path.resolve(__dirname, '../mobile-app');

    return {
        mode,
        build: {
            target: 'es2020',
            outDir,
            emptyOutDir: true,
            lib: {
                entry: path.resolve(__dirname, 'src/server/main.ts'),
                name: 'lootCore',
                formats: ['es'],
                fileName: () => 'loot-core.mobile.js',
            },
            rollupOptions: {
                onwarn(warning, warn) {
                    if (
                        warning.plugin === 'peggy-loader' &&
                        warning.message?.includes('Sourcemap')
                    ) {
                        return;
                    }
                    warn(warning);
                },
                output: {
                    format: 'es',
                    inlineDynamicImports: true,
                },
                // Externalize React Native modules that should be resolved at runtime
                external: [
                    'react-native',
                    'expo-file-system',
                    'expo-sqlite',
                    '@react-native-async-storage/async-storage',
                    'expo-standard-web-crypto',
                    'lru-cache',
                ],
            },
            sourcemap: isDev,
            minify: isDev ? false : 'esbuild',
        },
        resolve: {
            extensions: [
                '.mobile.ts',
                '.mobile.js',
                '.ts',
                '.tsx',
                '.js',
                '.jsx',
                '.json',
            ],
            alias: [
                // Use mobile SQLite implementation instead of sql.js
                {
                    find: '../platform/server/sqlite',
                    replacement: path.resolve(mobileAppDir, 'src/platform/sqlite.mobile.ts'),
                },
                {
                    find: '../../platform/server/sqlite',
                    replacement: path.resolve(mobileAppDir, 'src/platform/sqlite.mobile.ts'),
                },
                // Use mobile fs implementation
                {
                    find: '../platform/server/fs',
                    replacement: path.resolve(mobileAppDir, 'src/platform/fs.mobile.ts'),
                },
                {
                    find: '../../platform/server/fs',
                    replacement: path.resolve(mobileAppDir, 'src/platform/fs.mobile.ts'),
                },
                // Use mobile asyncStorage implementation
                {
                    find: '../platform/server/asyncStorage',
                    replacement: path.resolve(mobileAppDir, 'src/platform/asyncStorage.mobile.ts'),
                },
                {
                    find: '../../platform/server/asyncStorage',
                    replacement: path.resolve(mobileAppDir, 'src/platform/asyncStorage.mobile.ts'),
                },
                // Use mobile connection implementation
                {
                    find: '../platform/server/connection',
                    replacement: path.resolve(mobileAppDir, 'src/platform/connection.mobile.ts'),
                },
                {
                    find: '../../platform/server/connection',
                    replacement: path.resolve(mobileAppDir, 'src/platform/connection.mobile.ts'),
                },
                // Use mobile log implementation
                {
                    find: '../platform/server/log',
                    replacement: path.resolve(mobileAppDir, 'src/platform/log.mobile.ts'),
                },
                {
                    find: '../../platform/server/log',
                    replacement: path.resolve(mobileAppDir, 'src/platform/log.mobile.ts'),
                },
                // Use mobile fetch implementation
                {
                    find: '../platform/server/fetch',
                    replacement: path.resolve(mobileAppDir, 'src/platform/fetch.mobile.ts'),
                },
                {
                    find: '../../platform/server/fetch',
                    replacement: path.resolve(mobileAppDir, 'src/platform/fetch.mobile.ts'),
                },
                // CRDT package
                {
                    find: '@actual-app/crdt',
                    replacement: path.resolve(crdtDir, 'src'),
                },
            ],
        },
        define: {
            'process.env': '{}',
            'process.env.IS_DEV': JSON.stringify(isDev),
            'process.env.PUBLIC_URL': JSON.stringify('/'),
            'process.env.ACTUAL_DATA_DIR': JSON.stringify('/'),
            'process.env.ACTUAL_DOCUMENT_DIR': JSON.stringify('/documents'),
            'process.env.NODE_ENV': JSON.stringify(mode),
        },
        plugins: [
            peggyLoader(),
            nodePolyfills({
                include: [
                    'process',
                    'stream',
                    'path',
                    'zlib',
                    'assert',
                    'buffer',
                    'crypto',
                ],
                globals: {
                    process: true,
                    global: true,
                    Buffer: true,
                },
            }),
        ],
        optimizeDeps: {
            include: [
                'buffer',
                'process',
                'assert',
                'path-browserify',
                'stream-browserify',
                'browserify-zlib',
            ],
        },
    };
});
