const TAB_MAPS: any = {
  dept: '所属部门',
  group: '下属组织',
  innerContacts: '内部通讯录',
  schoolContacts: '家校通讯录',
  tags: '标签',
};
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

interface AccordionItem {
  key: string;
  children: ItreeItem[];
  icon: any;
}

import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { TREE_CONTEXT } from '../../../select-user';
import PannelItem from '../PannelItem';
import Breadcrumb from '../Breadcrumb';
import useSelectExpand from '../../../hooks/use-select-active';
import { Accordion, Toast } from 'antd-mobile';

import {
  TagIcon,
  DeptIcon,
  OrgIcon,
  InternalIcon,
} from '../../tree-node-icon-mobile';
interface PropType {
  currentTab?: string; // 用当前选中的tab作为Tree组件的key，当切换tab时使Tree组件重新生成
  multiple: boolean;
  selectTypeList: any; // 可选节点列表
  loadData: (node: any, currentTab: string) => Promise<void>;
  showTabList: any;
  getTree: any;
  corpid?: string | number;
  appId?: string | number;
  visible?: boolean;
  formatData: any;
}

const SchoolContacts: React.FunctionComponent<PropType> = (props: PropType) => {
  // 获取props
  const {
    multiple,
    selectTypeList,
    loadData,
    showTabList,
    visible,
    getTree,
    formatData,
  } = props;
  // 获取treeContext
  const treeContext = useContext(TREE_CONTEXT);
  const { treeState, setTreeData, clear } = treeContext;
  const { treeData, checkedKeys } = treeState;
  const [accordion, setaccordion] = useState<any>([]);
  const accordionRef = useRef<any>([]);

  const [currentTab, setCurrentTab] = useState<any>('');
  const [activeKey, setActiveKey] = useState<any>([
    'dept',
    'group',
    'innerContacts',
    'schoolContacts',
    'tags',
  ]);
  const activeKeyRef = useRef<any>([]);
  const scrollDom = useRef<any>(null);
  const scrollRef = useRef<any>(0);

  const { breadcrumb, handleSelect, handleClickBreadcrumb } = useSelectExpand(
    loadData,
    currentTab,
    showTabList,
    accordion,
    setCurrentTab
  );
  const difference = (prearr: string[], arr: string[]) => {
    const set = new Set(arr);
    return prearr.filter((x: any) => !set.has(x));
  };

  useEffect(() => {
    Toast.loading('加载中', 0);
    getData(activeKey);
    const nextAccordion = showTabList.map((item: string) => {
      return {
        key: item,
        icon: formatIcon(item),
      };
    });
    setaccordion(nextAccordion);
    accordionRef.current = nextAccordion;
    activeKeyRef.current = activeKey;
  }, []);

  useEffect(() => {
    if (!visible) {
      setTreeData([]);
      // clear();
    }
  }, [visible]);

  const onChange = useCallback(
    (keys: string[]) => {
      if (activeKeyRef.current.length > keys.length) {
        // 收起
        setActiveKey(keys);
        activeKeyRef.current = keys;
      } else {
        const tab = difference(keys, activeKeyRef.current);
        setCurrentTab(tab[0]);
        setActiveKey(keys);
        activeKeyRef.current = keys;
      }
    },
    [activeKey]
  );

  const panelChange = useCallback(
    (key: string, users: any) => {
      const nextAccordion = accordionRef.current;
      nextAccordion.map((item: AccordionItem) => {
        if (item.key === key) {
          item.children = users;
        }
      });
      setaccordion([...(nextAccordion || {})]);
      accordionRef.current = nextAccordion || '';
    },
    [accordion, accordionRef]
  );

  const formatIcon = (key: string) => {
    // ['dept', 'group', 'innerContacts', 'schoolContacts', 'tags']
    switch (key) {
      case 'dept': // 所属部门
        return (
          <React.Fragment>
            <DeptIcon />
          </React.Fragment>
        );
        break;
      case 'group': // 下属组织
        return (
          <React.Fragment>
            <OrgIcon />
          </React.Fragment>
        );
        break;
      case 'innerContacts': // 内部通讯录
        return (
          <React.Fragment>
            <InternalIcon />
          </React.Fragment>
        );
        break;
      case 'schoolContacts': // 家校通讯录
        return (
          <React.Fragment>
            <InternalIcon />
          </React.Fragment>
        );
        break;
      case 'tags': // 标签
        return (
          <React.Fragment>
            <TagIcon />
          </React.Fragment>
        );
        break;
      default:
    }
  };

  const getData = (keys: string[]) => {
    Toast.loading('加载中', 0);
    const promiseAll = keys.map((tab) => getTree(tab));
    Promise.all(promiseAll).then((data) => {
      Toast.hide();
      for (const item of data) {
        formatData(item.data, item.currentTab, true);
        if (showTabList.indexOf(item.currentTab) > -1) {
          panelChange(item.currentTab, item.data);
        }
      }
    });
  };

  useEffect(() => {
    if (currentTab) {
      const item = accordion.find(
        (node: AccordionItem) => node.key === currentTab
      );
      if (!item.children || item.children.length === 0) {
        getData([currentTab]);
      }
    }
  }, [currentTab]);

  const setItemCheck = (arr: any[], checkedKeys: any[]) => {
    for (const item of arr) {
      if (checkedKeys.findIndex((key) => key === item.key) > -1) {
        item.checked = true;
      } else {
        if (item.children && item.children.length > 0) {
          setItemCheck(item.children, checkedKeys);
        }
        item.checked = false;
      }
    }
  };

  const findNode = (searchNode: ItreeItem) => {
    const root = treeData;
    const stack = [...root];

    while (stack.length) {
      const node = stack.pop();
      if (node.key === searchNode.key) {
        return node;
      } else {
        if (node.children) {
          for (const child of node.children) {
            stack.push(child);
          }
        }
      }
    }
    return null;
  };
  const handleScroll = (e: any) => {
    const y = e.target.scrollTop;
    if (y !== 0 && breadcrumb.length === 0) {
      scrollRef.current = y;
    }
  };
  useEffect(() => {
    scrollDom.current.addEventListener('scroll', handleScroll);
    return () => scrollDom.current.removeEventListener('scroll', handleScroll);
  });

  useEffect(() => {
    if (breadcrumb.length === 0) {
      scrollDom.current.scrollTop = scrollRef.current;
    } else {
      scrollDom.current.scrollTop = 0;
    }
  }, [breadcrumb, scrollRef]);

  const useFilter = (
    breadcrumb: any[],
    treeData: any,
    accordion: [],
    callback: (type: string) => boolean,
    checkedKeys: any[]
  ) => {
    const node = findNode(breadcrumb[breadcrumb.length - 1]);
    const list =
      treeData.length > 0 ? (node && node.children) || treeData : accordion;
    const filterList = list.filter((item: ItreeItem) => callback(item.type));
    if (filterList && filterList.length > 0) {
      setItemCheck(filterList, checkedKeys);
    }
    return filterList;
  };

  const accordionList = useMemo(() => {
    if (accordion.length > 0 && treeData.length === 0) {
      const list = accordion;
      setItemCheck(list, checkedKeys);
      return list;
    }
  }, [accordion, treeData, checkedKeys, checkedKeys.length]);

  const userList = useMemo(() => {
    if (breadcrumb.length === 0) {
      return [];
    }
    return useFilter(
      breadcrumb,
      treeData,
      accordion,
      (type: string) => type === 'USER',
      checkedKeys
    );
  }, [breadcrumb, treeData, accordion, checkedKeys, checkedKeys.length]);

  const otherList = useMemo(() => {
    if (breadcrumb.length === 0) {
      return [];
    }
    return useFilter(
      breadcrumb,
      treeData,
      accordion,
      (type: string) => type !== 'USER',
      checkedKeys
    );
  }, [breadcrumb, treeData, accordion, checkedKeys, checkedKeys.length]);

  return (
    <div className="scroll" ref={scrollDom}>
      {treeData.length === 0 && breadcrumb.length === 0 ? (
        <Accordion
          className="my-accordion"
          activeKey={activeKey}
          onChange={onChange}
        >
          {accordionList?.map((item: AccordionItem) => {

            return (
              <Accordion.Panel
                key={item.key}
                header={
                  <div className="tab-header">
                    <div className="icon">{item.icon}</div>
                    <div className="name">{TAB_MAPS[item.key]}</div>
                  </div>
                }
              >
                {item.children?.map((child: ItreeItem) => {

                  return (
                    <PannelItem
                      key={child.key}
                      accordion={accordion}
                      breadcrumb={breadcrumb}
                      selectTypeList={selectTypeList}
                      multiple={multiple}
                      currentTab={item.key}
                      handleSelect={handleSelect}
                      node={child}
                    />
                  );
                })}
              </Accordion.Panel>
            );
          })}
        </Accordion>
      ) : (
        <>
          {breadcrumb.length > 0 && (
            <Breadcrumb
              accordion={accordion}
              tabmaps={TAB_MAPS}
              breadcrumb={breadcrumb}
              handleClickBreadcrumb={handleClickBreadcrumb}
              currentTab={currentTab}
            />
          )}
          <div className="child-list">
            {treeData.length > 0 && otherList.length > 0 && (
              <div className="child-item">
                {otherList?.map((item: ItreeItem) => (
                  <PannelItem
                    accordion={accordion}
                    breadcrumb={breadcrumb}
                    key={item.key}
                    selectTypeList={selectTypeList}
                    multiple={multiple}
                    currentTab={currentTab}
                    node={item}
                    handleSelect={handleSelect}
                  />
                ))}
              </div>
            )}

            {treeData.length > 0 && userList.length > 0 && (
              <div className="child-item pannel-user">
                {userList?.map((item: ItreeItem) => (
                  <PannelItem
                    accordion={accordion}
                    breadcrumb={breadcrumb}
                    key={item.key}
                    selectTypeList={selectTypeList}
                    multiple={multiple}
                    currentTab={currentTab}
                    node={item}
                    handleSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SchoolContacts;
