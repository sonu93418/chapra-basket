module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@theme': './src/theme',
            '@store': './src/store',
            '@features': './src/features',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@assets': './assets',
            '@data': './src/data',
            '@types': './src/types',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
