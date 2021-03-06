import { useContext, useState } from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import { LogoutIcon, MenuIcon, TrashIcon } from '@heroicons/react/outline';
import { UserContext } from '@lib/context';
import NavbarNotificationsBadge from './Navbar.NotificationsBadge';
import NavbarDeleteUser from './Navbar.DeleteUser';

interface Props {
  toggleMobileSideBarOpen?: () => void;
}

const Navbar = ({ toggleMobileSideBarOpen }: Props) => {
  const { user, setUser } = useContext(UserContext);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const leave = () => {
    global.ipcRenderer.send('tcp-send', {
      protocol: 199,
    });

    setUser?.(null);
  };

  return (
    <header className="w-full relative z-10 flex-shrink-0 h-20 bg-white border-b border-gray-200 flex">
      <div className="flex-1 flex justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <IconButton
            className="h-12 w-12 lg:hidden"
            edge="start"
            onClick={toggleMobileSideBarOpen}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" />
          </IconButton>
          <div className="lg:w-[32rem]" />
        </div>
        {user && (
          <div className="ml-4 flex items-center sm:ml-6">
            <NavbarNotificationsBadge className="w-12 h-12" />
            <Tooltip title="Excluir Conta" arrow>
              <IconButton
                className="w-12 h-12 my-auto"
                onClick={() => setDeleteOpen(true)}
              >
                <TrashIcon className="h-6 w-6 text-gray-700" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sair" arrow>
              <IconButton className="w-12 h-12 my-auto" edge="end" onClick={leave}>
                <LogoutIcon className="h-6 w-6 text-gray-700" />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
      <NavbarDeleteUser
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onRemove={() => {
          if (user) {
            global.ipcRenderer.send('tcp-send', {
              protocol: 900,
              message: { username: user.username },
              required: ['username'],
            });

            setUser?.(null);
          }
        }}
      />
    </header>
  );
};

export default Navbar;
