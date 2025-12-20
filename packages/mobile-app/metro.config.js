// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the project root (mobile-app) and monorepo root
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// 2. Configure resolver for monorepo - mobile-app's node_modules first
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
];

// 3. ENABLE package exports to support modern packages like uuid
config.resolver.unstable_enablePackageExports = true;

// 4. Add extra modules resolution for workspace packages + polyfills
config.resolver.extraNodeModules = {
    // Map loot-core to its pre-built mobile bundle
    'loot-core': path.resolve(monorepoRoot, 'packages/loot-core'),
    '@actual-app/crdt': path.resolve(monorepoRoot, 'packages/crdt'),
    '@actual-app/api': path.resolve(monorepoRoot, 'packages/api'),
    // Force uuid to resolve from mobile-app's node_modules
    'uuid': path.resolve(projectRoot, 'node_modules/uuid'),
    // Node polyfills for React Native
    'crypto': path.resolve(projectRoot, 'node_modules/expo-standard-web-crypto'),
    'stream': path.resolve(projectRoot, 'node_modules/stream-browserify'),
    'buffer': path.resolve(projectRoot, 'node_modules/buffer'),
};

// 5. Custom resolver - minimal since we're using pre-built bundle
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
    // The pre-built mobile bundle handles everything internally
    // We just need to ensure it resolves correctly

    // Fall back to default resolution
    if (originalResolveRequest) {
        return originalResolveRequest(context, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
};

// 6. Add support for additional file extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];

// 7. Block problematic modules that don't work in React Native
config.resolver.blockList = [
    /.*\.electron\.ts$/,
    /.*\.electron\.js$/,
    /node_modules\/better-sqlite3\/.*/,
    /node_modules\/absurd-sql\/.*/,
];

// 8. Resolver condition names to support package exports
config.resolver.unstable_conditionNames = ['browser', 'import', 'require', 'default'];

// 9. Add sqlite to asset extensions so we can bundle the default database template
config.resolver.assetExts = [...config.resolver.assetExts, 'sqlite', 'db'];

module.exports = config;
