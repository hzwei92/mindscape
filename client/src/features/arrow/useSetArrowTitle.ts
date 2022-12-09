import { gql, useMutation } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { mergeArrows } from "./arrowSlice";


const SET_ARROW_TITLE = gql`
  mutation SetArrowTitle($arrowId: String!, $title: String!) {
    setArrowTitle(arrowId: $arrowId, title: $title) {
      id
      title
    }
  }
`;

export default function useSetArrowTitle() {
  const dispatch = useAppDispatch();

  const [setTitle] = useMutation(SET_ARROW_TITLE, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data  => {
      console.log(data);
      dispatch(mergeArrows([data.setArrowTitle]));
    }
  });

  const setArrowTitle = (arrowId: string, title: string) => {
    setTitle({
      variables: {
        arrowId,
        title,
      }
    });
  }

  return { setArrowTitle };
}