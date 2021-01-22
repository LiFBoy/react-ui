import React from 'react';
import { ItreeItem } from '../SchoolContacts';
import { Icon } from 'antd-mobile';
export default (props: any) => {
  const { handleClickBreadcrumb, currentTab, breadcrumb, tabmaps } = props;
  return (
    <div className="breadcrumb">
      <span onClick={() => handleClickBreadcrumb({ key: currentTab })}>
        <span>{tabmaps[currentTab]}</span>
        <span className="separator">
          <Icon type="right" />
        </span>
      </span>
      {breadcrumb.length > 0
        ? breadcrumb.map((item: ItreeItem) => {
          return (
            <span onClick={() => handleClickBreadcrumb(item)} key={item.key}>
              <span>
                {item.name}
              </span>
              <span className="separator">
                <Icon type="right" />
              </span>
            </span>
          );
        })
        : null}
    </div>
  );
};
