import { gql, useSubscription } from "@apollo/client";
import { useIonToast } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { IdToType } from "../../types";
import { Arrow } from "../arrow/arrow";
import { mergeArrows } from "../arrow/arrowSlice";
import { selectSessionId } from "../auth/authSlice";
import { ROLE_FIELDS } from "../role/roleFragments";
import { PosType } from "../space/space";
import { mergeIdToPos, mergeTwigs } from "../space/spaceSlice";
import { mergeUsers } from "../user/userSlice";
import { Twig } from "./twig";
import { FULL_TWIG_FIELDS } from "./twigFragments";

const LINK_TWIGS = gql`
  subscription LinkTwigs($sessionId: String!, $abstractId: String!) {
    linkTwigs(sessionId: $sessionId, abstractId: $abstractId) {
      user {
        id
        balance
      }
      abstract {
        id
        twigN
        twigZ
      }
      twigs {
        ...FullTwigFields
      }
      source {
        id
        outCount
        sheaf {
          id
          outCount
        }
      }
      target {
        id
        inCount
        sheaf {
          id
          inCount
        }
      }
      role {
        ...RoleFields
      }
    }
  }
  ${FULL_TWIG_FIELDS}
  ${ROLE_FIELDS}
`;


export default function useLinkTwigSub(abstractId: string) {
  const dispatch = useAppDispatch();

  const [present] = useIonToast();

  const sessionId = useAppSelector(selectSessionId);

  useSubscription(LINK_TWIGS, {
    variables: {
      sessionId,
      abstractId,
    },
    shouldResubscribe: true,
    onSubscriptionData: ({subscriptionData: {data: {linkTwigs}}}) => {
      console.log(linkTwigs);

      const {
        user,
        abstract,
        source,
        target,
        twigs,
      } = linkTwigs;

      present(twigs.map((twig: Twig) => twig.i).join(', '), 500)

      dispatch(mergeUsers([user]));
      
      dispatch(mergeTwigs({
        abstractId,
        twigs,
      }));

      dispatch(mergeArrows([abstract, source, target]));

      dispatch(mergeIdToPos({
        abstractId,
        idToPos: twigs.reduce((acc: IdToType<PosType>, twig: Twig) => {
          acc[twig.id] = {
            x: twig.x,
            y: twig.y,
          };
          return acc;
        }, {}),
      }));
    },
  });
}