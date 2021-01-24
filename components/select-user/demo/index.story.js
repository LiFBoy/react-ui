import React, { useEffect } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Button } from 'antd';
import {
  withKnobs,
  select,
  object,
  boolean,
  string,
} from '@storybook/addon-knobs';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import SelectUser from '../index';

const stories = storiesOf('选人组件', module);
stories.addDecorator(withKnobs);

stories.add('method 用法', () => {
  const show = () => {
    const { close } = SelectUser.show({
      multiple: boolean('multiple', true),
      selectType: select('selectType', ['user', 'dept'], 'user'),
      deptNodeCheckable: boolean('deptNodeCheckable'),
      dialogProps: object('dialogProps', {
        title: '选人组件',
      }),
      // 如果 onOk 返回 promise，则会等 promise resolve 后关闭。
      onOk: action('onOk'),
      onCancel: action('onCancel'),
    });
  };
  return (
    <React.Fragment>
      <Button onClick={show}>唤起选人组件</Button>
    </React.Fragment>
  );
});

stories.add('组件用法', () => {
  const props = {
    visible: boolean('visible', true),
    multiple: boolean('multiple', true),
    selectType: select('selectType', ['user', 'dept'], 'user'),
    deptNodeCheckable: boolean('deptNodeCheckable'),
    dialogProps: object('dialogProps', {
      title: '选人组件',
    }),
    onOk: action('onOk'),
    onCancel: action('onCancel'),
  };

  return <SelectUser {...props} />;
});

stories.add(
  '移动端组件',
  () => {
    useEffect(() => {
      setRem();
    }, []);

    const setRem = () => {
      document.head.append(
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
      );

      const doc = document.documentElement;
      const clientWidth = doc.clientWidth;

      // 获取设备dpr
      const dpr = window.devicePixelRatio;

      // 1rem = 100px
      doc.style.fontSize = 100 * (clientWidth / 750) * dpr + 'px';
    };

    return <SelectUser basePath="mobile" />;
  },
  {
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: 'iphonex',
    },
  }
);
