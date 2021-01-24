import React from 'react';
import { storiesOf } from '@storybook/react';
// import { Button } from '@storybook/react/demo';
// 这里引入你想展示的组件
import SelectUser, { PropTypes } from '../components/select-user';
// export const action = (callbackName) => (...args) => {
//   console.log(`[Demo Action Called - ${callbackName}]`, ...args);
// };
// const show = () => {
//   SelectUser.show({
//     multiple: true,
//     // selectType: 'dept',
//     dialogProps: {
//       title: '选人组件',
//     },
//     selectPaneProps: {
//       dept: {
//         title: '班级',
//       },
//     },
//     requestParams: {
//       // campusType: 'base_school_type',
//       // deptTypeList: ['class'],
//       strictUser: true,
//       selectTypeList: ['user', 'dept', 'org', 'group', 'tags'],
//     },
//     // isSaveSelectSignature: true,
//     // selectSignature: '7c5d12fe8d3c4d819620dff496c9e38b-v4-330108-S000067',
//     showTabList: ['dept', 'innerContacts', 'tags'],
//     // showTabList: ['schoolContacts'],
//     onOk: action('onOk'),
//     onCancel: action('onCancel'),
//     getCheckedNodes(data) {
//       console.log('getCheckedNodes data', data);
//     },
//     getTotalCount(data) {
//       console.log('getTotalCount data', data);
//     },
//   });
// };

storiesOf('Buttons|Simple', module)
  .add('with text', () => (
    // 一个 add 表示添加一个 story
    <div>Hello Button</div>
  ))
  .add('with some emoji', () => (
    // 这里是另一个 story
    <div>
      <span role="img" aria-label="so cool">
        😀 😎 👍 💯
      </span>
    </div>
  ));
