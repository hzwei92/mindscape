import { gql, useMutation } from "@apollo/client";
import { useIonRouter } from "@ionic/react";
import { useAppDispatch } from "../../app/store";
import { Tab } from "./tab";
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
  mutation CreateTabByRouteName($routeName: String!, $i: Int, $isFrame: Boolean!, $isFocus: Boolean!) {
    createTabByRouteName(routeName: $routeName, i: $i, isFrame: $isFrame, isFocus: $isFocus) {
      ...FullTabFields
    }
  }
  ${FULL_TAB_FIELDS}
`

export default function useCreateTab() {
  const dispatch = useAppDispatch();

  const router = useIonRouter();

  const [createByRouteName] = useMutation(CREATE_TAB_BY_ROUTENAME, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data  => {
      console.log(data);
      dispatch(mergeTabs(data.createTabByRouteName));

      data.createTabByRouteName.forEach((tab: Tab) => {
        if (tab.isFocus) {
          router.push(`/g/${tab.arrow.routeName}`);
        }
      })
    }
  });

  const [create] = useMutation(CREATE_TAB, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data  => {
      console.log(data);
      dispatch(mergeTabs(data.createTab));

      data.createTab.forEach((tab: Tab) => {
        if (tab.isFocus) {
          router.push(`/g/${tab.arrow.routeName}`);
        }
      })
    }
  });

  const createTabByRouteName = (routeName: string, i: number | null, isFrame: boolean, isFocus: boolean) => {
    createByRouteName({
      variables: {
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
        arrowId,
        i,
        isFrame, 
        isFocus,
      }
    });
  }

  return { createTabByRouteName, createTab };
}