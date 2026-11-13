import React from "react";
import Sidebar from "./Sidebar";

const NavSidebar = ({ closeNavbar }) => {
  return <Sidebar closeNavbar={closeNavbar} isMobileDrawer={true} />;
};

export default NavSidebar;
