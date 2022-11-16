import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { mergeUsers } from "./userSlice";
import { useContext } from "react";
import { useAppDispatch, useAppSelector } from '../../app/store';
import { AppContext } from '../../app/App';
import { selectSessionId } from '../auth/authSlice';

const SET_PALETTE = gql`
  mutation SetUserPalette($sessionId: String!, $palette: String!) {
    setUserPalette(sessionId: $sessionId, palette: $palette) {
      id
      palette
    }
  }
`;

export default function useSetUserPalette() {
  const dispatch = useAppDispatch();

  const { setPalette } = useContext(AppContext);

  const sessionId = useAppSelector(selectSessionId);

  const [setPaletteMode] = useMutation(SET_PALETTE, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(mergeUsers([data.setUserPalette]));
    },
  });
  
  const setUserPalette = (palette: 'dark' | 'light') => {
    setPalette(palette === 'light'
      ? 'light'
      : 'dark');

    setPaletteMode({
      variables: {
        sessionId,
        palette,
      },
    });
  };

  return {
    setUserPalette,
  };
}