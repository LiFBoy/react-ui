import React from 'react';
// @ts-ignore
import TitleBar from 'nbugs-mobile-title-bar';
// @ts-ignore
import Card from 'nbugs-mobile-card';
import { PropType, IgroupItem, ItreeItem } from './interface';
import './index.less';
import Tag from 'antd/es/tag';

const SelectedShowPane: React.FunctionComponent<PropType> = (
  props: PropType
) => {
  const { groupList, delItem, setModal } = props;

  // const total = useMemo(() => {
  //   let total = 0; // 已选总数

  //   for (const group of groupList) {
  //     const itemList = group.itemList;
  //     if (group.type === 'USER') {
  //       total += itemList.length;
  //     } else {
  //       total += group.count || 0;
  //     }
  //   }
  //   return total;
  // }, [groupList]);

  return (
    <div className="mobile-selected-show-pane-wrap">
      <TitleBar
        showBackbtn
        titleMaxWidth={120}
        title="已选对象"
        onBack={() => setModal(false)}
      />
      {groupList.length > 0 ? (
        <div className="selected-show-pane-detail-box">
          {groupList.map((group: IgroupItem) => {
            const { title, itemList, count, type } = group;
            return (
              <div className="selected-show-pane-group" key={title}>
                <div className="selected-show-pane-group-top">
                  <span className="selected-show-pane-group-total">
                    {title} ({type === 'USER' ? itemList.length : count})
                  </span>
                </div>
                <Card className="customer-class-name" closeText="展开全部" wrapShowMode="normal" maxHeight={96}>
                  <div className="selected-show-pane-group-content">
                    {itemList.map((item: ItreeItem) => {
                      return (
                        <Tag
                          className="selected-tag"
                          closable
                          visible
                          key={item.id}
                          title={item.name}
                          onClose={() => delItem(item, group)}
                        >
                          {item.name}
                        </Tag>
                      );
                    })}
                  </div>
                </Card>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-content">
          <div className="empty-img"></div>
          无任何对象
        </div>
      )}
    </div>
  );
};

export default SelectedShowPane;
