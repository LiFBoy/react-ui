import React, { useState } from 'react';
import net from '../services/index';

import {
  NodeType,
  ItreeItem,
  PropTypes,
  SelectUserCountRequestItem
} from '../interface';
import treeNodeIconMap from '../components/tree-node-icon';

// 持久化的属性，设置一次之后就不会修改
type StaticProps = Pick<
  PropTypes,
  | 'selectType'
  | 'basePath'
  | 'requestParams'
  | 'multiple'
  | 'onlyLeafCheckable'
  | 'unCheckableNodeType'
>;
type ItreeState = StaticProps & {
  treeData: ItreeItem[];
  searchResult: any[];
  checkedKeys: string[];
  orgInfoList: ItreeItem[];
  deptInfoList: ItreeItem[];
  userInfoList: ItreeItem[];
  tagInfoList: ItreeItem[];
  groupInfoList: ItreeItem[];
  userCount: IuserCount;
};

interface IResult {
  code: number;
  data: {
    dataSource: ItreeItem[];
  };
  errorMsg: string | null;
  success: boolean;
}

interface IuserCount {
  orgCount: number;
  deptCount: number;
  tagCount: number;
  groupCount: number;
}

export interface ItreeContext {
  // 存储树及选中数据的state
  treeState: ItreeState;
  // 设置当前树的data方法
  // setTreeData: (treeData: ItreeItem[]) => void;
  // 设置当前选中数据的方法
  setSelectedData: (selectData: any) => void;
  // 更新树节点选中状态的方法, 返回该节点当前的选中状态
  updateCheckedNode: (node: ItreeItem, key: string) => boolean;
  // 清空当前选中数据的方法
  clear: () => void;
  // 取消指定keys选中状态的方法
  delKeys: (keys: string[], type?: NodeType) => void;
  // 设置分组人员信息
  setUserCount: (userCount: IuserCount) => void;
  // 请求重新计算用户人数
  resetUserCount: (
    item: ItreeItem,
    checked: boolean,
    isRequest?: boolean
  ) => void;
  getTreeRoot: (type: string) => void;
  getSearchResult: (params: any) => void;
  // 是否在加载
  loading: boolean;
  loadData: (item: ItreeItem, type: string) => Promise<void>;
  getUserCount: (selectCountRequestList: SelectUserCountRequestItem[]) => void;
}

const INIT_STATE: ItreeState = {
  // 存储树data
  treeData: [],
  // 存储树的搜索结果
  searchResult: [],
  // 存储当前所有选中的keys
  checkedKeys: [],
  // 选中的组织类型节点
  orgInfoList: [],
  // 选中的部门类型节点
  deptInfoList: [],
  // 选中的用户类型节点
  userInfoList: [],
  // 选中的标签类型节点
  tagInfoList: [],
  // 选中的分组类型节点
  groupInfoList: [],
  // 不同类型选中的人员数量统计
  userCount: { orgCount: 0, deptCount: 0, tagCount: 0, groupCount: 0 }
};

// 树节点控制逻辑
const useTree = (staticProps: StaticProps): ItreeContext => {
  // 树的数据
  const [treeState, setTreeState] = useState<ItreeState>({
    ...INIT_STATE,
    ...staticProps
  });
  const [loading, setLoading] = useState(false);
  // 根据类型获取选中列表
  const getListByType = (type: NodeType) => {
    switch (type) {
      case 'DEPT':
      case 'GROUP_DEPT':
        return treeState.deptInfoList;
      case 'ORG':
        return treeState.orgInfoList;
      case 'TAG':
        return treeState.tagInfoList;
      case 'USER':
        return treeState.userInfoList;
      case 'GROUP':
        return treeState.groupInfoList;
    }
  };

  // 设置treeData
  const setTreeData = (treeData: ItreeItem[]) => {
    setTreeState(treeState => {
      return {
        ...treeState,
        treeData
      };
    });
  };

  // 设置treeData
  const setSearchResult = (searchResult: any[]) => {
    setTreeState(treeState => {
      return {
        ...treeState,
        searchResult
      };
    });
  };

  // 根据dfs查找树节点，因为觉得用户操作习惯更倾向于一个节点不停的展开，所以dfs能更快的找到节点
  const findNode = (key: string) => {
    const root = treeState.treeData;
    const stack = [...root];

    while (stack.length) {
      const node = stack.pop();

      if (node.key === key) {
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

  // 根据当前 type 获取树的根节点
  const getTreeRoot = (type: string) => {
    const { basePath, requestParams, selectType } = treeState;
    setLoading(true);
    net
      .request(`/${basePath}/selectCompents/${type}`, {
        method: 'POST',
        data: {
          nodeType: null,
          orgId: null,
          parentId: null,
          ...requestParams,
          selectUser: selectType === 'user' ? true : false
        }
      })
      .then((result: IResult) => {
        setLoading(false);
        formatData(result.data.dataSource, type, true);
        if (result.success) {
          setTreeData(result.data.dataSource);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const formatData = (
    // 结合业务需求格式化树节点数据
    list: ItreeItem[], // 待格式化的树节点列表
    type: string, // 当前的树所属的类型
    isRoot?: boolean // 是否是根节点
  ) => {
    const { onlyLeafCheckable, unCheckableNodeType, selectType } = treeState;
    for (const item of list) {
      item.name = item.label;

      let NodeIcon = treeNodeIconMap[item.type];
      let label = item.name;
      if (item.type === 'TAG') {
        // 标签需要展示标签下的人数
        label = `${item.name} ${item.isLeaf ? '(' + (item.count || 0) + ')' : ''
        }`;
      }

      // 特殊处理内部通讯录根节点
      if (isRoot && type === 'innerContacts') {
        // 内部通讯录的跟节点不允许被选择
        item.checkable = false;
        // 强制使用部门的 icon
        NodeIcon = treeNodeIconMap.dept;
      }

      item.label = (
        <>
          <NodeIcon />
          <div className="cf-select-user-node-wrapper" title={item.name}>
            <span className="cf-select-user-tree-node">{label}</span>
          </div>
        </>
      );

      // 家校通迅录和内部通迅录的特殊逻辑
      if (['innerContacts', 'schoolContacts'].includes(type)) {
        if (
          item.type === 'DEPT' && // 如果节点类型为DEPT
          selectType === 'user' // 且当前组件 selectType 为 user
        ) {
          item.isLeaf = false; // 则 DEPT 节点一律视为非叶子结点 (实际场景中DEPT 节点下一定有子节点)
        } else if (
          selectType === 'dept' &&
          onlyLeafCheckable &&
          item.isLeaf === false
        ) {
          // 如果当前组件 selectType 为 dept
          // 设置仅叶子节点可选
          item.checkable = false;
        }
      }

      // 如果配置了不可选节点类型，且当前节点类型在不可选类型中，则节点不可选
      if (unCheckableNodeType.indexOf(item.type) !== -1) {
        item.checkable = false;
      }

      // 标签的非叶子节点不可选
      if (item.type === 'TAG' && item.isLeaf === false) {
        item.checkable = false;
      }

      // 如果只有叶子节点可选，且当前 selectType 为 user，则非 USER 节点一律不可选
      if (onlyLeafCheckable && selectType === 'user' && item.type !== 'USER') {
        item.checkable = false;
      }

      if (item.children) {
        formatData(item.children, type);
      }
    }
  };

  // 动态获取子节点列表
  const loadData = (item: ItreeItem, type: string) => {
    const { treeData } = treeState;

    return new Promise<void>(resolve => {
      const { basePath, requestParams, selectType } = treeState;
      const treeNode = findNode(item.key);

      if (!treeNode || treeNode.children) {
        return;
      }

      // tslint:disable-next-line: no-floating-promises
      net
        .request(`/${basePath}/selectCompents/${type}`, {
          method: 'POST',
          data: {
            nodeType: item.nodeType,
            orgId: item.orgId,
            parentId: item.key,
            ...requestParams,
            // 只有GROUP_DEPT / DEPT类型的节点下才有人的信息
            selectUser:
              selectType === 'user' &&
                (item.type === 'GROUP_DEPT' || item.type === 'DEPT')
                ? true
                : false
          }
        })
        .then((result: any) => {
          if (result.success) {
            treeNode.children = result.data.dataSource;
            formatData(result.data.dataSource, type);
            // setTreeData(result.data.dataSource);
            resolve();
            setTreeData(treeData);
          }
        });
    });
  };

  // 获取用户人数
  const getUserCount = (selectCountRequestList: any) => {
    const { basePath, requestParams } = treeState;
    // tslint:disable-next-line: no-floating-promises
    net
      .request(`/${basePath}/selectCompents/getUserCount`, {
        method: 'POST',
        data: {
          corpId: requestParams.corpId,
          selectCountRequestList
        }
      })
      .then(res => {
        const data = res.data.dataSource;
        const count = {
          orgCount: 0,
          deptCount: 0,
          tagCount: 0,
          groupCount: 0
        };

        for (const item of data) {
          switch (item.type) {
            case 'DEPT':
              count.deptCount = item.userCount;
              break;
            case 'ORG':
              count.orgCount = item.userCount;
              break;
            case 'GROUP':
              count.groupCount = item.userCount;
              break;
            case 'TAG':
              count.tagCount = item.userCount;
              break;
          }
        }
        setUserCount(count);
      });
  };

  // 用于设置各个infoList中的数据
  const setSelectedData = (selectData: any) => {
    setTreeState(treeState => {
      return {
        ...treeState,
        ...selectData
      };
    });
  };

  // 请求获取搜索结果
  const getSearchResult = (params: any) => {
    const { basePath } = treeState;
    setLoading(true);
    // tslint:disable-next-line: no-floating-promises
    net
      .request(`/${basePath}/selectCompents/search`, {
        method: 'POST',
        data: params
      })
      .then(res => {
        setLoading(false);
        const data = res.data.dataSource;
        setSearchResult(data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  // 更新选中节点
  const updateCheckedNode = (node: ItreeItem, key: string) => {
    const { checkedKeys } = treeState;
    const keyIndex = checkedKeys.indexOf(key);

    // 更新node节点选中状态
    const updateNode = (node: ItreeItem): boolean => {
      const list = getListByType(node.type);
      const nodeIndex = list.findIndex((item: ItreeItem) => {
        return item.id === node.key;
      });

      // 如果节点未选中则选中
      if (nodeIndex === -1) {
        list.push({ ...node });
        return true;
      } else {
        // 否则取消选中
        list.splice(nodeIndex, 1);
        return false;
      }
    };

    let result = false;

    // 如果key不在被选中的数组中，则添加
    if (keyIndex === -1) {
      checkedKeys.push(key);
      result = updateNode(node);
    } else {
      checkedKeys.splice(keyIndex, 1);
      result = updateNode(node);
    }

    setTreeState({ ...treeState });
    return result;
  };

  // 从部门列表中删除指定key
  const delFromDeptList = (key: string) => {
    const { deptInfoList } = treeState;
    const deptIndex = deptInfoList.findIndex(item => {
      return item.id === key;
    });

    if (deptIndex !== -1) {
      deptInfoList.splice(deptIndex, 1);
      return true;
    } else {
      return false;
    }
  };

  // 从组织列表中删除指定key
  const delFromOrgList = (key: string) => {
    const { orgInfoList } = treeState;
    const deptIndex = orgInfoList.findIndex(item => {
      return item.id === key;
    });

    if (deptIndex !== -1) {
      orgInfoList.splice(deptIndex, 1);
      return true;
    } else {
      return false;
    }
  };

  // 从用户列表中删除指定key
  const delFromUserList = (key: string) => {
    const { userInfoList } = treeState;
    const deptIndex = userInfoList.findIndex(item => {
      return item.id === key;
    });

    if (deptIndex !== -1) {
      userInfoList.splice(deptIndex, 1);
      return true;
    } else {
      return false;
    }
  };

  // 从用户列表中删除指定key
  const delFromTagList = (key: string) => {
    const { tagInfoList } = treeState;
    const deptIndex = tagInfoList.findIndex(item => {
      return item.id === key;
    });

    if (deptIndex !== -1) {
      tagInfoList.splice(deptIndex, 1);
      return true;
    } else {
      return false;
    }
  };

  // 从用户列表中删除指定key
  const delFromGroupList = (key: string) => {
    const { groupInfoList } = treeState;
    const deptIndex = groupInfoList.findIndex(item => {
      return item.id === key;
    });

    if (deptIndex !== -1) {
      groupInfoList.splice(deptIndex, 1);
      return true;
    } else {
      return false;
    }
  };

  /**
   * 取消传入的keys的选中状态
   * @param keys 要取消选中的keys
   * @param type 根据type直接从对应的list中删除，未传则去部门，组织，人员，标签，分组列表中遍历删除
   */
  const delKeys = (keys: string[], type?: NodeType) => {
    const checkedKeys = treeState.checkedKeys;

    for (const key of keys) {
      const keyIndex = checkedKeys.indexOf(key);
      keyIndex !== -1 ? checkedKeys.splice(keyIndex, 1) : '';

      // 如果传入了type，则直接从type对应的list中删除
      if (type) {
        const list = getListByType(type);
        const keyIndex = list.findIndex(item => {
          return item.id === key;
        });

        if (keyIndex !== -1) {
          list.splice(keyIndex, 1);
        }
      } else {
        // 没传type就只能一个一个找着删了
        !delFromDeptList(key) &&
          !delFromOrgList(key) &&
          !delFromUserList(key) &&
          !delFromTagList(key) &&
          !delFromGroupList(key);
      }
    }
    setTreeState({ ...treeState });
  };

  // 清除所有所选项
  const clear = () => {
    treeState.checkedKeys = [];
    // treeState.checkedKeys.length = 0;
    treeState.deptInfoList = [];
    treeState.orgInfoList = [];
    treeState.userInfoList = [];
    treeState.tagInfoList = [];
    treeState.groupInfoList = [];
    treeState.userCount = {
      orgCount: 0,
      deptCount: 0,
      tagCount: 0,
      groupCount: 0
    };

    setTreeState({
      ...treeState
    });
  };

  // 设置人员数量
  const setUserCount = (userCount: any) => {
    setTreeState(treeState => {
      return {
        ...treeState,
        userCount
      };
    });
  };

  /**
   * 请求后重新计算用户人数
   * @param item 操作的节点
   * @param checked 节点被选中还是删除判断
   * @param isRequest 是否需要请求获取人数
   */
  const resetUserCount = (
    item: ItreeItem,
    checked: boolean,
    isRequest = true
  ) => {
    const { userCount, basePath, requestParams } = treeState;

    const selectCountRequestList: any = [];

    const selectNodeList = [{ contactType: item.contactType, id: item.id }];

    selectCountRequestList.push({ selectNodeList, type: item.type });

    // 如果需要请求获取人数，则请求
    if (isRequest) {
      // tslint:disable-next-line: no-floating-promises
      net
        .request(`/${basePath}/selectCompents/getUserCount`, {
          method: 'POST',
          data: {
            corpId: requestParams.corpId,
            selectCountRequestList
          }
        })
        .then(res => {
          const data = res.data.dataSource;

          for (const item of data) {
            switch (item.type) {
              case 'DEPT':
                userCount.deptCount = checked
                  ? userCount.deptCount + item.userCount
                  : userCount.deptCount - item.userCount;
                break;
              case 'ORG':
                userCount.orgCount = checked
                  ? userCount.orgCount + item.userCount
                  : userCount.orgCount - item.userCount;
                break;
              case 'TAG':
                userCount.tagCount = checked
                  ? userCount.tagCount + item.userCount
                  : userCount.tagCount - item.userCount;
                break;
              case 'GROUP':
                userCount.groupCount = checked
                  ? userCount.groupCount + item.userCount
                  : userCount.groupCount - item.userCount;
                break;
            }
          }
          setUserCount(userCount);
        });
    } else {
      switch (item.type) {
        case 'DEPT':
          userCount.deptCount = checked
            ? userCount.deptCount + 1
            : userCount.deptCount - 1;
          break;
        case 'ORG':
          userCount.orgCount = checked
            ? userCount.orgCount + 1
            : userCount.orgCount - 1;
          break;
        case 'TAG':
          userCount.tagCount = checked
            ? userCount.tagCount + 1
            : userCount.tagCount - 1;
          break;
        case 'GROUP':
          userCount.groupCount = checked
            ? userCount.groupCount + 1
            : userCount.groupCount - 1;
          break;
        default:
          break;
      }

      setUserCount(userCount);
    }
  };

  return {
    loading,
    treeState,
    setSelectedData,
    updateCheckedNode,
    delKeys,
    clear,
    setUserCount,
    resetUserCount,
    getTreeRoot,
    getSearchResult,
    loadData,
    getUserCount
  };
};

export default useTree;
