// 用于解决 `typescdript can't find module less`
// @see https://stackoverflow.com/questions/46501297/typescript-cant-find-module-less/46501346

declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}
