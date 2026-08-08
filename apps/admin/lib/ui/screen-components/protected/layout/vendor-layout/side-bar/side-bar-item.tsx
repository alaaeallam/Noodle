// Core
import { usePathname, useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

// Icons
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Interface & Types
import {
  ISidebarMenuItem,
  LayoutContextProps,
  SubMenuItemProps,
} from '@/lib/utils/interfaces';

// Styles
import classes from './side-bar.module.css';
import { LayoutContext } from '@/lib/context/global/layout.context';

function HoveredSubMenuItem({ icon, text, active }: SubMenuItemProps) {
  return (
    <div
      className={`my-2 rounded-md p-2 ${
        active ? 'bg-gray-300' : 'hover:bg-indigo-50'
      }`}
    >
      <div className="flex items-center justify-center">
        {icon && (
          <span className="text-primary-500 h-6 w-6">
            <FontAwesomeIcon icon={icon} />
          </span>
        )}
        <span className="text-primary-500 ms-3 w-28 text-start">{text}</span>
        <div className="bg-primary-200 h-1" />
      </div>
    </div>
  );
}

export default function SidebarItem({
  icon,
  text,
  expanded = false,
  subMenu = null,
  route,
  isParent,
  isClickable,
}: ISidebarMenuItem) {
  // States
  const [expandSubMenu, setExpandSubMenu] = useState(false);
  const { showVendorSidebar } = useContext<LayoutContextProps>(LayoutContext);

  // Hooks
  const pathname = usePathname();
  const router = useRouter();

  // use Effect
  useEffect(() => {
    if (!expanded) {
      setExpandSubMenu(false);
    }
  }, [expanded]);

  // Constants
  // Calculate the height of the sub-menu assuming each item is 40px tall
  const subMenuHeight = expandSubMenu
    ? `${((subMenu?.length || 0) * 40 + (subMenu! && 15)).toString()}px`
    : 0;

  // NOTE: use complete, literal Tailwind class strings here (never build a
  // class name via template-literal interpolation like `bg-${var}`) — the
  // Tailwind JIT content scanner only detects classes that appear as a
  // complete, static substring somewhere in the source; a dynamically
  // concatenated class is invisible to it and silently never generates any
  // CSS, which is exactly what caused inactive sidebar text to render
  // colorless (inheriting body's default color) instead of the intended
  // light shade against the dark sidebar background.
  const isActive = pathname.includes(route ?? '');
  const isActiveLeaf = isActive && !subMenu;
  const rowClasses = isActiveLeaf
    ? isClickable
      ? 'bg-nile text-white'
      : 'text-[#CFE3E1]'
    : isActive
      ? 'bg-nile text-white hover:bg-nile hover:text-white'
      : 'text-[#CFE3E1] hover:bg-nile hover:text-white';

  return (
    <div className={`mt-[0.4rem] flex flex-col rounded-md`}>
      <div>
        <button
          className={`group relative flex w-full cursor-pointer items-center rounded-md px-3 py-2 transition-colors ${rowClasses} ${!expanded && 'hidden sm:flex'} `}
          onClick={() => {
            if (!isParent || isClickable) {
              router.push(route ?? '');
              if (window.innerWidth < 650) {
                showVendorSidebar(false);
              }
              return;
            }
            setExpandSubMenu((curr) => expanded && !curr);
          }}
        >
          {icon && (
            <span className="card-h1 w-6">
              <FontAwesomeIcon icon={icon} />
            </span>
          )}

          <span
            className={`card-h2 text-${isParent ? 'md' : 'sm'} overflow-hidden text-start transition-all ${
              expanded ? 'ms-3 w-44' : 'w-0'
            }`}
          >
            {text}
          </span>
          {subMenu && (
            <div
              className={`absolute mb-1 end-2 h-4 w-4${expanded ? '' : 'top-6'} transition-all ${expandSubMenu ? 'rotate-90' : 'rotate-0'}`}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </div>
          )}

          {!expanded && (
            <div
              className={`text-primary-500 invisible absolute start-full ms-6 -translate-x-3 rounded-md bg-indigo-100 px-2 py-1 text-sm opacity-20 transition-all group-hover:visible group-hover:translate-x-0 group-hover:opacity-100`}
            >
              {!subMenu
                ? text
                : subMenu.map((item, index) => (
                    <HoveredSubMenuItem
                      key={index}
                      text={item.text}
                      icon={item.icon}
                      active={isActive}
                    />
                  ))}
            </div>
          )}
        </button>
      </div>
      <ul
        className={`${classes['sub-menu']} relative ps-6`}
        style={{ height: subMenuHeight }}
      >
        <div className="absolute bottom-0 start-6 top-0 w-px bg-gray-300"></div>

        {expanded &&
          subMenu?.map((item, index) => {
            const isActive = pathname.includes(item.route ?? '');

            return (
              <li key={index} className="relative">
                {isActive && (
                  <div className="absolute -start-[0.26rem] top-1/2 z-10 h-2 w-2 -translate-y-1/2 transform rounded-full bg-green-500"></div>
                )}
                <SidebarItem {...item} expanded={expanded} />
              </li>
            );
          })}
      </ul>
    </div>
  );
}
