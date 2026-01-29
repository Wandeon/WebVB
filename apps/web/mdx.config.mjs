import remarkGfm from 'remark-gfm';

/** @type {import('@mdx-js/mdx').CompileOptions} */
const mdxConfig = {
  remarkPlugins: [remarkGfm],
};

export default mdxConfig;
