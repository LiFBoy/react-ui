// module.exports = {
//   presets: ['@babel/env', '@babel/typescript', '@babel/react'],
//   plugins: ['@babel/plugin-transform-runtime', '@babel/proposal-class-properties'],
//   env: {
//     esm: {
//       presets: [
//         [
//           '@babel/env',
//           {
//             modules: false,
//           },
//         ],
//       ],
//       plugins: [
//         [
//           '@babel/plugin-transform-runtime',
//           {
//             useESModules: true,
//           },
//         ],
//       ],
//     },
//   },
// };
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/proposal-decorators', { legacy: true }],
    '@babel/transform-runtime',
    ['@babel/proposal-class-properties', { loose: true }],
    '@babel/proposal-object-rest-spread',
    [
      'import',
      {
        libraryName: 'lodash',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
      'lodash',
    ],
    ['import', { libraryName: 'antd', style: true }, 'antd'],
    ['import', { libraryName: 'antd-mobile', style: true }, 'antd-mobile'],
  ],
};
