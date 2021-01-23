import React, { useContext } from 'react';
import { Checkbox, Icon } from 'antd-mobile';
import classnames from 'classnames';
import { render } from 'react-dom';
import { TREE_CONTEXT } from '../../../select-user';

export interface ItreeItem {
  id: string;
  key: string;
  name: string;
  label: any;
  nodeType: string;
  orgId?: string;
  type?:
    | 'DEPT' // 部门
    | 'GROUP_DEPT' //  虚拟部门
    | 'USER' // 个人
    | 'ORG' // 组织
    | 'TAG' // 标签
    | 'GROUP'; // 分组
  deptType?:
    | 0 // 基础校区
    | 1; // 自定义校区
  userCount?: number;
  children?: ItreeItem[];
  checkable?: boolean;
  isLeaf?: boolean;
  icon?: any;
  contactType?: string;
  count?: number;
}

const { CheckboxItem } = Checkbox;

interface PropType {
  currentTab: string; // 用当前选中的tab作为Tree组件的key，当切换tab时使Tree组件重新生成
  multiple: boolean;
  selectTypeList: any; // 可选节点列表
  loadData?: (node: any) => Promise<void>;
  node: any;
  arrow?: boolean;
  accordion: any[];
  breadcrumb: any[];
  className?: string;
  setCurrentTab?: any;
  handleSelect: (nodeItem: ItreeItem, tab?: string) => void;
}

const PannelItem: React.FunctionComponent<PropType> = (props: PropType) => {
  // 获取props
  const {
    currentTab,
    multiple,
    selectTypeList,
    node,
    handleSelect,
    arrow = true,
    className,
  } = props;
  // 获取treeContext
  const treeContext = useContext(TREE_CONTEXT);
  const { treeState, updateCheckedNode, clear, resetUserCount } = treeContext;
  // 树节点选中事件
  const onCheck = (node: any) => {
    const item: ItreeItem = {
      id: node.key,
      label: node.label,
      name: node.name,
      key: node.key,
      type: node.type,
      nodeType: node.nodeType,
      orgId: node.orgId,
      contactType: node.contactType,
    };
    const { key } = item;

    let checked = null;
    // 如果是多选
    if (multiple) {
      // 节点是否选中
      checked = updateCheckedNode(item, key);
    } else {
      // 如果是单选的情况
      const { checkedKeys } = treeState;
      if (checkedKeys[0] === key) {
        // 更新选中节点
        checked = updateCheckedNode(item, key);
      } else {
        // 先清空所选
        clear();

        // 更新选中节点
        checked = updateCheckedNode(item, key);
      }
    }

    // 如果只可选某一个，则不需要统计分组人数
    if (selectTypeList && selectTypeList.length === 1) {
      resetUserCount(item, checked, false);
    } else {
      resetUserCount(item, checked);
    }
  };

  const renderCheckboxItem = (node: {
    type: string;
    key: React.Key;
    checked: any;
    isLeaf: boolean;
  }) => {
    if (currentTab === 'innerContacts' && node.type === 'ORG') {
      return <div style={{ height: 45, paddingLeft: 35 }}></div>;
    }
    if (currentTab === 'tags' && node.isLeaf === false) {
      return <div style={{ height: 45, paddingLeft: 35 }}></div>;
    }

    return (
      <CheckboxItem
        key={node.key}
        checked={node.checked}
        onChange={() => onCheck(node)}
      ></CheckboxItem>
    );
  };

  return (
    <div
      className={classnames('panel-header', {
        'panel-user-header': !!className,
      })}
    >
      <div className="line">
        <div
          className={classnames('check-box-item', {
            multiple: multiple === false,
          })}
        >
          {renderCheckboxItem(node)}
          {/* */}
        </div>
        <div className="label" onClick={() => onCheck(node)}>
          {node.label}
        </div>
        {arrow && node.type !== 'USER' && !node.isLeaf && (
          <div className="icon" onClick={() => handleSelect(node, currentTab)}>
            <Icon type="right" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PannelItem;
