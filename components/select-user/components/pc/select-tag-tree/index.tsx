import React, { useContext } from 'react';
import { Tree } from '@alifd/next';
import { TREE_CONTEXT } from '../../../select-user';
import { ItreeItem } from '../../../interface';
import useSelectExpand from '../../../hooks/use-select-expand';

interface PropType {
  currentTab: string; // 用当前选中的tab作为Tree组件的key，当切换tab时使Tree组件重新生成
  multiple: boolean;
  loadData: (node: any) => Promise<void>;
}

const SelectTagTree: React.FunctionComponent<PropType> = (props: PropType) => {
  // 获取props
  const { currentTab, multiple, loadData } = props;
  // 获取treeContext
  const treeContext = useContext(TREE_CONTEXT);
  const { treeState, updateCheckedNode, clear, resetUserCount } = treeContext;
  const { treeData, checkedKeys } = treeState;
  const { expandedKeys, setExpandedKeys, handleSelect } = useSelectExpand(
    currentTab,
    loadData,
  );

  // 树节点选中事件
  const onCheck = (checkedKeys: any, info: any) => {
    const node = info.node.props;

    const item: ItreeItem = {
      id: node._key,
      label: node.label,
      name: node.name,
      key: node._key,
      type: node.type,
      nodeType: node.nodeType,
      orgId: node.orgId
    };
    const key = item.key;

    // 如果是多选
    if (multiple) {
      // 节点是否选中
      const checked = updateCheckedNode(item, key);
      resetUserCount(item, checked);
    } else {
      // 如果是单选的情况
      const checkedKeys = treeState.checkedKeys;
      if (checkedKeys[0] === key) {
        // 更新选中节点
        const checked = updateCheckedNode(item, key);
        resetUserCount(item, checked);
      } else {
        // 先清空所选
        clear();

        // 更新选中节点
        const checked = updateCheckedNode(item, key);
        resetUserCount(item, checked);
      }
    }
  };
  return treeData && treeData.length > 0 ? (
    <Tree
      selectedKeys={[]}
      key={currentTab}
      checkedKeys={checkedKeys}
      onCheck={onCheck}
      checkable
      multiple={multiple}
      expandedKeys={expandedKeys}
      onExpand={setExpandedKeys}
      onSelect={handleSelect}
      checkStrictly
      loadData={loadData}
      isLabelBlock
      isNodeBlock
      dataSource={treeData}
    />
  ) : (
    <div className="cf-tree-result-empty">暂无内容</div>
  );
};

export default SelectTagTree;
