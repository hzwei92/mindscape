import { isPlatform } from "@ionic/react";
import { useContext, useState } from "react";
import { AppContext } from "../../app/App";
import { APP_BAR_X } from "../../constants";
import AboutComponent from "../about/AboutComponent";
import AccountComponent from "../account/AccountComponent";
import SearchComponent from "../search/SearchComponent";
import { MenuMode } from "./menu";

interface MenuComponentProps {
  isPortrait: boolean;
}
export default function MenuComponent(props: MenuComponentProps) {
  const { user, palette, menuMode, menuX, setMenuIsResizing } = useContext(AppContext);

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
      position: 'relative',
      height: '100%',
      width: isPlatform('mobile')
        ? '100%'
        : menuX - APP_BAR_X,
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