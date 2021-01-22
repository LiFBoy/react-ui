import React, { useContext } from 'react';
import { TREE_CONTEXT } from '../../../select-user';
import SchoolContacts from '../SchoolContacts';
import net from '../../../services/index';
import { ItreeItem } from '../SchoolContacts';
import { NodeType } from '../../../interface';
import { Toast } from 'antd-mobile';
import {
  TagIcon,
  // UserIcon,
  GroupIcon,
  DeptIcon,
  OrgIcon,
} from '../../tree-node-icon';
interface IResult {
  code: number;
  data: {
    dataSource: [];
  };
  errorMsg: string | null;
  success: boolean;
}
interface Iprops {
  multiple: boolean; // 是否可以多选
  currentTab?: string;
  appId?: string | number;
  corpid?: string | number;
  basePath: string;
  visible?: boolean;
  selectTypeList: any;
  showTabList: any;
  onlyLeafCheckable: boolean;
  selectType: string;
  unCheckableNodeType: NodeType[];
  requestParams?: {
    // 基础校区还是自定义校区
    campusType?: 'base_school_type' | 'custom_school_type';
    // 仅展示分组
    onlySelectGroup?: boolean;
    // 企业微信 id，移动端鉴权用
    corpId?: string;
    // 部门类型 家校通讯录基础校区下班级class/自定义校区下自定义班级custom_class
    deptTypeList?: any;
    // 选择类型 只可选用户user,部门dept,组织org,分组group,标签tag
    selectTypeList?: any;
  };
}

const SelectPannel: React.FunctionComponent<Iprops> = (props: Iprops) => {

  const {
    multiple,
    basePath,
    requestParams,
    selectTypeList,
    selectType,
    showTabList,
    onlyLeafCheckable,
    visible,
    unCheckableNodeType,
    ...ohters
  } = props;
  // 获取treeContext
  const treeContext = useContext(TREE_CONTEXT);
  const { treeState, setTreeData } = treeContext;

  // 从treeState中获取当前树节点以及被选中的keys
  const {
    treeData, // 当前树的数据信息
  } = treeState;

  // 根据dfs查找树节点，因为觉得用户操作习惯更倾向于一个节点不停的展开，所以dfs能更快的找到节点
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

  /**
   * 处理返回数据
   * @param {数据列表} list
   * @param {是否为根节点} isRoot
   */
  const formatData = (
    list: ItreeItem[],
    currentTab: string,
    isRoot?: boolean
  ) => {
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
              <div className="item-name-icon">
                {item.name.substr(1, item.name.length)}
              </div>
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
        default:
      }

      // 如果获取的是跟节点,且是内部通讯录

      if (isRoot && currentTab === 'innerContacts') {
        item.checkable = false; // 内部通讯录的跟节点不允许被选择
      }

      if (
        (currentTab === 'innerContacts' || currentTab === 'schoolContacts') && // 在家校通迅录和内部通迅录
        item.type === 'DEPT' && // 如果节点类型为DEPT
        selectType === 'user'
      ) {
        // 且当前组件selectType为user
        item.isLeaf = false; // 则DEPT节点一律视为非叶子结点 (实际场景中DEPT节点下一定有子节点)
      } else if (
        (currentTab === 'innerContacts' || currentTab === 'schoolContacts') &&
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
        formatData(item.children, currentTab, false);
      }
    }
  };

  const getTree = (currentTab: string) => {
    // Toast.loading('加在中…', 0);
    return new Promise((resolve) => {
      net
        .request(`/${basePath}/selectCompents/${currentTab}?corpid=${ohters.corpid}&appId=${ohters.appId}`, {
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
          // Toast.hide();
          if (result.success) {
            resolve({ currentTab, data: result.data.dataSource });
          }
        })
        .catch(() => {
          // Toast.hide();
        });
    });
  };

  const loadData = (node: any, currentTab: string) => {
    Toast.loading('加载中', 0);
    const nodeProps = node;
    const item: ItreeItem = {
      id: nodeProps.key,
      label: nodeProps.label,
      name: nodeProps.name,
      key: nodeProps.key,
      type: nodeProps.type,
      nodeType: nodeProps.nodeType,
      orgId: nodeProps.orgId,
      contactType: nodeProps.contactType,
    };

    return new Promise<void>((resolve) => {
      const treeNode = findNode(item);
      // tslint:disable-next-line: no-floating-promises
      net
        .request(`/${basePath}/selectCompents/${currentTab}?corpid=${ohters.corpid}&appId=${ohters.appId}`, {
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
            formatData(result.data.dataSource, currentTab, false);
            setTreeData(result.data.dataSource);
            Toast.hide();
            resolve();
            if (treeNode) {
              treeNode.children = result.data.dataSource;
              setTreeData(treeData);
            }
          }
        })
        .catch(() => {
          Toast.hide();
        });
    });
  };

  return (
    <div className="select-area-pannel">
      <SchoolContacts
        visible={visible}
        loadData={loadData}
        selectTypeList={selectTypeList}
        multiple={multiple}
        showTabList={showTabList}
        getTree={getTree}
        formatData={formatData}
        {...ohters}
      />
    </div>
  );
};

export default SelectPannel;
