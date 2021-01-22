import React, { useContext, useEffect, useState, useRef } from 'react';
import { TREE_CONTEXT } from '../../../select-user';
import classnames from 'classnames';

const SelectFooter = (props: any) => {
  // 获取treeContext
  const treeContext = useContext(TREE_CONTEXT);
  const [disablebtn, setDisablebtn] = useState<boolean>(true);
  const checkedKeysRef = useRef<any>(0);
  const [searchCheckValue, setSearchCheckValue] = useState(0);
  const [textbtn, setTextbtn] = useState<string>('确定');
  const { open, calssName, searchValue, setSearchValue, onOk } = props;
  const searchValueRef = useRef<string>(searchValue);
  const { treeState } = treeContext;
  const { checkedKeys, userCount, userInfoList } = treeState;
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let totalCount = 0;
    for (const i in userCount) {
      if (i !== 'userCount') {
        totalCount += userCount[i];
      }
    }
    setTotalCount(totalCount + userInfoList?.length);
  });

  useEffect(() => {
    setSearchCheckValue(() => checkedKeys.length);
  }, [searchValue]);

  useEffect(() => {
    // 非搜索模式下进行操作
    if (!searchValue) {
      if (checkedKeys.length === 0) {
        setDisablebtn(true);
      } else {
        setDisablebtn(false);
      }
      return;
    }

    if (checkedKeys.length === 0 || searchCheckValue === checkedKeys.length) {
      setDisablebtn(true);
    } else {
      setDisablebtn(false);
    }
  }, [
    checkedKeys,
    checkedKeys.length,
    searchValueRef,
    checkedKeysRef,
    searchValue,
  ]);

  useEffect(() => {
    if (searchValue) {
      setTextbtn('完成搜索');
    } else {
      if (checkedKeysRef.current > 0) {
        setDisablebtn(false);
      }
      setTextbtn('确定');
    }
    if (searchValueRef.current !== searchValue && !!searchValue) {
      searchValueRef.current = searchValue;
      setDisablebtn(true);
    }
  }, [searchValue, checkedKeysRef]);

  const handleClick = () => {
    if (!searchValue) {
      onOk();
    }
    setSearchValue('');
    setSearchCheckValue(0);
  };

  return (
    <div className={classnames('select-footer', calssName)}>
      <div className="box">
        <div className="num" onClick={open}>
          <span>已选</span>
          <span>{totalCount}</span>
          {totalCount > 0 && <span>人</span>}
        </div>
        <div className="customebtn">
          {disablebtn ? (
            <div className="footer-btn footer-btn-disabled">{textbtn}</div>
          ) : (
            <div onClick={handleClick} className="footer-btn">
              {textbtn}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectFooter;
