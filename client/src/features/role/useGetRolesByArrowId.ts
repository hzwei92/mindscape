import { gql, useMutation } from "@apollo/client";
import { useAppDispatch } from "../../app/store";
import { FULL_ROLE_FIELDS } from "./roleFragments";
import { mergeRoles } from "./roleSlice";


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

  const [getRoles] = useMutation(GET_ROLES_BY_ARROW_ID, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeRoles(data.getRolesByArrowId));
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