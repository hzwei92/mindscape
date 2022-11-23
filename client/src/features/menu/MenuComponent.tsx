import { useContext, useState } from "react";
import { AppContext } from "../../app/App";
import AboutComponent from "../about/AboutComponent";
import AccountComponent from "../account/AccountComponent";
import SearchComponent from "../search/SearchComponent";
import { MenuMode } from "./menu";


export default function MenuComponent() {
  const { user, palette, menuMode, setMenuIsResizing } = useContext(AppContext);

  const [showResizer, setShowResizer] = useState(false);

  const handleResizeMouseEnter = (event: React.MouseEvent) => {
    setShowResizer(true);
  }

  const handleResizeMouseLeave = (event: React.MouseEvent) => {
    setShowResizer(false);
  }

  const handleResizeMouseDown = (event: React.MouseEvent) => {
    setMenuIsResizing(true);
  }

  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
    }}>
      <div style={{
        height: '100%',
        width: 'calc(100% - 5px)',
      }}>
        { 
          menuMode === MenuMode.ACCOUNT
            ? <AccountComponent />
            : null
        }
        {
          menuMode === MenuMode.ABOUT
            ? <AboutComponent />
            : null
        }
        <div style={{
          height: '100%',
          width: '100%',
          display: menuMode === MenuMode.SEARCH
            ? 'block'
            : 'none,'
        }}>
          <SearchComponent />
        </div>
      </div>
      <div 
        onMouseEnter={handleResizeMouseEnter}
        onMouseLeave={handleResizeMouseLeave}
        onMouseDown={handleResizeMouseDown}
        style={{
          width: 5,
          backgroundColor: showResizer
            ? user?.color
            : palette === 'dark'
              ? 'dimgrey'
              : 'lavender',
          cursor: 'col-resize',
        }}
      />
    </div>
  );
}