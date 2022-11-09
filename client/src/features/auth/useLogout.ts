import { gql, useApolloClient, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectAccessToken, setLogout } from './authSlice';
import { Preferences } from '@capacitor/preferences';
import { REFRESH_TOKEN } from '../../constants';

const LOGOUT_USER = gql`
  mutation LogoutUser($accessToken: String!) {
    logoutUser(accessToken: $accessToken) {
      id
    }
  }
`;

export default function useLogout() {
  const dispatch = useAppDispatch();

  const accessToken = useAppSelector(selectAccessToken);
  const [logout] = useMutation(LOGOUT_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
    }
  });

  const logoutUser = async () => {
    logout({
      variables: {
        accessToken,
      }
    });
    dispatch(setLogout());
    await Preferences.remove({ key: REFRESH_TOKEN })
  }

  return { logoutUser };
}