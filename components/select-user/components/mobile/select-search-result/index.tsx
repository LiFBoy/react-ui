import React, { useContext, useMemo } from 'react';
import { Checkbox, Tabs, WhiteSpace } from 'antd-mobile';
// const CheckboxItem = Checkbox.CheckboxItem;
// import { TabsProps } from 'antd-mobile/lib/tabs';
import classnames from 'classnames';
import { Accordion } from 'antd-mobile';
import { TREE_CONTEXT } from '../../../select-user';
// import {
//   TagIcon,
//   // UserIcon,
//   DeptIcon,
//   OrgIcon,
//   GroupIcon
// } from '../../tree-node-icon';
import './index.less';

interface PropType {
  search: string; // 搜索的字段
  searchResult: any[]; // 搜索结果
  onSearchTabChange: (tab: string) => void;
  showTabList: any[];
  multiple: boolean;
  selectType: 'user' | 'dept';
  selectTypeList: any; // 可选节点列表
}

const SHOW_TAB_LIST_ITEM_MAP: any = {
  all: '全部',
  dept: '所属部门',
  group: '下属组织',
  innerContacts: '内部通迅录',
  schoolContacts: '家校通迅录',
  tags: '标签',
};

const SelectSearchResult: React.FunctionComponent<PropType> = (
  props: PropType
) => {
  const {
    search,
    searchResult,
    onSearchTabChange,
    multiple,
    showTabList,
    selectTypeList,
    selectType,
  } = props;

  // 获取treeContext
  const { treeState, updateCheckedNode, resetUserCount, clear } = useContext(
    TREE_CONTEXT
  );
  const {
    userInfoList,
    deptInfoList,
    orgInfoList,
    tagInfoList,
    groupInfoList,
  } = treeState;

  // 判断搜索字段是否为纯数字
  const allNumber = /^([0-9])+$/.test(search);

  const renderSearchHint = (list: Array<any>) => {
    if (list && list.length > 10) {
      return (
        <div className="search-result-group-item treeFooter">
          仅展示前 10 个搜索结果，请输入更精确的搜索内容。
        </div>
      );
    }
  };

  const nameColor = (name: string) => {
    if (!name) {
      return null;
    }

    return name.replace(
      search,
      `<span style="color: #1786EC;">${search}</span>`
    );
  };

  // checkbox状态改变事件
  const onCheckBoxChange = (item: any, type: string) => {
    let node: any = {};
    switch (type) {
      case 'USER':
        node = {
          id: item.userId,
          key: item.userId,
          name: item.userName,
          type: item.type,
          contactType: item.contactType,
        };
        break;
      case 'ORG':
        node = {
          id: item.orgId,
          key: item.orgId,
          name: item.orgName,
          type: item.type,
          contactType: item.contactType,
        };
        break;
      case 'GROUP':
        node = {
          id: item.groupId,
          key: item.groupId,
          name: item.groupName,
          type: item.type,
          contactType: item.contactType,
        };
        break;
      case 'DEPT':
        node = {
          id: item.deptId,
          key: item.deptId,
          name: item.deptName,
          type: item.type,
          contactType: item.contactType,
        };
        break;
      case 'TAG':
        node = {
          id: item.tagCode,
          key: item.tagCode,
          name: item.tagName,
          type: item.type,
          contactType: item.contactType,
        };
        break;
      default:
    }

    let checked = false;

    // 如果是多选
    if (multiple) {
      // 节点是否选中
      checked = updateCheckedNode(node, node.id);
    } else {
      // 如果是单选的情况
      const checkedKeys = treeState.checkedKeys;
      if (checkedKeys[0] === node.id) {
        // 更新选中节点
        checked = updateCheckedNode(node, node.id);
      } else {
        // 先清空所选
        clear();

        // 更新选中节点
        checked = updateCheckedNode(node, node.id);
      }
    }

    if (selectTypeList && selectTypeList.length === 1 && type !== 'USER') {
      resetUserCount(node, checked, false);
    } else {
      resetUserCount(node, checked);
    }
  };

  // 渲染tab内容
  const renderTabContent = () => {
    const userList: any[] = [];
    const deptList: any[] = [];
    const orgList: any[] = [];
    const tagList: any[] = [];
    const groupList: any[] = [];

    for (const resultItem of searchResult) {
      switch (resultItem.type) {
        case 'USER':
          userList.push(resultItem);
          break;
        case 'DEPT':
          deptList.push(resultItem);
          break;
        case 'ORG':
          orgList.push(resultItem);
          break;
        case 'GROUP':
          groupList.push(resultItem);
          break;
        case 'TAG':
          tagList.push(resultItem);
          break;
        default:
      }
    }

    return (
      <div
        className={classnames('search-result-mobile-box', {
          multiple: multiple === false,
        })}
      >
        {userList.length > 0 ? (
          <React.Fragment>
            <Accordion defaultActiveKey="0" className="result-accordion">
              <Accordion.Panel
                header={
                  <div className="custome-name">
                    相关人员({userList.length})
                  </div>
                }
              >
                {userList.map((user, index) => {
                  let checked = false;
                  for (const item of userInfoList) {
                    if (user.userId === item.id) {
                      checked = true;
                    }
                  }
                  return (
                    <div className="search-result-group-item" key={index}>
                      <div className="line">
                        <div className="checkbox-wrap">
                          <Checkbox
                            checked={checked}
                            onChange={() => onCheckBoxChange(user, user.type)}
                          />
                        </div>
                        <div className="search-result-item">
                          <div className="item-name-icon">
                            {user.userName.substring(user.userName.length - 2)}
                          </div>
                          <div className="search-result-item-detail">
                            <div
                              className="search-result-item-title overflow-ellipsis"
                              title={user.userName}
                              dangerouslySetInnerHTML={{
                                __html: nameColor(user.userName),
                              }}
                            ></div>
                            {user.userDeptList?.map(
                              (deptItem: any, index: number) => {
                                return (
                                  <div
                                    className="search-result-item-des"
                                    key={index}
                                  >
                                    {
                                      <div
                                        className="overflow-ellipsis"
                                        title={deptItem.deptName}
                                      >
                                        {user.contactType === '3'
                                          ? '类别'
                                          : '部门'}
                                        : {deptItem.deptName}
                                      </div>
                                    }
                                  </div>
                                );
                              }
                            )}
                            {user.contactType === '3' ? (
                              <div className="search-result-item-des">
                                {
                                  <div
                                    className="overflow-ellipsis"
                                    title={user.orgName}
                                  >
                                    学校: {user.orgName}
                                  </div>
                                }
                              </div>
                            ) : (
                              ''
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {renderSearchHint(userList)}
              </Accordion.Panel>
            </Accordion>
          </React.Fragment>
        ) : (
          ''
        )}
        {deptList.length > 0 ? (
          <React.Fragment>
            <Accordion defaultActiveKey="0" className="result-accordion">
              <Accordion.Panel
                header={
                  <div className="custome-name">
                    相关部门({deptList.length})
                  </div>
                }
              >
                {deptList.map((dept, index) => {
                  let checked = false;

                  for (const item of deptInfoList) {
                    if (dept.deptId === item.id) {
                      checked = true;
                    }
                  }
                  return (
                    <div className="search-result-group-item" key={index}>
                      <div className="line">
                        <div className="checkbox-wrap">
                          <Checkbox
                            checked={checked}
                            onChange={() => onCheckBoxChange(dept, dept.type)}
                          />
                        </div>
                        <div className="search-result-item-detail">
                          {/* <div className="search-result-item-icon">
                            <DeptIcon />
                          </div> */}
                          <div className="search-result-item-title">
                            <div
                              className="overflow-ellipsis"
                              title={dept.deptName}
                              dangerouslySetInnerHTML={{
                                __html: nameColor(dept.deptName),
                              }}
                            ></div>
                          </div>
                          <div className="search-result-item-des">
                            <div
                              className="overflow-ellipsis"
                              title={`${dept.orgName} - ${dept.deptNamePath}`}
                            >
                              位置:{`${dept.orgName} - ${dept.deptNamePath}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {renderSearchHint(deptList)}
              </Accordion.Panel>
            </Accordion>
          </React.Fragment>
        ) : (
          ''
        )}
        {orgList.length > 0 ? (
          <React.Fragment>
            <Accordion defaultActiveKey="0" className="result-accordion">
              <Accordion.Panel
                header={
                  <div className="custome-name">相关组织({orgList.length})</div>
                }
              >
                {orgList.map((org, index) => {
                  let checked = false;
                  for (const item of orgInfoList) {
                    // org也显示在相关组织下
                    if (org.orgId === item.id) {
                      checked = true;
                    }
                  }

                  return (
                    <div className="search-result-group-item" key={index}>
                      <div className="checkbox-wrap">
                        <Checkbox
                          checked={checked}
                          onChange={() => onCheckBoxChange(org, org.type)}
                        />
                      </div>
                      <div className="search-result-item-detail">
                        {/* <div className="search-result-item-icon">
                          <OrgIcon />
                        </div> */}
                        <div className="search-result-item-title">
                          <div
                            className="overflow-ellipsis"
                            title={org.orgName}
                            dangerouslySetInnerHTML={{
                              __html: nameColor(org.orgName),
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {renderSearchHint(orgList)}
              </Accordion.Panel>
            </Accordion>
          </React.Fragment>
        ) : (
          ''
        )}
        {groupList.length > 0 ? (
          <React.Fragment>
            <Accordion defaultActiveKey="0" className="result-accordion">
              <Accordion.Panel
                header={
                  <div className="custome-name">
                    相关分组({groupList.length})
                  </div>
                }
              >
                {groupList.map((group, index) => {
                  let checked = false;

                  for (const item of groupInfoList) {
                    if (group.groupId === item.id) {
                      checked = true;
                    }
                  }

                  return (
                    <div className="search-result-group-item" key={index}>
                      <div className="checkbox-wrap">
                        <Checkbox
                          checked={checked}
                          onChange={() => onCheckBoxChange(group, group.type)}
                        />
                      </div>
                      <div className="search-result-item-detail">
                        {/* <div className="search-result-item-icon">
                          <GroupIcon />
                        </div> */}
                        <div className="search-result-item-title">
                          <div
                            className="overflow-ellipsis"
                            title={group.groupName}
                            dangerouslySetInnerHTML={{
                              __html: nameColor(group.groupName),
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {renderSearchHint(groupList)}
              </Accordion.Panel>
            </Accordion>
          </React.Fragment>
        ) : (
          ''
        )}
        {tagList.length > 0 ? (
          <React.Fragment>
            <Accordion defaultActiveKey="0" className="result-accordion">
              <Accordion.Panel
                header={
                  <div className="custome-name">相关标签({tagList.length})</div>
                }
              >
                {tagList.map((tag, index) => {
                  let checked = false;

                  for (const item of tagInfoList) {
                    if (tag.tagCode === item.id) {
                      checked = true;
                    }
                  }
                  return (
                    <div className="search-result-group-item" key={index}>
                      <div className="checkbox-wrap">
                        <Checkbox
                          checked={checked}
                          onChange={() => onCheckBoxChange(tag, tag.type)}
                        />
                      </div>
                      <div className="search-result-item-detail">
                        {/* <div className="search-result-item-icon">
                          <TagIcon />
                        </div> */}
                        <div className="search-result-item-title">
                          <div
                            className="overflow-ellipsis"
                            title={tag.tagName}
                            dangerouslySetInnerHTML={{
                              __html: nameColor(tag.tagName),
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {renderSearchHint(tagList)}
              </Accordion.Panel>
            </Accordion>
          </React.Fragment>
        ) : (
          ''
        )}
      </div>
    );
  };

  const $allNumberAlert = useMemo(() => {
    return allNumber && selectType === 'user' && search.length < 8 ? (
      <span className="search-result-tips">
        为保证通讯录安全，手机号码输入超过8位后才能展示相关的人员结果
      </span>
    ) : null;
  }, [allNumber, selectType, search]);

  const renderContent = () => {
    return (
      <>
        {$allNumberAlert}
        {searchResult.length > 0 ? (
          <React.Fragment>{renderTabContent()}</React.Fragment>
        ) : (
          <div className="nbugs-tree-result-empty">未搜索到相关内容</div>
        )}
      </>
    );
  };

  return (
    <div className="search-result-wrap">
      <WhiteSpace />
      <Tabs
        tabs={[
          { title: '全部', key: 'all' },
          ...showTabList.map((item: string) => ({
            title: SHOW_TAB_LIST_ITEM_MAP[item],
            key: item,
          })),
        ]}
        renderTabBar={(item) => <Tabs.DefaultTabBar {...item} page={4} />}
        onChange={(tab: any) => onSearchTabChange(tab)}
      >
        {renderContent}
      </Tabs>

      <WhiteSpace />
    </div>
  );
};

export default SelectSearchResult;
