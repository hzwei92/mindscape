import { gql, useMutation } from "@apollo/client";
import { Preferences } from "@capacitor/preferences";
import { useIonRouter } from "@ionic/react";
import { useContext } from "react";
import { AppContext } from "../../app/App";
import { useAppDispatch } from "../../app/store";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import { MenuMode } from "../menu/menu";
import { Tab } from "../tab/tab";
import { FULL_USER_FIELDS } from "../user/userFragments";
import { setLogin } from "./authSlice";
import useToken from "./useToken";

const INIT_USER = gql`
  mutation InitUser($name: String!, $color: String!, $palette: String!) {
    initUser(name: $name, color: $color, palette: $palette) {
      user {
        ...FullUserFields
      }
      accessToken
      refreshToken
    }
  }
  ${FULL_USER_FIELDS}
`;

export default function useInitUser(onCompleted?: () => void) {
  const dispatch = useAppDispatch();

  const router = useIonRouter();

  const { setMenuMode } = useContext(AppContext);

  const { refreshTokenInterval } = useToken();

  const [init] = useMutation(INIT_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: async data => {
      console.log(data);

      await Preferences.set({
        key: ACCESS_TOKEN,
        value: data.initUser.accessToken,
      });

      await Preferences.set({ 
        key: REFRESH_TOKEN, 
        value: data.initUser.refreshToken
      });

      refreshTokenInterval();

      dispatch(setLogin(data.initUser.user));

      setMenuMode(MenuMode.ABOUT);

      data.initUser.user.tabs.some((t: Tab) => {
        if (t.isFocus) {
          router.push(`/g/${t.arrow.routeName}`);
          return true;
        }
        return false;
      })

      onCompleted && onCompleted();
    }
  });

  const initUser = (name: string, color: string, palette: string) => {
    init({
      variables: {
        name,
        color,
        palette
      }
    });
  };

  return { initUser };
}