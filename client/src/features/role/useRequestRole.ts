import { gql, useMutation } from "@apollo/client";
import { useContext } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { selectSessionId } from "../auth/authSlice";
import { SpaceContext } from "../space/SpaceComponent";
import { RoleType } from "./role";
import { FULL_ROLE_FIELDS } from "./roleFragments";
import { mergeRoles } from "./roleSlice";
import { mergeRoles as mergeSpaceRoles } from "../space/spaceSlice";
const REQUEST_ROLE = gql`
  mutation RequestRole($sessionId: String!, $arrowId: String!, $type: String!) {
    requestRole(sessionId: $sessionId, arrowId: $arrowId, type: $type) {
      ...FullRoleFields
    }
  }
  ${FULL_ROLE_FIELDS}
`;

export default function useRequestRole(onCompleted?: () => void) {
  const dispatch = useAppDispatch();

  const { abstractId } = useContext(SpaceContext);

  const sessionId = useAppSelector(selectSessionId);

  const [request] = useMutation(REQUEST_ROLE, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeRoles([data.requestRole]));
      if (abstractId) {
        dispatch(mergeSpaceRoles({
          abstractId,
          roles: [data.requestRole]
        }));
      }
      onCompleted && onCompleted();
    },
  });

  const requestRole = (arrowId: string, type: RoleType) => {
    request({
      variables: {
        sessionId,
        arrowId,
        type,
      }
    });
  }

  return { requestRole };
}