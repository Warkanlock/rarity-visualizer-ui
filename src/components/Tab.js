import React from "react";

const Tab = ({ activeTab, label, onClick }) => {
  let className = "tab";

  if (activeTab === label) {
    className += " selected";
  }

  return (
    <span className={className} onClick={onClick}>
      {label}
    </span>
  );
};

export default Tab;
