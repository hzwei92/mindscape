import { gql, useMutation } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { mergeArrows } from "./arrowSlice";


const SET_ARROW_COLOR = gql`
  mutation SetArrowColor($arrowId: String!, $color: String!) {
    setArrowColor(arrowId: $arrowId, color: $color) {
      id
      color
    }
  }
`;

export default function useSetArrowColor() {
  const dispatch = useAppDispatch();

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
        arrowId,
        color,
      }
    });
  }

  return { setArrowColor };
}