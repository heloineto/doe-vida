import {
  CashIcon,
  LocationMarkerIcon,
  OfficeBuildingIcon,
  UserIcon,
} from '@heroicons/react/solid';
import { Button } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import receptorsSchema from './utils/receptorsSchema';

interface Props {}

const ReceptorList = (props: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [receptors, setReceptors] = useState<PendingUser[]>([]);

  // const handleClick = (username: string, receptor: number) => {
  //   global.ipcRenderer.send('tcp-send', {
  //     protocol: 510,
  //     message: {
  //       username,
  //       receptor,
  //     },
  //     required: ['username', 'receptor'],
  //   });

  //   global.ipcRenderer.send('tcp-send', {
  //     protocol: 400,
  //   });
  // };

  useEffect(() => {
    global.ipcRenderer.send('tcp-send', {
      protocol: 400,
    });

    const listener: (...args: any[]) => void = (_event, response) => {
      const { protocol, message } = response;

      if (protocol == 601) {
        const { list } = message;

        if (!list) {
          enqueueSnackbar('O servidor não retornou uma lista na mensagem', {
            variant: 'error',
          });
          return;
        }

        try {
          list.forEach((each: any) => receptorsSchema.validate(each));
          setReceptors(list);
        } catch (error) {
          enqueueSnackbar(
            'Um ou mais usuarios na lista retornada do servidor estão incorretos',
            { variant: 'error' }
          );
        }
      }
    };

    global.ipcRenderer.addListener('tcp-recieve', listener);

    return () => {
      global.ipcRenderer.removeListener('tcp-recieve', listener);
    };
  }, []);

  return (
    <div className="p-5">
      <div className="lg:flex lg:items-center lg:justify-between col-span-1 bg-white rounded-lg shadow p-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            name
          </h2>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <UserIcon
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              username
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <LocationMarkerIcon
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              state
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <OfficeBuildingIcon
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              city
            </div>
          </div>
        </div>
        <form className="mt-5 flex lg:mt-0 lg:ml-4">
          <Button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <CashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Doar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ReceptorList;
