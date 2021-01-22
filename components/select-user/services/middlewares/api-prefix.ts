// api prefix
// @author Pluto <huarse@gmail.com>
// @create 2020/07/01 11:11

import { NetOptions } from '../interface';

// @ts-ignore
export const env = (document.querySelector('meta[name="x-server-env"]') || { content: 'test' }).content;
// export const env = 'test';

// 域名配置
export const domainMap: {
  [env: string]: string;
} = {
  dev: '//aly-test.api.xiaoyuanhao.com/portal-test',
  // dev: 'http://aly-test-v2.xiaoyuanhao.com/nbugs-api/portal',
  test: '//aly-test.api.xiaoyuanhao.com/portal-test',
  // 测试环境通过nginx配置/nbugs-api/portal拦截，转发到服务端对应的地址端口中，故去掉域名
  // test: '/nbugs-api/portal',
  production: '//portal.api.xiaoyuanhao.com',
  // production: '/nbugs-api/portal'
  // prod: '//portal.api.xiaoyuanhao.com/nbugs-api/portal'
};

/** 是否是相对路径 */
export function isAbsolutePath(url: string) {
  return /^(https?:)?\/\//.test(url);
}

/**
 * 为相对路径请求地址加上 host 前缀
 * @param api 请求地址
 */
export function apiPrefix(api: string) {
  // 如果是绝对路径，则跳过
  if (isAbsolutePath(api)) {
    return api;
  }

  // const domain = domain || 'xxx';
  const urlPrefix = domainMap[env];

  if (!urlPrefix) {
    return api;
  }

  return `${urlPrefix}${api}`;
}

export default function apiPrefixMiddleware(ctx: NetOptions) {
  ctx.api = apiPrefix(ctx.api);
  return ctx.next();
}
