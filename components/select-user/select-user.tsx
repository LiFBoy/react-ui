/**
 * 选人组件
 */
import React from 'react';
import { ConfigProvider } from 'antd';
import locale from './utils/locale';
import useTree, { ItreeContext } from './hooks/use-tree';
import SelectUserPc from './select-user-pc';
import SelectUserMobile from './select-user-mobile';
import { PropTypes } from './interface';
import './index.less';
import './common.less';

export const TREE_CONTEXT = React.createContext<ItreeContext | null>(null);

export default function SelectUser({
  defaultValue,
  visible = false,
  showTabList = ['dept', 'group', 'innerContacts', 'schoolContacts', 'tags'],
  onOk,
  onCancel,
  appId,
  corpid,
  basePath = 'pc',
  selectType = 'user',
  multiple = true,
  // selectSignature = "5f0ffd880c57dd47648f0e08",
  selectSignature = '',
  isSaveSelectSignature = true,
  searchPlaceholder,
  dialogProps = {},
  unCheckableNodeType = [],
  onlyLeafCheckable = false,
  requestParams = {
    campusType: 'base_school_type',
    selectTypeList: ['user', 'dept', 'org', 'group', 'tag'],
  },
  selectPaneProps = {},
  getCheckedNodes,
  getTotalCount,
}: PropTypes) {
  // 获取treeContext
  const treeContext = useTree();
  const Com = basePath === 'pc' ? SelectUserPc : SelectUserMobile;
  const others = basePath === 'pc' ? {} : { appId, corpid };
  return (
    <ConfigProvider locale={locale}>
      <TREE_CONTEXT.Provider value={treeContext}>
        <Com
          defaultValue={defaultValue}
          visible={visible}
          showTabList={showTabList}
          onOk={onOk}
          onCancel={onCancel}
          getCheckedNodes={getCheckedNodes}
          getTotalCount={getTotalCount}
          basePath={basePath}
          selectType={selectType}
          multiple={multiple}
          searchPlaceholder={searchPlaceholder}
          selectSignature={selectSignature}
          isSaveSelectSignature={isSaveSelectSignature}
          dialogProps={dialogProps}
          selectPaneProps={selectPaneProps}
          unCheckableNodeType={unCheckableNodeType}
          onlyLeafCheckable={onlyLeafCheckable}
          requestParams={requestParams}
          {...others}
        />
      </TREE_CONTEXT.Provider>
    </ConfigProvider>
  );
}
