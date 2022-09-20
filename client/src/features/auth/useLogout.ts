import { gql, useApolloClient, useMutation } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { setLogout } from './authSlice';

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
    onCompleted: data => {
      console.log(data);
    }
  });

  const logoutUser = async () => {
    logout();
    dispatch(setLogout());
  }

  return { logoutUser };
}