import React, { useState, useCallback, useContext, useEffect } from 'react';
import SelectPannel from './components/mobile/select-pannel';
import SelectSearchResult from './components/mobile/select-search-result';
import SelectFooter from './components/mobile/select-footer';
// @ts-ignore
import TitleBar from 'nbugs-mobile-title-bar';

import './index.less';
import { Modal, SearchBar, Toast } from 'antd-mobile';
import net from './services/index';
import SelectedPane from './components/mobile/selected-pane';
import { IlistItem, SelectUserCountRequestItem } from './interface';
import { IsaveResultParams, PropTypes, IdefaultValue } from './interface';
import { TREE_CONTEXT } from './select-user';
import classnames from 'classnames';

const SelectUserMobile: React.FunctionComponent<PropTypes> = ({
  defaultValue,
  dialogProps = {},
  visible = false,
  multiple = true,
  onOk,
  onCancel,
  getCheckedNodes,
  getTotalCount,
  basePath = 'mobile',
  selectSignature = '',
  isSaveSelectSignature = true,
  requestParams = { campusType: 'base_school_type' },
  showTabList = ['dept', 'group', 'innerContacts', 'schoolContacts', 'tags'],
  selectType = 'user',
  unCheckableNodeType = [],
  searchPlaceholder = '搜索姓名、部门名称、手机号',
  onlyLeafCheckable = false,
  ...others
}) => {
  // const [loading, setLoading] = useState<boolean>(false);
  const [hoverSearch, setHoverSearch] = useState<boolean>(false);

  // 当前的搜索字段
  const [searchValue, setSearchValue] = useState<string>('');
  // 当前的搜索结果
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [searchTab, setSearchTab] = useState<string>('all');

  const [modal1, setModal] = useState<boolean>(false);

  // 获取treeContext
  const treeContext = useContext(TREE_CONTEXT);

  const {
    treeState,
    setBasePath,
    setCorpidAppId,
    setSelectedData,
    setUserCount,
    clear
  } = treeContext;
  // const {
  //   deptInfoList,
  //   orgInfoList,
  //   userInfoList,
  //   groupInfoList,
  //   tagInfoList
  // } = treeState;

  // 当搜索的tab改变
  const onSearchTabChange = (nextTab: any) => {
    const { key } = nextTab;
    setSearchTab(key);
    const params = {
      search: searchValue,
      types: key === 'all' ? showTabList : [key],
      ...requestParams,
    };
    getSearchResult(params);
  };

  useEffect(() => {
    clear();
    setBasePath(basePath);
    setCorpidAppId({ appId: others.appId, corpid: others.corpid });
  }, []);


  useEffect(() => {
    /**
     * 对defaultValue或者请求获取的数据源进行处理
     * @param data
     */
    // if (!visible) return;
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
        .request(
          `/${basePath}/selectCompents/getResult?corpid=${others.corpid}&appId=${others.appId}`,
          {
            method: 'POST',
            data: {
              selectSignature,
            },
          }
        )
        .then((result: any) => {
          // 处理响应数据
          resolveData(result.data);
          if (typeof getCheckedNodes === 'function') {
            getCheckedNodes({
              ...result.data,
              selectSignature: result.data.id,
            });
          }
        });
    }
  }, [selectSignature, visible]);

  // 获取用户人数
  const getUserCount = (selectCountRequestList: any, userInfoList: any) => {
    // tslint:disable-next-line: no-floating-promises
    net
      .request(
        `/${basePath}/selectCompents/getUserCount?corpid=${others.corpid}&appId=${others.appId}`,
        {
          method: 'POST',
          data: {
            corpId: requestParams.corpId,
            selectCountRequestList,
          },
        }
      )
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
            default:
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
    userCount.userCount = userInfoList?.length || 0;

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
        count: userCount,
      });
      return;
    }

    // 如果有selectSignature字端，则是更新，把原来的selectSignature作为id传回服务端
    if (selectSignature) {
      params.id = selectSignature;
    }

    // tslint:disable-next-line: no-floating-promises
    net
      .request(
        `/${basePath}/selectCompents/saveResult?corpid=${others.corpid}&appId=${others.appId}`,
        {
          method: 'POST',
          data: {
            ...params,
          },
        }
      )
      .then((result) => {
        onOk({
          selectSignature: result.data,
          deptInfoList: params.deptInfoList,
          userInfoList: params.userInfoList,
          tagInfoList: params.tagInfoList,
          orgInfoList: params.orgInfoList,
          groupInfoList: params.groupInfoList,
          totalCount: params.totalCount,
          count: userCount,
        });
      });
  }, [onOk, treeState]);

  // 请求获取搜索结果
  const getSearchResult = (params: any) => {
    Toast.loading('加载中…', 0);
    // tslint:disable-next-line: no-floating-promises
    net
      .request(
        `/${basePath}/selectCompents/search?corpid=${others.corpid}&appId=${others.appId}`,
        {
          method: 'POST',
          data: params,
        }
      )
      .then((res) => {
        Toast.hide();
        const data = res.data.dataSource;
        setSearchResult(data);
      })
      .catch(() => {
        Toast.hide();
      });
  };

  return (
    <Modal
      visible={visible}
      transparent
      maskClosable={false}
      className="selected-mobile-model"
    >
      <div
        className={classnames('select-user-mobile', {
          'select-user-mobile-visible': !!visible,
        })}
      >
        <div className="left-pane">
          <TitleBar
            showBackbtn
            titleMaxWidth={120}
            title={dialogProps.title || '选择对象'}
            onBack={() => onCancel()}
          />
          <div
            className={`${
              hoverSearch || searchValue
                ? 'hover-search-show'
                : 'hover-search-hidden'
            }`}
          >
            <SearchBar
              value={searchValue}
              onFocus={() => setHoverSearch(true)}
              onBlur={() => setHoverSearch(false)}
              onClear={() => setSearchValue('')}
              className="select-user-mobile-search"
              onChange={(value) => setSearchValue(value)}
              onSubmit={(value: any) => {
                const params = {
                  search: value,
                  types: searchTab === 'all' ? showTabList : [searchTab],
                  ...requestParams,
                };
                getSearchResult(params);
                setSearchValue(value);
              }}
              placeholder={showTabList.length > 1 ? '搜索' : searchPlaceholder}
            />
            <div
              onClick={() => {
                const params = {
                  search: searchValue,
                  types: searchTab === 'all' ? showTabList : [searchTab],
                  ...requestParams,
                };
                getSearchResult(params);
              }}
              className="my-search-btn am-search-cancel am-search-cancel-show am-search-cancel-anim"
            >
              搜索
            </div>
          </div>
          {searchValue ? (
            <SelectSearchResult
              searchResult={searchResult}
              multiple={multiple}
              selectTypeList={requestParams.selectTypeList}
              search={searchValue}
              selectType={selectType}
              onSearchTabChange={onSearchTabChange}
              showTabList={showTabList}
            />
          ) : (
            <React.Fragment>
              <SelectPannel
                visible={visible}
                showTabList={showTabList}
                multiple={multiple}
                selectType={selectType}
                basePath={basePath}
                requestParams={requestParams}
                unCheckableNodeType={unCheckableNodeType}
                onlyLeafCheckable={onlyLeafCheckable}
                selectTypeList={requestParams.selectTypeList}
                {...others}
              />
            </React.Fragment>
          )}
        </div>
        <SelectFooter
          onOk={handleOk}
          className="mobile-footer"
          open={() => setModal(true)}
          setSearchValue={setSearchValue}
          searchValue={searchValue}
        />
        {
          <Modal
            className="selected-model"
            visible={modal1}
            transparent
            maskClosable={false}
            onClose={() => setModal(false)}
            footer={[
              {
                text: '确定',
                style: 'primary',
                onPress: () => {
                  setModal(false);
                },
              },
            ]}
          >
            <SelectedPane
              setModal={setModal}
              selectTypeList={requestParams.selectTypeList}
            />
          </Modal>
        }
      </div>
    </Modal>
  );
};

export default SelectUserMobile;
