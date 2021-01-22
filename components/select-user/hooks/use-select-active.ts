import { useState, useCallback, useRef, useContext } from 'react';
import { ItreeItem } from '../interface';
import { TREE_CONTEXT } from '../select-user';
interface ItemProps {
  key: string;
}
export default (
  loadData?: (node: any, tab: string) => Promise<void>,
  currentTab?: string,
  showTabList?: [],
  accordion?: [],
  setCurrentTab?: any
) => {
  const [breadcrumb, setBreadcrumb] = useState([]);
  const breadcrumbRef = useRef<any>([]);
  const treeContext = useContext(TREE_CONTEXT);
  const { setTreeData } = treeContext;
  const handleClickBreadcrumb = useCallback(
    (node: ItemProps) => {
      const { key } = node;
      if (showTabList.findIndex((tab) => tab === key) > -1) {
        setBreadcrumb([]);
        breadcrumbRef.current = [];
        setTreeData([]);
        setCurrentTab('');
      } else {
        const matchedExpandIndex = breadcrumbRef.current.findIndex(
          (item: ItreeItem) => item.key === key
        );
        const nextBreadcrumb = [...breadcrumb.slice(0, matchedExpandIndex + 1)];
        setBreadcrumb(nextBreadcrumb);
        breadcrumbRef.current = nextBreadcrumb;
        // loadData(node, currentTab);
      }
    },
    [loadData]
  );

  const handleSelect = useCallback(
    (nodeItem: ItreeItem, tab?: string) => {
      const { key } = nodeItem;
      const matchedExpandIndex = breadcrumbRef.current.findIndex(
        (item: ItreeItem) => item.key === key
      );
      if (matchedExpandIndex < 0) {
        const nextBreadcrumb = Array.from(
          new Set([...breadcrumbRef.current, nodeItem])
        );
        setBreadcrumb(nextBreadcrumb);
        breadcrumbRef.current = nextBreadcrumb;
      }
      if (!currentTab) {
        setCurrentTab(tab);
        loadData(nodeItem, tab);
      } else {
        loadData(nodeItem, currentTab);
      }
    },
    [loadData]
  );

  return {
    breadcrumb,
    handleSelect,
    handleClickBreadcrumb,
  };
};
