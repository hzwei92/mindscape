import { gql, useApolloClient, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { setLogout } from './authSlice';
import { Preferences } from '@capacitor/preferences';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../constants';

const LOGOUT_USER = gql`
  mutation LogoutUser {
    logoutUser {
      id
    }
  }
`;

export default function useLogout() {
  const dispatch = useAppDispatch();

  const [logout] = useMutation(LOGOUT_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: async data => {
      console.log(data);
      await Preferences.remove({ key: ACCESS_TOKEN });
      await Preferences.remove({ key: REFRESH_TOKEN });
    }
  });

  const logoutUser = async () => {
    logout();
    dispatch(setLogout());
  }

  return { logoutUser };
}