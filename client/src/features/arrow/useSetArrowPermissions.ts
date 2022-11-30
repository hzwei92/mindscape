import { gql, useMutation } from "@apollo/client";
import { useAppDispatch } from "../../app/store";
import { RoleType } from "../role/role";
import { mergeArrows } from "./arrowSlice";


const SET_ARROW_PERMISSIONS = gql`
  mutation SetArrowPermissions(
    $arrowId: String!, 
    $canAssignRoles: String, 
    $canEditLayout: String,
    $canPost: String
  ) {
    setArrowPermissions(
      arrowId: $arrowId,
      canAssignRoles: $canAssignRoles,
      canEditLayout: $canEditLayout,
      canPost: $canPost
    ) {
      id
      canAssignRoles
      canEditLayout
      canPost
    }
  }
`;

export default function useSetArrowPermissions() {
  const dispatch = useAppDispatch();

  const [setPermissions] = useMutation(SET_ARROW_PERMISSIONS, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data  => {
      console.log(data);
      dispatch(mergeArrows([data.setArrowPermissions]));
    }
  });

  const setArrowPermissions = (arrowId: string, canAssignRoles: RoleType | null, canEditLayout: RoleType | null, canPost: RoleType | null) => {
    setPermissions({
      variables: {
        arrowId,
        canAssignRoles,
        canEditLayout,
        canPost,
      }
    });
  }

  return { setArrowPermissions };
}