import { gql, useMutation } from "@apollo/client";
import { useAppDispatch } from "../../app/store";
import { FULL_TAB_FIELDS } from "./tabFragments";
import { mergeTabs } from "./tabSlice";


const CREATE_TAB = gql`
  mutation CreateTab($arrowId: String!, $i: Int, $isFrame: Boolean!, $isFocus: Boolean!) {
    createTab(arrowId: $arrowId, i: $i, isFrame: $isFrame, isFocus: $isFocus) {
      ...FullTabFields
    }
  }
  ${FULL_TAB_FIELDS}
`;

const CREATE_TAB_BY_ROUTENAME = gql`
  mutation CreateTabByRoutename($routename: String!, $i: Int, $isFrame: Boolean!, $isFocus: Boolean!) {
    createTabByRoutename(routename: $routename, i: $i, isFrame: $isFrame, isFocus: $isFocus) {
      ...FullTabFields
    }
  }
  ${FULL_TAB_FIELDS}
`

export default function useCreateTab() {
  const dispatch = useAppDispatch();

  const [createByRoutename] = useMutation(CREATE_TAB_BY_ROUTENAME, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data  => {
      console.log(data);
      dispatch(mergeTabs(data.createTabByRoutename));
    }
  });

  const [create] = useMutation(CREATE_TAB, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data  => {
      console.log(data);
      dispatch(mergeTabs(data.createTab));
    }
  });

  const createTabByRoutename = (routename: string, i: number | null, isFrame: boolean, isFocus: boolean) => {
    createByRoutename({
      variables: {
        routename,
        i,
        isFrame,
        isFocus,
      }
    });
  }

  const createTab = (arrowId: string, i: number | null, isFrame: boolean, isFocus: boolean) => {
    create({
      variables: {
        arrowId,
        i,
        isFrame, 
        isFocus,
      }
    });
  }

  return { createTabByRoutename, createTab };
}