import { gql, useMutation } from "@apollo/client";
import { useContext } from "react";
import { useAppDispatch } from "../../app/store";
import { SpaceContext } from "../space/SpaceComponent";
import { FULL_ROLE_FIELDS } from "./roleFragments";
import { mergeRoles } from "./roleSlice";
import { mergeRoles as mergeSpaceRoles } from '../space/spaceSlice';

const GET_ROLES_BY_ARROW_ID = gql`
  mutation GetRolesByArrowId($arrowId: String!) {
    getRolesByArrowId(arrowId: $arrowId) {
      ...FullRoleFields
    }
  }
  ${FULL_ROLE_FIELDS}
`;

export default function useGetRolesByArrowId() {
  const dispatch = useAppDispatch();

  const { abstractId } = useContext(SpaceContext);

  const [getRoles] = useMutation(GET_ROLES_BY_ARROW_ID, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeRoles(data.getRolesByArrowId));
      if (abstractId) {
        dispatch(mergeSpaceRoles({
          abstractId,
          roles: data.getRolesByArrowId
        }));
      }
    },
  });

  const getRolesByArrowId = (arrowId: string) => {
    getRoles({
      variables: {
        arrowId,
      }
    });
  }
  
  return { getRolesByArrowId };
}