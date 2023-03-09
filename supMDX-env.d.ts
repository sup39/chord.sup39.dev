declare module '#config' {
  import type {MDXConfig} from '@sup39/mdx-page';
  type Config = MDXConfig & {
  };
  const config: Config;
  export default config;
}

declare module '*.yaml' {
  const data: any;
  export default data;
}
