import React from 'react';
import './index.less';

// 标签
export const TagIcon: React.FunctionComponent = () => {
  return <span className="user-center-tree-node-icon select-user-icon-tag-mobile" />;
};

// 用户
export const UserIcon: React.FunctionComponent = () => {
  return <span className="user-center-tree-node-icon select-user-icon-user-mobile" />;
};

// 内部通讯录
export const InternalIcon: React.FunctionComponent = () => {
  return <span className="user-center-tree-node-icon select-user-icon-internal-mobile" />;
};

// 组织
export const OrgIcon: React.FunctionComponent = () => {
  return <span className="user-center-tree-node-icon select-user-icon-org-mobile" />;
};

// 部门
export const DeptIcon: React.FunctionComponent = () => {
  return <span className="user-center-tree-node-icon select-user-icon-dept-mobile" />;
};

export type IconType =
  | 'org'
  | 'ORG'
  | 'internal'
  | 'Internal'
  | 'user'
  | 'USER'
  | 'DEPT'
  | 'dept'
  | 'tag'
  | 'TAG';

const iconMap: {
  [iconType in IconType]: React.ComponentType;
} = {
  org: OrgIcon,
  dept: DeptIcon,
  internal: InternalIcon,
  Internal: InternalIcon,
  tag: TagIcon,
  user: UserIcon,
  USER: UserIcon,
  ORG: OrgIcon,
  DEPT: DeptIcon,
  TAG: TagIcon
};

export default iconMap;
