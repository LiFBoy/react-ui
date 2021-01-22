export interface ItreeItem {
  id: string;
  key: string;
  name: string;
  label: any;
  nodeType: string;
  orgId?: string;
  type?: 'DEPT'  // 部门
    | 'GROUP_DEPT'  //  虚拟部门
    | 'USER'      // 个人
    | 'ORG'       // 组织
    | 'TAG'       // 标签
    | 'GROUP';     // 分组
  deptType?: 0  // 基础校区
    | 1;          // 自定义校区
  userCount?: number;
  children?: ItreeItem[];
  checkable?: boolean;
  isLeaf?: boolean;
  icon?: any;
  contactType?: string;
  count?: number;
}

// 已选展示组件props
export interface PropType {
  groupList: IgroupItem[]
  unit: string            // 计量单位
  delGroup: (group: IgroupItem) => void   // 删除分组，参数为被删除的分组
  delItem: (item: ItreeItem, group: IgroupItem) => void    // 删除items，参数为被删除的item，以及item所属的group
  setModal: (visible: boolean) => void
}

// 展示分组
export interface IgroupItem {
  title: string
  unit: string
  type: string
  count?: number
  itemList: ItreeItem[]
}
