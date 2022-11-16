import { gql, useMutation } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { selectSessionId } from "../auth/authSlice";
import { RoleType } from "./role";
import { FULL_ROLE_FIELDS } from "./roleFragments";
import { mergeRoles } from "./roleSlice";

const REQUEST_ROLE = gql`
  mutation RequestRole($sessionId: String!, $arrowId: String!, $type: String!) {
    requestRole(sessionId: $sessionId, arrowId: $arrowId, type: $type) {
      ...FullRoleFields
    }
  }
  ${FULL_ROLE_FIELDS}
`;

export default function useRequestRole() {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);

  const [request] = useMutation(REQUEST_ROLE, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeRoles([data.requestRole]));
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