import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/yafo.tsx',
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [typescript()],
};
