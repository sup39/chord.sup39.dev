import mdx from '@next/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ExportHeadings from '@sup39/rehype-mdx-export-headings';
import ComponentWrapper from '@sup39/rehype-mdx-component-wrapper';
import AutoImport from '@sup39/rehype-mdx-auto-import';

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      remarkFrontmatter,
      remarkGfm,
      remarkMath,
      [remarkMdxFrontmatter, {name: 'meta'}],
    ],
    rehypePlugins: [
      rehypeKatex,
      [ExportHeadings, {tags: ['h2'], name: 'headings'}],
      [ComponentWrapper, {props: ['headings', 'meta']}],
      [AutoImport,
        {
          import: ['T', 'S', 'C'],
          from: '@sup39/mdx-components',
        },
      ],
    ],
  },
});
export default withMDX({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  trailingSlash: false,
  webpack(config) {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'yaml-loader',
    });
    return config;
  },
});
