import { gql, useMutation } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { selectAccessToken } from "../auth/authSlice";
import { FULL_TAB_FIELDS } from "./tabFragments";
import { mergeTabs } from "./tabSlice";


const CREATE_TAB = gql`
  mutation CreateTab($accessToken: String!, $arrowId: String!, $i: Int, $isFrame: Boolean!, $isFocus: Boolean!) {
    createTab(accessToken: $accessToken, arrowId: $arrowId, i: $i, isFrame: $isFrame, isFocus: $isFocus) {
      ...FullTabFields
    }
  }
  ${FULL_TAB_FIELDS}
`;

const CREATE_TAB_BY_ROUTENAME = gql`
  mutation CreateTabByRouteName($accessToken: String!, $routeName: String!, $i: Int, $isFrame: Boolean!, $isFocus: Boolean!) {
    createTabByRouteName(accessToken: $accessToken, routeName: $routeName, i: $i, isFrame: $isFrame, isFocus: $isFocus) {
      ...FullTabFields
    }
  }
  ${FULL_TAB_FIELDS}
`

export default function useCreateTab() {
  const dispatch = useAppDispatch();

  const accessToken = useAppSelector(selectAccessToken);

  const [createByRouteName] = useMutation(CREATE_TAB_BY_ROUTENAME, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data  => {
      console.log(data);
      dispatch(mergeTabs(data.createTabByRouteName));
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

  const createTabByRouteName = (routeName: string, i: number | null, isFrame: boolean, isFocus: boolean) => {
    createByRouteName({
      variables: {
        accessToken,
        routeName,
        i,
        isFrame,
        isFocus,
      }
    });
  }

  const createTab = (arrowId: string, i: number | null, isFrame: boolean, isFocus: boolean) => {
    create({
      variables: {
        accessToken,
        arrowId,
        i,
        isFrame, 
        isFocus,
      }
    });
  }

  return { createTabByRouteName, createTab };
}