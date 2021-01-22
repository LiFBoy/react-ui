import React, {
  useCallback,
  useState,
  useEffect,
  useContext,
  useRef,
} from 'react';
import SelectUserTab from './components/pc/select-user-tab';
import SearchResult from './components/pc/search-result';
import RightPane from './components/pc/right-pane';
import SelectArea from './components/pc/select-area';
import { IlistItem, ItreeItem, SelectUserCountRequestItem } from './interface';
import net from './services/index';
import SelectedPane from './components/pc/selected-pane';
import {
  TagIcon,
  UserIcon,
  GroupIcon,
  DeptIcon,
  OrgIcon,
} from './components/tree-node-icon';

import { Modal, Input, Spin } from 'antd';
import { TREE_CONTEXT } from './select-user';
import { IsaveResultParams, PropTypes, IdefaultValue } from './interface';
import { TabTypes } from './components/pc/select-user-tab/interface';

interface IResult {
  code: number;
  data: {
    dataSource: ItreeItem[];
  };
  errorMsg: string | null;
  success: boolean;
}

const SelectUserPc: React.FunctionComponent<PropTypes> = ({
  defaultValue,
  selectPaneProps = {},
  dialogProps = {},
  visible = false,
  multiple = true,
  onOk,
  onCancel,
  getCheckedNodes,
  getTotalCount,
  basePath = 'pc',
  selectSignature = '',
  isSaveSelectSignature = true,
  requestParams = {
    campusType: 'base_school_type',
    selectTypeList: ['user', 'dept', 'org', 'group', 'tag'],
  },
  showTabList = ['dept', 'group', 'innerContacts', 'schoolContacts', 'tags'],
  selectType = 'user',
  unCheckableNodeType = [],
  searchPlaceholder = '搜索姓名、部门名称、手机号',
  onlyLeafCheckable = false,
}) => {
  const { Search } = Input;
  const [tab, setTab] = useState<TabTypes | ''>('');
  const [loading, setLoading] = useState<boolean>(false);
  // 获取treeContext
  const treeContext = useContext(TREE_CONTEXT);
  const {
    treeState,
    setTreeData,
    setSelectedData,
    setUserCount,
    setRequest,
    clear,
  } = treeContext;

  const [searchValue, setSearchValue] = useState<string>('');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [searchTab, setSearchTab] = useState<string>('all');

  // 当tab切换时重新获取树
  useEffect(() => {
    if (tab) {
      getTree();
    }
  }, [tab]);

  useEffect(() => {
    if (!searchValue) {
      // 如果搜索字段被清空，tab默认恢复选择到all
      setSearchTab('all');
    }
  }, [searchValue]);

  // 当showtabList变更时
  useEffect(() => {
    if (showTabList && showTabList.length > 0) {
      setTab(showTabList[0]);
    } else {
      setTab('dept');
    }
  }, []);

  useEffect(() => {
    setRequest({
      basePath,
      requestParams,
    });
  }, []);

  useEffect(() => {
    clear();
  }, [visible]);

  useEffect(() => {
    /**
     * 对defaultValue或者请求获取的数据源进行处理
     * @param data
     */
    function resolveData(data: IdefaultValue) {
      const {
        deptInfoList = [],
        orgInfoList = [],
        userInfoList = [],
        tagInfoList = [],
        groupInfoList = [],
      } = data;
      const checkedKeys: string[] = [];

      let selectCountRequestList: SelectUserCountRequestItem[] = [];

      // 存储所有部门id
      const deptObject: SelectUserCountRequestItem = {
        selectNodeList: [],
        type: 'DEPT',
      };
      for (const item of deptInfoList) {
        // 如果传入的数据中没有type属性，则在初始化时需要设置item的type
        if (!item.type) item.type = 'DEPT';

        deptObject.selectNodeList.push({
          contactType: item.contactType,
          id: item.id,
        });
      }

      // 存储所有组织id
      const orgObject: SelectUserCountRequestItem = {
        selectNodeList: [],
        type: 'ORG',
      };
      for (const item of orgInfoList) {
        // 如果传入的数据中没有type属性，则在初始化时需要设置item的type
        if (!item.type) item.type = 'ORG';

        orgObject.selectNodeList.push({
          contactType: item.contactType,
          id: item.id,
        });
      }

      // 存储所有标签id
      const tagObject: SelectUserCountRequestItem = {
        selectNodeList: [],
        type: 'TAG',
      };
      for (const item of tagInfoList) {
        // 如果传入的数据中没有type属性，则在初始化时需要设置item的type
        if (!item.type) item.type = 'TAG';

        tagObject.selectNodeList.push({
          contactType: item.contactType,
          id: item.id,
        });
      }

      // 存储所有分组id
      const groupObject: SelectUserCountRequestItem = {
        selectNodeList: [],
        type: 'GROUP',
      };
      for (const item of groupInfoList) {
        // 如果传入的数据中没有type属性，则在初始化时需要设置item的type
        if (!item.type) item.type = 'GROUP';

        groupObject.selectNodeList.push({
          contactType: item.contactType,
          id: item.id,
        });
      }

      selectCountRequestList = [deptObject, orgObject, tagObject, groupObject];

      const { selectTypeList } = requestParams;

      // 如果需要请求获取已选人数
      if (selectTypeList && selectTypeList.length === 1) {
        const count = {
          orgCount: orgObject.selectNodeList.length,
          deptCount: deptObject.selectNodeList.length,
          tagCount: tagObject.selectNodeList.length,
          groupCount: groupObject.selectNodeList.length,
        };
        setUserCount(count);
      } else {
        // 获取已选用户总人数
        getUserCount(selectCountRequestList, userInfoList);
      }

      /**
       * @param list
       */
      const generateKey = (list: IlistItem[]) => {
        list.forEach((item: IlistItem) => {
          checkedKeys.push(item.id);
        });
      };

      generateKey(deptInfoList);
      generateKey(orgInfoList);
      generateKey(userInfoList);
      generateKey(tagInfoList);
      generateKey(groupInfoList);

      // 更新
      setSelectedData({
        deptInfoList,
        orgInfoList,
        userInfoList,
        tagInfoList,
        groupInfoList,
        checkedKeys,
      });
    }

    // 如果传入了默认值
    if (defaultValue) {
      // 处理默认值
      resolveData(defaultValue);
    }

    if (selectSignature) {
      // 拉取数据并更新treeState中的已选数据
      // tslint:disable-next-line: no-floating-promises
      net
        .request(`/${basePath}/selectCompents/getResult`, {
          method: 'POST',
          data: {
            selectSignature,
            ...requestParams,
          },
        })
        .then((result: any) => {
          // 处理响应数据
          resolveData(result.data);

          if (typeof getCheckedNodes === 'function') {
            getCheckedNodes(result.data);
          }
        });
    }
  }, [selectSignature]);

  // 获取树节点
  const getTree = () => {
    setLoading(true);
    net
      .request(`/${basePath}/selectCompents/${tab}`, {
        method: 'POST',
        data: {
          nodeType: null,
          orgId: null,
          parentId: null,
          ...requestParams,
          selectUser: selectType === 'user' ? true : false,
        },
      })
      .then((result: IResult) => {
        setLoading(false);
        if (result.success) {
          formatData(result.data.dataSource, true);
          setTreeData(result.data.dataSource);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  // 获取用户人数
  const getUserCount = (selectCountRequestList: any, userInfoList: any) => {
    // tslint:disable-next-line: no-floating-promises
    net
      .request(`/${basePath}/selectCompents/getUserCount`, {
        method: 'POST',
        data: {
          corpId: requestParams.corpId,
          selectCountRequestList,
        },
      })
      .then((res) => {
        const data = res.data.dataSource;
        const count = {
          orgCount: 0,
          deptCount: 0,
          tagCount: 0,
          groupCount: 0,
          userCount: 0,
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

        if (typeof getTotalCount === 'function') {
          let totalCount = userInfoList?.length || 0; // 已选总数
          for (const key in data) {
            totalCount += data[key].userCount || 0;
          }
          count.userCount = userInfoList?.length || 0;
          getTotalCount({ totalCount, count });
        }
      });
  };

  /**
   * 处理返回数据
   * @param {数据列表} list
   * @param {是否为根节点} isRoot
   */
  const formatData = (list: ItreeItem[], isRoot?: boolean) => {
    for (const item of list) {
      item.name = item.label;

      // 根据类型生成带icon的label
      switch (item.type) {
        case 'TAG': // 标签需要展示标签下的人数
          item.label = (
            <React.Fragment>
              <TagIcon />
              <span className="cf-select-user-tree-node">{`${item.name} ${
                item.isLeaf ? '(' + (item.count || 0) + ')' : ''
              }`}</span>
            </React.Fragment>
          );
          break;
        case 'USER':
          item.label = (
            <React.Fragment>
              <UserIcon />
              <div className="cf-select-user-node-wrapper" title={item.name}>
                <span className="cf-select-user-tree-node">{item.name}</span>
              </div>
            </React.Fragment>
          );
          break;
        case 'GROUP':
          item.label = (
            <React.Fragment>
              <GroupIcon />
              <div className="cf-select-user-node-wrapper" title={item.name}>
                <span className="cf-select-user-tree-node">{item.name}</span>
              </div>
            </React.Fragment>
          );
          break;
        case 'DEPT':
          item.label = (
            <React.Fragment>
              <DeptIcon />
              <div className="cf-select-user-node-wrapper" title={item.name}>
                <span className="cf-select-user-tree-node">{item.name}</span>
              </div>
            </React.Fragment>
          );
          break;
        case 'ORG':
          item.label = (
            <React.Fragment>
              <OrgIcon />
              <div className="cf-select-user-node-wrapper" title={item.name}>
                <span className="cf-select-user-tree-node">{item.name}</span>
              </div>
            </React.Fragment>
          );
          break;
      }

      // 如果获取的是根节点,且是内部通讯录
      if (isRoot && tab === 'innerContacts') {
        item.checkable = false; // 内部通讯录的跟节点不允许被选择
        // 内部通讯录根节点的 icon 强制使用部门的
        item.label = (
          <React.Fragment>
            <DeptIcon />
            <div className="cf-select-user-node-wrapper" title={item.name}>
              <span className="cf-select-user-tree-node">{item.name}</span>
            </div>
          </React.Fragment>
        );
      }

      if (
        (tab === 'innerContacts' || tab === 'schoolContacts') && // 在家校通迅录和内部通迅录
        item.type === 'DEPT' && // 如果节点类型为DEPT
        selectType === 'user'
      ) {
        // 且当前组件selectType为user
        item.isLeaf = false; // 则DEPT节点一律视为非叶子结点 (实际场景中DEPT节点下一定有子节点)
      } else if (
        (tab === 'innerContacts' || tab === 'schoolContacts') &&
        selectType === 'dept'
      ) {
        // 如果当前组件selectType为dept
        // 如果仅叶子节点可选
        if (onlyLeafCheckable && item.isLeaf === false) {
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

      // 如果只有叶子节点可选，且当前selectType为user，则非USER节点一律不可选
      if (onlyLeafCheckable && selectType === 'user' && item.type !== 'USER') {
        item.checkable = false;
      }

      if (item.children) {
        formatData(item.children);
      }
    }
  };

  // 处理关闭
  const handleCancel = () => {
    onCancel();
  };

  const handleOk = useCallback(() => {
    /**
     * 保存快照参数格式化，主要是为了把之前组装的key还原
     * @param list 存储在treeState中的各种list
     */
    const formatParam = (list: IlistItem[]) => {
      const finalList: any[] = [];
      for (const item of list) {
        const obj: any = {};

        obj.id = item.id;
        obj.name = item.name;

        if (item.orgId) {
          obj.orgId = item.orgId;
        }

        if (item.orgName) {
          obj.orgName = item.orgName;
        }

        if (item.contactType) {
          obj.contactType = item.contactType;
        }

        finalList.push(obj);
      }
      return finalList;
    };

    const {
      deptInfoList,
      orgInfoList,
      userInfoList,
      groupInfoList,
      tagInfoList,
      userCount,
    } = treeState;

    let totalCount = userInfoList?.length || 0; // 已选总数
    for (const key in userCount) {
      totalCount += userCount[key] || 0;
    }

    // 保存参数
    const params: IsaveResultParams = {
      deptInfoList: formatParam(deptInfoList),
      orgInfoList: formatParam(orgInfoList),
      userInfoList: formatParam(userInfoList),
      groupInfoList: formatParam(groupInfoList),
      tagInfoList: formatParam(tagInfoList),
      id: null,
      totalCount,
      strictUser: requestParams.strictUser,
    };

    // 如果不需要保存快照，则直接返回结果
    if (!isSaveSelectSignature) {
      onOk({
        deptInfoList: params.deptInfoList,
        userInfoList: params.userInfoList,
        tagInfoList: params.tagInfoList,
        orgInfoList: params.orgInfoList,
        groupInfoList: params.groupInfoList,
        totalCount: params.totalCount,
      });
      return;
    }

    // 如果有selectSignature字端，则是更新，把原来的selectSignature作为id传回服务端
    if (selectSignature) {
      params.id = selectSignature;
    }

    // tslint:disable-next-line: no-floating-promises
    net
      .request(`/${basePath}/selectCompents/saveResult`, {
        method: 'POST',
        data: params,
      })
      .then((result) => {
        onOk({
          selectSignature: result.data,
          deptInfoList: params.deptInfoList,
          userInfoList: params.userInfoList,
          tagInfoList: params.tagInfoList,
          orgInfoList: params.orgInfoList,
          groupInfoList: params.groupInfoList,
          totalCount: params.totalCount,
        });
      });
  }, [onOk, treeState]);

  // 选择tab切换
  const onTabChange = (selectTab: TabTypes) => {
    setTab(selectTab);
  };

  // const timer = useRef(null);
  // 搜索改变
  // const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = event.target.value;
  //   setSearchValue(value);

  //   timer.current && clearTimeout(timer.current);

  //   // 如果value为空则不搜索
  //   if (!value) {
  //     return;
  //   }

  //   // debounce
  //   timer.current = setTimeout(() => {
  //     const params = {
  //       search: value,
  //       types: searchTab === 'all' ? showTabList : [searchTab],
  //       ...requestParams
  //     };
  //     getSearchResult(params);
  //   }, 500);
  // };

  // 当搜索的tab改变
  const onSearchTabChange = (nextTab: string) => {
    setSearchTab(nextTab);

    const params = {
      search: searchValue,
      types: nextTab === 'all' ? showTabList : [nextTab],
      ...requestParams,
    };
    getSearchResult(params);
  };

  // 请求获取搜索结果
  const getSearchResult = (params: any) => {
    setLoading(true);
    // tslint:disable-next-line: no-floating-promises
    net
      .request(`/${basePath}/selectCompents/search`, {
        method: 'POST',
        data: params,
      })
      .then((res) => {
        setLoading(false);
        const data = res.data.dataSource;
        setSearchResult(data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  // 根据dfs查找树节点，因为觉得用户操作习惯更倾向于一个节点不停的展开，所以dfs能更快的找到节点
  const findNode = (searchNode: ItreeItem) => {
    const root = treeState.treeData;
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

  // 动态加载树节点
  const loadData = (node: any) => {
    const { treeData } = treeState;

    const nodeProps = node.props;

    const item: ItreeItem = {
      id: nodeProps._key,
      label: nodeProps.label,
      name: nodeProps.name,
      key: nodeProps._key,
      type: nodeProps.type,
      nodeType: nodeProps.nodeType,
      orgId: nodeProps.orgId,
      contactType: nodeProps.contactType,
    };

    return new Promise<void>((resolve) => {
      const treeNode = findNode(item);

      if (!treeNode || treeNode.children) {
        resolve();
        return;
      }

      // tslint:disable-next-line: no-floating-promises
      net
        .request(`/${basePath}/selectCompents/${tab}`, {
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
                : false,
          },
        })
        .then((result: any) => {
          if (result.success) {
            treeNode.children = result.data.dataSource;
            formatData(result.data.dataSource);
            setTreeData(result.data.dataSource);
            resolve();
            setTreeData(treeData);
          }
        });
    });
  };

  return (
    <Modal
      {...dialogProps}
      wrapClassName="select-user-pc-modal select-user-v4-common-style"
      destroyOnClose
      // closable={false}
      maskClosable={false}
      bodyStyle={{ padding: 0 }}
      visible={visible}
      onOk={handleOk}
      width="640px"
      onCancel={handleCancel}
    >
      <div className="select-user-pc-content">
        <div className="left-pane">
          <div className="select-user-pc-search-wrapper">
            <Search
              allowClear
              className="select-user-pc-search"
              onSearch={(value) => {
                // 搜索图标点击事件
                const params = {
                  search: value,
                  types: searchTab === 'all' ? showTabList : [searchTab],
                  ...requestParams,
                };
                getSearchResult(params);
                setSearchValue(value);
              }}
              // onChange={onSearchChange}    // 这里暂时取消onChange时搜索,以后有机会再用上吧
              placeholder={showTabList.length > 1 ? '搜索' : searchPlaceholder}
            />
          </div>
          {searchValue ? (
            <SearchResult
              selectTypeList={requestParams.selectTypeList}
              search={searchValue}
              searchResult={searchResult}
              selectType={selectType}
              onSearchTabChange={onSearchTabChange}
              showTabList={showTabList}
              multiple={multiple}
            />
          ) : (
            <React.Fragment>
              <SelectUserTab
                activeKey={tab}
                onTabChange={onTabChange}
                showTabList={showTabList}
              />
              <SelectArea
                selectTypeList={requestParams.selectTypeList}
                loadData={loadData}
                currentTab={tab}
                multiple={multiple}
              />
            </React.Fragment>
          )}
          <Spin
            spinning={loading}
            tip="正在加载"
            delay={200}
            className="cf-select-user-spin"
          />
        </div>
        <RightPane>
          <SelectedPane
            selectTypeList={requestParams.selectTypeList}
            showUserDeptName={requestParams.strictUser}
            selectPaneProps={selectPaneProps}
          />
        </RightPane>
      </div>
    </Modal>
  );
};

export default SelectUserPc;
