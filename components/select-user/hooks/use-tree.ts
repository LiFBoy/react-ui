import { useState } from 'react';
import { stringify } from 'qs';
import { NodeType, ItreeItem } from '../interface';
import net from '../services/index';

interface ItreeState {
  treeData: ItreeItem[];
  checkedKeys: string[];
  orgInfoList: ItreeItem[];
  deptInfoList: ItreeItem[];
  userInfoList: ItreeItem[];
  tagInfoList: ItreeItem[];
  groupInfoList: ItreeItem[];
  userCount: IuserCount;
  basePath: 'pc' | 'mobile';
  corpidAppId: {
    corpid?: string;
    appId?: string;
  };
  requestParams: {
    // 企业微信 id，移动端鉴权用
    corpId?: string;
    // 基础校区还是自定义校区
    campusType: 'base_school_type' | 'custom_school_type';
  };
}

interface IuserCount {
  orgCount: number;
  deptCount: number;
  tagCount: number;
  groupCount: number;
  [key: string]: any;
}

export interface ItreeContext {
  // 存储树及选中数据的state
  treeState: ItreeState;
  // 设置当前树的data方法
  setTreeData: (treeData: ItreeItem[]) => void;
  // 设置bath
  setBasePath: (basePath: string) => void;
  setCorpidAppId: (corpidAppId: any) => void;
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
  // 设置请求相关
  setRequest: (requets: any) => void;
}

const INIT_STATE: ItreeState = {
  // 存储树data
  treeData: [],
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
  userCount: { orgCount: 0, deptCount: 0, tagCount: 0, groupCount: 0 },
  // 请求基本路径
  basePath: 'pc',
  corpidAppId: {
    appId: '',
    corpid: '',
  },
  // 请求附加参数
  requestParams: { campusType: 'base_school_type' },
};

// 树节点控制逻辑
const useTree = (): ItreeContext => {
  const [treeState, setTreeState] = useState<ItreeState>(INIT_STATE);

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
      default:
    }
  };

  // 设置treeData
  const setTreeData = (treeData: ItreeItem[]) => {
    setTreeState((treeState) => {
      return {
        ...treeState,
        treeData,
      };
    });
  };

  // 用于设置各个infoList中的数据
  const setSelectedData = (selectData: any) => {
    setTreeState((treeState) => {
      return {
        ...treeState,
        ...selectData,
      };
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
    const deptIndex = deptInfoList.findIndex((item) => {
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
    const deptIndex = orgInfoList.findIndex((item) => {
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
    const deptIndex = userInfoList.findIndex((item) => {
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
    const deptIndex = tagInfoList.findIndex((item) => {
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
    const deptIndex = groupInfoList.findIndex((item) => {
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
        const keyIndex = list.findIndex((item) => {
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
      groupCount: 0,
    };

    setTreeState({
      ...treeState,
    });
  };

  // 设置人员数量
  const setUserCount = (userCount: any) => {
    setTreeState((treeState) => {
      return {
        ...treeState,
        userCount,
      };
    });
  };
  // 设置path
  const setBasePath = (basePath: any) => {
    setTreeState((treeState) => {
      return {
        ...treeState,
        basePath,
      };
    });
  };

  const setCorpidAppId = (corpidAppId: any) => {
    setTreeState((treeState) => {
      return {
        ...treeState,
        corpidAppId,
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
      const others = basePath === 'pc' ? {} : treeState.corpidAppId;
      // tslint:disable-next-line: no-floating-promises

      net
        .request(`/${basePath}/selectCompents/getUserCount?${stringify(others)}`, {
          method: 'POST',
          data: {
            corpId: requestParams.corpId,
            selectCountRequestList,
          },
        })
        .then((res) => {
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
              default:
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

  const setRequest = (request: any) => {
    setTreeState((treeState) => {
      return {
        ...treeState,
        ...request,
      };
    });
  };

  return {
    treeState,
    setTreeData,
    setBasePath,
    setCorpidAppId,
    setSelectedData,
    updateCheckedNode,
    delKeys,
    clear,
    setUserCount,
    resetUserCount,
    setRequest,
  };
};

export default useTree;
