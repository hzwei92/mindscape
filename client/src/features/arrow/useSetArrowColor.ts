import { gql, useMutation } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { selectAccessToken } from "../auth/authSlice";
import { mergeArrows } from "./arrowSlice";


const SET_ARROW_COLOR = gql`
  mutation SetArrowColor($accessToken: String!, $arrowId: String!, $color: String!) {
    setArrowColor(accessToken: $accessToken, arrowId: $arrowId, color: $color) {
      id
      color
    }
  }
`;

export default function useSetArrowColor() {
  const dispatch = useAppDispatch();

  const accessToken = useAppSelector(selectAccessToken);

  const [setColor] = useMutation(SET_ARROW_COLOR, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data  => {
      console.log(data);
      dispatch(mergeArrows([data.setArrowColor]));
    }
  });

  const setArrowColor = (arrowId: string, color: string) => {
    setColor({
      variables: {
        accessToken,
        arrowId,
        color,
      }
    });
  }

  return { setArrowColor };
}