import { gql, useMutation } from '@apollo/client';
import { useAppDispatch } from '../../app/store';
import { LEAD_FIELDS } from './leadFragments';
import { mergeLeads } from './leadSlice';

const FOLLOW_USER = gql`
  mutation UnfollowUser($leadId: String!) {
    unfollowUser(leadId: $leadId) {
      ...LeadFields
    }
  }
  ${LEAD_FIELDS}
`;
export default function useUnfollowUser() {
  const dispatch = useAppDispatch();

  const [unfollow] = useMutation(FOLLOW_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(mergeLeads([data.unfollowUser]));
    },
  });

  const unfollowUser = (leadId: string) => {
    unfollow({
      variables: {
        leadId,
      }
    });
  }
  
  return { unfollowUser }
}