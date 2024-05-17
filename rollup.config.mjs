import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'index.ts',
  output: [
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'KeySound',
      sourcemap: true,
      plugins: [terser()],
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
    }),
  ],
};
