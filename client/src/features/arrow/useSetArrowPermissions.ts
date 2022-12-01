import { gql, useMutation } from "@apollo/client";
import { useAppDispatch } from "../../app/store";
import { RoleType } from "../role/role";
import { mergeArrows } from "./arrowSlice";


const SET_ARROW_PERMISSIONS = gql`
  mutation SetArrowPermissions(
    $arrowId: String!, 
    $canAssignMemberRole: String, 
    $canEditLayout: String,
    $canPost: String
  ) {
    setArrowPermissions(
      arrowId: $arrowId,
      canAssignMemberRole: $canAssignMemberRole,
      canEditLayout: $canEditLayout,
      canPost: $canPost
    ) {
      id
      canAssignMemberRole
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

  const setArrowPermissions = (arrowId: string, permissions: any) => {
    const { canAssignMemberRole, canEditLayout, canPost } = permissions;
    setPermissions({
      variables: {
        arrowId,
        canAssignMemberRole,
        canEditLayout,
        canPost,
      }
    });
  }

  return { setArrowPermissions };
}