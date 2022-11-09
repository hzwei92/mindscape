import { gql, useSubscription } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { IdToType } from "../../types";
import { Arrow } from "../arrow/arrow";
import { mergeArrows } from "../arrow/arrowSlice";
import { selectSessionId } from "../auth/authSlice";
import { ROLE_FIELDS } from "../role/roleFragments";
import { PosType, SpaceType } from "../space/space";
import { mergeIdToPos } from "../space/spaceSlice";
import { mergeUsers } from "../user/userSlice";
import { Twig } from "./twig";
import { FULL_TWIG_FIELDS } from "./twigFragments";
import { mergeTwigs } from "./twigSlice";

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


export default function useLinkTwigSub(space: SpaceType, abstract: Arrow | null) {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);

  useSubscription(LINK_TWIGS, {
    variables: {
      sessionId,
      abstractId: abstract?.id,
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

      dispatch(mergeUsers([user]));
      
      dispatch(mergeTwigs({
        space,
        twigs,
      }));

      dispatch(mergeArrows([abstract, source, target]));

      dispatch(mergeIdToPos({
        space,
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