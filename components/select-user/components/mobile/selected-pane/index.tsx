import React, { useContext, useCallback } from 'react';
import SelectedShowPane from '../selected-show-pane';
import { IgroupItem, ItreeItem } from '../selected-show-pane/interface';
import { TREE_CONTEXT } from '../../../select-user';
import './index.less';

interface PropTypes {
  setModal: any;
  selectTypeList: any; // 可选节点列表
}

const SelectPane: React.FunctionComponent<PropTypes> = (props: PropTypes) => {
  const treeContext = useContext(TREE_CONTEXT);
  const { selectTypeList, setModal } = props;
  const { treeState, delKeys, setUserCount, resetUserCount } =
    treeContext || {};
  const {
    deptInfoList,
    orgInfoList,
    userInfoList,
    tagInfoList,
    groupInfoList,
    userCount,
  } = treeState;

  // 删除单个items
  const delItem = useCallback(
    (item: ItreeItem) => {
      delKeys([item.id], item.type);
      if (selectTypeList && selectTypeList.length === 1) {
        // 如果selectTypeList的length为1，则选取后不需要请求获取人数
        resetUserCount(item, false, false);
      } else {
        resetUserCount(item, false, true);
      }
    },
    [delKeys, resetUserCount]
  );

  // 删除一个分组
  const delGroup = useCallback(
    (group: any) => {
      // 这里如果直接从group里面删除会直接操作state
      const delGroup = [].concat(group.itemList);

      for (const item of delGroup) {
        delKeys([item.id], item.type);
      }

      switch (group.type) {
        case 'DEPT':
          userCount.deptCount = 0;
          break;
        case 'GROUP':
        case 'ORG': // 分组和组织放在一起展示，因此清空的时候两个一起清空
          userCount.groupCount = 0;
          userCount.orgCount = 0;
          break;
        case 'TAG':
          userCount.tagCount = 0;
          break;
      }
      setUserCount(userCount);
    },
    [delKeys, setUserCount]
  );

  const groupList: IgroupItem[] = [];

  if (userInfoList.length) {
    const groupItem = {
      title: '人员',
      type: 'USER',
      unit: '人',
      itemList: userInfoList,
      count: userInfoList?.length || 0,
    };
    groupList.push(groupItem);
  }
  if (deptInfoList.length) {
    const groupItem = {
      title: '部门',
      type: 'DEPT',
      unit: '人',
      count: userCount.deptCount || 0,
      itemList: deptInfoList,
    };
    groupList.push(groupItem);
  }

  // 选中的组织或分组，统一放到组织中
  if (orgInfoList.length) {
    const orgItem = {
      title: '组织',
      type: 'ORG',
      unit: '人',
      count: userCount.orgCount || 0,
      itemList: orgInfoList,
    };
    groupList.push(orgItem);
  }

  // 选中的分组
  if (groupInfoList.length) {
    const groupItem = {
      title: '分组',
      type: 'GROUP',
      unit: '人',
      count: userCount.groupCount || 0,
      itemList: groupInfoList,
    };
    groupList.push(groupItem);
  }

  if (tagInfoList.length) {
    const groupItem = {
      title: '标签',
      type: 'TAG',
      unit: '人',
      count: userCount.tagCount || 0,
      itemList: tagInfoList,
    };
    groupList.push(groupItem);
  }

  return (
    <div className="select-pane-wrap">
      <SelectedShowPane
        setModal={setModal}
        groupList={groupList}
        unit={selectTypeList && selectTypeList.length === 1 ? '' : '人'} // 如果传入了selectTypeList，切长度为1，则不需要显示单位人
        delItem={delItem}
        delGroup={delGroup}
      />
    </div>
  );
};

export default SelectPane;
