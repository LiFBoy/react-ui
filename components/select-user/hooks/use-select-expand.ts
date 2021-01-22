import { useState, useCallback, useEffect } from 'react';
import { get } from 'lodash';

export default (currentTab: string, loadData: (node: any) => Promise<void>) => {
  const [expandedKeys, _setExpandedKeys] = useState([]);
  // 解决切换 tab 后，展开状态仍保持原样的问题
  // 等合并了之前的「默认展开根节点」分支后，这个部分也会有 conflict，需要合并处理。
  useEffect(() => {
    _setExpandedKeys([]);
  }, [currentTab]);
  const setExpandedKeys = useCallback(
    (nextExpandedKeys, { expanded, node }) => {
      let _nextExpandedKeys = [...nextExpandedKeys];

      // 深度遍历删除展开的子节点
      const removeChildren = (currentNode: any) => {
        if (_nextExpandedKeys.length === 0) {
          // 如果没有展开的节点，则无需继续深度遍历
          return;
        }
        const eventKey = get(currentNode, 'props.eventKey');

        if (_nextExpandedKeys.includes(eventKey)) {
          _nextExpandedKeys = _nextExpandedKeys.filter(_ => _ !== eventKey);
        }
        get(currentNode, 'props.children', []).forEach(removeChildren);
      };
      if (!expanded) {
        // fusion 的 tree 有个特性，如果子节点是展开的，那么自动展开父节点
        // 所以这里如果是收起节点的话，需要把节点及其子节点都从 expandedKeys 中去掉才行
        removeChildren(node);
      }
      _setExpandedKeys(_nextExpandedKeys);
    },
    [_setExpandedKeys]
  );

  // 点击树节点时，控制展开 & 收起，获取子节点
  const handleSelect = useCallback(
    (selectedKeys, event) => {
      if (event.node.props.isLeaf) {
        return;
      }
      const [key] = selectedKeys;
      const matchedExpandIndex = expandedKeys.indexOf(key);
      if (matchedExpandIndex >= 0) {
        setExpandedKeys(
          [
            ...expandedKeys.slice(0, matchedExpandIndex),
            ...expandedKeys.slice(matchedExpandIndex + 1)
          ],
          { expanded: false, node: event.node }
        );
      } else {
        setExpandedKeys(Array.from(new Set([...expandedKeys, key])), {
          expanded: true,
          node: event.node
        });
        loadData(event.node);
      }
    },
    [loadData, expandedKeys, setExpandedKeys]
  );
  return {
    expandedKeys,
    setExpandedKeys,
    handleSelect
  };
};
