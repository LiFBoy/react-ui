import React from 'react';
import SelectUser, { PropTypes } from 'happy-ui/lib/select-user';

export default () => {
  const show = () => {
    SelectUser.show({
      multiple: true,
      // selectType: 'dept',
      dialogProps: {
        title: '选人组件',
      },
      selectPaneProps: {
        dept: {
          title: '班级',
        },
      },
      requestParams: {
        // campusType: 'base_school_type',
        // deptTypeList: ['class'],
        strictUser: true,
        selectTypeList: ['user', 'dept', 'org', 'group', 'tags'],
      },
      // isSaveSelectSignature: true,
      // selectSignature: '7c5d12fe8d3c4d819620dff496c9e38b-v4-330108-S000067',
      showTabList: ['dept', 'innerContacts', 'tags'],
      // showTabList: ['schoolContacts'],
      onOk: () => {},
      onCancel: () => {},
      getCheckedNodes(data: any) {
        console.log('getCheckedNodes data', data);
      },
      getTotalCount(data: any) {
        console.log('getTotalCount data', data);
      },
    });
  };
  return (
    <div>
      <div>
        <div onClick={show}>唤起选人组件</div>
      </div>
    </div>
  );
};
